// src/components/CoordinationDetailModal.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getAllCoordinationItems } from "../api/coordination_items";
import { getCoordination, deleteCoordination } from "../api/coordinations";
import { getItems } from "../api/items";

import { Button } from "./ui/Button";
import ItemCard from "./ItemCard";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

import type { Coordination, CoordinationItem, Item } from "../types";

interface Props {
    coordination: Coordination;
    isOpen: boolean;
    onClose: () => void;
    onDeleted?: () => void;
}

export default function CoordinationDetailModal({
    coordination,
    isOpen,
    onClose,
    onDeleted,
}: Props) {
    const [detail, setDetail] = useState<(Coordination & { items: Item[] }) | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const navigate = useNavigate();

    // =========================
    // 詳細取得
    // =========================
    const fetchDetail = async () => {
        setLoading(true);
        try {
            // ① コーディネート本体
            const res = await getCoordination(coordination.coordination_id);
            const base: Coordination = res?.data ?? coordination;

            // ② 中間テーブル
            const ciRes = await getAllCoordinationItems();
            const ciList: CoordinationItem[] =
                (ciRes?.data as CoordinationItem[])?.filter(
                    (ci: CoordinationItem) =>
                        ci.coordination_id === coordination.coordination_id
                ) ?? [];

            // ③ アイテム一覧（※ 配列）
            const items: Item[] = await getItems();
            const itemsMap = new Map<number, Item>();
            items.forEach(item => {
                itemsMap.set(item.item_id, item);
            });

            // ④ 紐付け
            const linkedItems: Item[] = ciList
                .map(ci => itemsMap.get(ci.item_id))
                .filter(Boolean) as Item[];

            setDetail({
                ...base,
                items: linkedItems,
            });
        } catch (e) {
            console.error(e);
            toast.error("詳細の取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchDetail();
        }
    }, [isOpen]);

    // =========================
    // 削除
    // =========================
    const confirmDelete = async () => {
        try {
            await deleteCoordination(coordination.coordination_id);
            toast.success("削除しました");
            onDeleted?.();
            setDeleteModalOpen(false);
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
                {/* 閉じる */}
                <button
                    className="absolute top-3 right-3 text-gray-500
                               hover:text-black dark:hover:text-white"
                    onClick={onClose}
                >
                    ✕
                </button>

                {loading || !detail ? (
                    <p className="text-center">読み込み中...</p>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            {detail.name}
                            <span className="text-yellow-500">
                                {detail.is_favorite ? "★" : "☆"}
                            </span>
                        </h2>

                        {/* アイテム */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {detail.items.length > 0 ? (
                                detail.items.map(item => (
                                    <ItemCard
                                        key={item.item_id}
                                        item={item}
                                        compact
                                        disableHover
                                    />
                                ))
                            ) : (
                                <p className="text-gray-400 col-span-2 text-center">
                                    アイテムなし
                                </p>
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
                                onClick={() => setDeleteModalOpen(true)}
                            >
                                削除
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                title="コーディネートを削除しますか？"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalOpen(false)}
            />
        </div>
    );
}
