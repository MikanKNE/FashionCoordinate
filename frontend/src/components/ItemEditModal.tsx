// src/components/ItemDetailModal.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";
import type { Item } from "../types";

interface Props {
    itemId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (item: Item) => void;
}

export default function ItemDetailModal({ itemId, isOpen, onClose, onEdit }: Props) {
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchItem = async () => {
            if (!isOpen || !itemId) return;
            setLoading(true);
            const { data, error } = await supabase
                .from("items")
                .select("*")
                .eq("item_id", itemId)
                .single();

            if (error) {
                console.error("詳細取得エラー:", error);
                toast.error("アイテム詳細の取得に失敗しました");
            } else {
                setItem(data);
            }
            setLoading(false);
        };
        fetchItem();
    }, [itemId, isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
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
                        <img
                            src={item.image_url || "/noimage.png"}
                            alt={item.name}
                            className="w-full h-48 object-cover rounded-md mb-4"
                        />
                        <h2 className="text-xl font-semibold">{item.name}</h2>
                        {item.category && (
                            <p className="text-gray-500">{item.category}</p>
                        )}
                        <p className="mt-2 text-sm text-gray-600">ID: {item.item_id}</p>

                        <Button
                            variant="primary"
                            className="mt-4 w-full"
                            onClick={() => onEdit(item)}
                        >
                            編集
                        </Button>
                    </>
                ) : (
                    <p>アイテムが見つかりません</p>
                )}
            </div>
        </div>
    );
}
