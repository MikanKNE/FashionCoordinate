// src/components/ItemDetailModal.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";
import type { Item } from "../types";

interface Props {
    itemId: number | null;
    onClose: () => void;
}

export default function ItemDetailModal({ itemId, onClose }: Props) {
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!itemId) return;

        const fetchItem = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("items")
                .select("*")
                .eq("item_id", itemId)
                .single();
            if (error) toast.error("アイテム取得失敗");
            else setItem(data);
            setLoading(false);
        };

        fetchItem();
    }, [itemId]);

    const handleToggleFavorite = async () => {
        if (!item) return;
        const newState = !item.is_favorite;
        const { error } = await supabase
            .from("items")
            .update({ is_favorite: newState })
            .eq("item_id", item.item_id);

        if (error) toast.error("お気に入り更新失敗");
        else setItem({ ...item, is_favorite: newState });
    };

    if (!itemId) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-96 relative">
                <button className="absolute top-3 right-3" onClick={onClose}>
                    ✕
                </button>

                {loading ? (
                    <p>読み込み中...</p>
                ) : item ? (
                    <>
                        <img
                            src={item.image_url || "/noimage.png"}
                            alt={item.name}
                            className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                        <h2>{item.name}</h2>
                        <p>{item.category}</p>
                        {item.description && <p>{item.description}</p>}

                        <div className="flex gap-2 mt-4">
                            <Button
                                onClick={handleToggleFavorite}
                                className={`flex-1 ${item.is_favorite ? "bg-pink-500" : "bg-gray-300"} text-white`}
                            >
                                {item.is_favorite ? "お気に入り解除" : "お気に入り追加"}
                            </Button>
                            <Button
                                onClick={() => toast.success("コーデに追加")}
                                className="flex-1 bg-blue-400 text-white"
                            >
                                コーデに追加
                            </Button>
                        </div>
                    </>
                ) : (
                    <p>アイテムが見つかりません</p>
                )}
            </div>
        </div>
    );
}
