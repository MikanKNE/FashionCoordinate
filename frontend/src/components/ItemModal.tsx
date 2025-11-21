// src/components/ItemModal.tsx
import React, { useEffect, useState } from "react";
import { getItemDetail, deleteItem } from "../api/items";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";
import type { Item } from "../types";
import ItemForm from "./ItemForm";

interface Props {
    itemId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onItemUpdated?: () => void; // アイテム更新・削除後のリスト更新用
}

export default function ItemModal({ itemId, isOpen, onClose, onItemUpdated }: Props) {
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // --- アイテム詳細取得 ---
    const fetchItem = async (id: number) => {
        setLoading(true);
        try {
            const res = await getItemDetail(id);
            setItem(res?.data ?? null);
        } catch (e) {
            console.error(e);
            setItem(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!isOpen || itemId == null) return;
        fetchItem(itemId);
    }, [itemId, isOpen]);

    // --- 保存（編集フォーム） ---
    const handleSave = async (updated: Item) => {
        setIsEditing(false);
        setItem(updated);
        if (onItemUpdated) onItemUpdated();
        if (updated.item_id) await fetchItem(updated.item_id);
        toast.success("保存しました");
    };

    // --- 削除処理 ---
    const handleDelete = async () => {
        if (!item?.item_id) return;
        if (!confirm("本当に削除しますか？")) return;

        try {
            await deleteItem(item.item_id);
            toast.success("アイテムを削除しました");
            onClose();
            if (onItemUpdated) onItemUpdated();
        } catch (err) {
            console.error(err);
            toast.error("削除に失敗しました");
        }
    };

    // --- モーダル背景クリック ---
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg w-96 relative animate-fadeIn border border-gray-300 dark:border-white/20">
                {/* 閉じるボタン */}
                <button
                    className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"
                    onClick={onClose}
                >
                    ✕
                </button>

                {loading ? (
                    <p className="text-center text-gray-700 dark:text-gray-100">読み込み中...</p>
                ) : item ? (
                    !isEditing ? (
                        <>
                            {/* 画像 */}
                            <img
                                src={item.image_url || "/noimage.png"}
                                alt={item.name}
                                className="w-full h-48 object-cover rounded-md mb-4 border border-gray-200 dark:border-white/20"
                            />

                            {/* 名前 */}
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{item.name}</h2>

                            {/* 詳細情報 */}
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <p>カテゴリ: {item.category + "(" + item.subcategory_name + ")" || "未設定"}</p>
                                <p>使用回数: {item.wear_count ?? 0}</p>
                                <p>最終使用日: {item.last_used_date || "未使用"}</p>
                            </div>

                            {/* 編集 & 削除ボタン */}
                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={() => setIsEditing(true)}
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
                    ) : (
                        <ItemForm
                            item={item}
                            onClose={() => setIsEditing(false)}
                            onSave={handleSave}
                        />
                    )
                ) : (
                    <p>アイテムが見つかりません</p>
                )}
            </div>
        </div>
    );
}
