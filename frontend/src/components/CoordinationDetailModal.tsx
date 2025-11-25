// src/components/CoordinationDetailModal.tsx
import { useEffect, useState } from "react";
import { getCoordination } from "../api/coordinations";
import { getAllCoordinationItems } from "../api/coordination_items";
import { getItems } from "../api/items";
import { Button } from "./ui/Button";
import ItemCard from "./ItemCard";
import toast from "react-hot-toast";
import type { Coordination, CoordinationItem, Item } from "../types";
import { useNavigate } from "react-router-dom";

interface Props {
    coordination: Coordination;
    isOpen: boolean;
    onClose: () => void;
}

export default function CoordinationDetailModal({ coordination, isOpen, onClose }: Props) {
    const [detail, setDetail] = useState<Coordination | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchDetail = async () => {
        setLoading(true);
        try {
            // コーディネーション本体取得
            const res = await getCoordination(coordination.coordination_id);
            const data = res?.data ?? { ...coordination, items: [] };

            // 中間テーブルからアイテム取得
            const ciRes = await getAllCoordinationItems();
            const ciList: CoordinationItem[] = ciRes?.data?.filter(
                (ci: CoordinationItem) => ci.coordination_id === coordination.coordination_id
            ) ?? [];

            // アイテム全件取得
            const itemsRes = await getItems();
            const itemsMap = new Map<number, Item>();
            itemsRes?.data?.forEach((item: Item) => itemsMap.set(item.item_id, item));

            // 中間テーブルと紐付け
            const items: Item[] = ciList
                .map((ci: CoordinationItem) => itemsMap.get(ci.item_id))
                .filter(Boolean) as Item[];

            setDetail({ ...data, items });
        } catch (e) {
            console.error(e);
            toast.error("詳細の取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        fetchDetail();
    }, [isOpen]);

    const handleDelete = async () => {
        if (!confirm("本当に削除しますか？")) return;
        try {
            await fetch(`/api/coordinations/${coordination.coordination_id}`, {
                method: "DELETE",
            });
            toast.success("削除しました");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("削除に失敗しました");
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center
                        bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg
                            w-96 relative animate-fadeIn border border-gray-300 dark:border-white/20"
            >
                {/* 閉じるボタン */}
                <button
                    className="absolute top-3 right-3 text-gray-500 dark:text-gray-300
                                hover:text-black dark:hover:text-white"
                    onClick={onClose}
                >
                    ✕
                </button>

                {loading || !detail ? (
                    <p className="text-center text-gray-700 dark:text-gray-100">読み込み中...</p>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {detail.name}
                            <span className="text-yellow-500">{detail.is_favorite ? "★" : "☆"}</span>
                        </h2>

                        {/* アイテム一覧 */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {detail.items.length ? (
                                detail.items.map(item => (
                                    <ItemCard
                                        key={item.item_id}
                                        item={item}
                                        compact={true}
                                        disableHover={true}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-400 mt-2 col-span-2 text-center">アイテムなし</p>
                            )}
                        </div>


                        {/* ボタン */}
                        <div className="flex gap-2 mt-5">
                            <Button
                                className="flex-1"
                                onClick={() =>
                                    navigate(`/coordination/${detail.coordination_id}/edit`)
                                }
                            >
                                編集
                            </Button>
                            <Button
                                variant="danger"
                                className="flex-1"
                                onClick={handleDelete}
                            >
                                削除
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
