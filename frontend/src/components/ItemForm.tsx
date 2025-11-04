// src/components/ItemForm.tsx
import React, { useState, useEffect } from "react";
import type { Item } from "../types";
import { createItem, updateItem } from "../api/items";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";

interface ItemFormProps {
    item?: Item; // 編集時のみ渡す
    onClose: () => void;
    onSave: (item: Item) => void;
}

export default function ItemForm({ item, onClose, onSave }: ItemFormProps) {
    const [name, setName] = useState(item?.name || "");
    const [category, setCategory] = useState(item?.category || "");
    const [image_url, setImageUrl] = useState(item?.image_url || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (item) {
                // 編集
                const updated = await updateItem(item.item_id, { name, category, image_url });
                onSave(updated);
                toast.success("アイテムを更新しました");
            } else {
                // 新規追加
                const created = await createItem({ name, category, image_url });
                onSave(created);
                toast.success("アイテムを追加しました");
            }
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("保存に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-96 relative">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h2 className="text-xl font-semibold mb-4">{item ? "アイテム編集" : "アイテム追加"}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="名前"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="カテゴリ"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border p-2 rounded"
                    />
                    <input
                        type="text"
                        placeholder="画像URL"
                        value={image_url}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="border p-2 rounded"
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "保存中..." : "保存"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
