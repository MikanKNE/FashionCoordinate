// src/components/ItemModal.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";
import type { Item } from "../types";
import ItemForm from "./ItemForm";

interface Props {
    itemId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ItemModal({ itemId, isOpen, onClose }: Props) {
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchItem = async () => {
            if (!isOpen || itemId == null) return;
            setLoading(true);

            const { data, error } = await supabase
                .from("items")
                .select("*")
                .eq("item_id", itemId)
                .single();

            if (error) {
                console.error("アイテム取得エラー:", error);
                toast.error("アイテム詳細の取得に失敗しました");
                setItem(null);
            } else {
                setItem(data as Item);
            }

            setLoading(false);
        };

        fetchItem();
    }, [itemId, isOpen]);

    const handleSave = (updatedItem: Item) => {
        setItem(updatedItem);
        setIsEditing(false);
        toast.success("保存しました");
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div className="bg-white p-6 rounded-2xl shadow-lg w-96 relative animate-fadeIn">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                    onClick={onClose}
                >
                    ✕
                </button>

                {loading ? (
                    <p className="text-center">読み込み中...</p>
                ) : item ? (
                    <>
                        {!isEditing ? (
                            <>
                                <img
                                    src={item.image_url || "/noimage.png"}
                                    alt={item.name}
                                    className="w-full h-48 object-cover rounded-md mb-4"
                                />
                                <h2 className="text-xl font-semibold">{item.name}</h2>
                                {item.category && <p className="text-gray-500">{item.category}</p>}
                                <p className="mt-2 text-sm text-gray-600">ID: {item.item_id}</p>

                                <Button
                                    variant="primary"
                                    className="mt-4 w-full"
                                    onClick={() => setIsEditing(true)}
                                >
                                    編集
                                </Button>
                            </>
                        ) : (
                            // 編集フォームモーダル（手前に表示）
                            <ItemForm
                                item={item}
                                onClose={() => setIsEditing(false)}
                                onSave={handleSave}
                            />
                        )}
                    </>
                ) : (
                    <p>アイテムが見つかりません</p>
                )}
            </div>
        </div>
    );
}
