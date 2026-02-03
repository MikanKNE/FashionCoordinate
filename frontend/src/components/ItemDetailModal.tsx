// frontend/src/components/ItemDetailModal.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getItemDetail, deleteItem } from "../api/items";

import { Button } from "./ui/Button";

import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { ItemImage } from "./ItemImage";

import type { Item } from "../types";

import { API_BASE } from "../api/index";

interface Props {
    itemId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onItemUpdated?: () => void;
}

export default function ItemDetailModal({ itemId, isOpen, onClose, onItemUpdated }: Props) {
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    // アイテム詳細取得
    const fetchItem = async (id: number): Promise<Item | null> => {
        setLoading(true);
        try {
            const data = await getItemDetail(id);
            setItem(data ?? null);
            return data ?? null;
        } catch (e) {
            console.error(e);
            setItem(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || itemId == null) return;

        const loadData = async () => {
            const detail = await fetchItem(itemId);
            if (!detail) return;

            // detail.item_id が確実に存在してから image API を叩く
            const res = await fetch(`${API_BASE}/items/${detail.item_id}/image/`, {
                method: "GET",
                credentials: "include",
            });

            const data = await res.json();
            setImageUrl(data.url ?? null);
        };

        loadData();
    }, [itemId, isOpen]);

    // 削除処理
    const handleDelete = async () => {
        if (!item?.item_id) return;

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

    // クリックで閉じる処理
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* 背景オーバーレイ */}
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
                        <p className="text-center text-gray-700 dark:text-gray-100">
                            読み込み中...
                        </p>
                    ) : item ? (
                        <>
                            {/* 画像 */}
                            <div className="w-full mb-3 flex justify-center">
                                {imageUrl ? (
                                    <ItemImage
                                        itemId={item.item_id}
                                        alt={item.name}
                                        className="w-64 h-64 rounded-xl"
                                    />
                                ) : (
                                    <div className="w-64 h-64 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* タイトル */}
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                {item.name}
                                <span className="text-yellow-400 text-2xl">
                                    {item.is_favorite ? "⭐" : "☆"}
                                </span>
                            </h2>

                            {/* 詳細情報 */}
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <p>カテゴリ: {item.category || "未設定"} [ {item.subcategories?.name || "未設定"} ]</p>
                                <p>保存場所: {item.storages?.storage_location || "未設定"}</p>
                                <p>シーズン: {item.season_tag.length > 0 ? item.season_tag.join(", ") : "未設定"}</p>
                                <p>TPO: {item.tpo_tags.length > 0 ? item.tpo_tags.join(", ") : "未設定"}</p>
                                <p>カラー: {item.color || "未設定"}</p>
                                <p>素材: {item.material || "未設定"}</p>
                                <p>柄: {item.pattern || "未設定"}</p>

                                <p>
                                    使用回数: <span className="font-medium">{item.wear_count}</span> 回
                                </p>

                                <p>
                                    最終使用日:{" "}
                                    {item.last_used_date
                                        ? item.last_used_date
                                        : "未使用"}
                                </p>

                                <p className="flex items-center gap-2">
                                    ステータス:
                                    <span
                                        className={`px-2 py-0.5 rounded text-xs font-medium
                                            ${item.status === "discard"
                                                ? "bg-red-100 text-red-700"
                                                : item.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {item.status === "discard"
                                            ? "処分予定"
                                            : item.status === "pending"
                                                ? "保留中"
                                                : "使用中"}
                                    </span>
                                </p>
                            </div>

                            {/* ボタン */}
                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={() => navigate(`/items/${item.item_id}/edit`)}
                                >
                                    編集
                                </Button>

                                <Button
                                    variant="danger"
                                    className="flex-1"
                                    onClick={() => setShowConfirm(true)}
                                >
                                    削除
                                </Button>
                            </div>
                        </>
                    ) : (
                        <p>アイテムが見つかりません</p>
                    )}
                </div>
            </div>

            {/* 削除モーダル */}
            <ConfirmDeleteModal
                isOpen={showConfirm}
                title="本当に削除しますか？"
                onConfirm={async () => {
                    await handleDelete();
                    setShowConfirm(false);
                }}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    );
}