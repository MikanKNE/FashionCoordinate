// src/components/CoordinationDetailModal.tsx
import { useEffect, useState } from "react";
import { getCoordination, deleteCoordination } from "../api/coordinations";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";

interface Props {
    coordination: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function CoordinationDetailModal({ coordination, isOpen, onClose }: Props) {
    const [detail, setDetail] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await getCoordination(coordination.coordination_id);
            setDetail(res?.data ?? null);
        } catch (e) {
            console.error(e);
            toast.error("詳細の取得に失敗しました");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!isOpen) return;
        fetchDetail();
    }, [isOpen]);

    const handleDelete = async () => {
        if (!confirm("本当に削除しますか？")) return;

        try {
            await deleteCoordination(coordination.coordination_id);
            toast.success("削除しました");
            onClose();
        } catch (e) {
            console.error(e);
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
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {detail.name}{detail.is_favorite ? "⭐" : "☆"}
                        </h2>

                        {/* アイテム一覧（サムネイル） */}
                        <div className="mt-4">
                            <p className="font-semibold mb-2">含まれるアイテム</p>
                            <div className="grid grid-cols-3 gap-2">
                                {detail.items?.map((it: any) => (
                                    <img
                                        key={it.item_id}
                                        src={it.image_url || "/noimage.png"}
                                        alt={it.name}
                                        className="w-full h-20 object-cover rounded-md border
                                                    border-gray-200 dark:border-white/10"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* ボタン */}
                        <div className="flex gap-2 mt-5">
                            <Button variant="danger" className="flex-1" onClick={handleDelete}>
                                削除
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() =>
                                    (window.location.href = `/coordination/${detail.coordination_id}/edit`)
                                }
                            >
                                編集
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
