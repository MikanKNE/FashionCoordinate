// frontend/src/components/ItemForm.tsx
import React, { useState } from "react";
import ReactDOM from "react-dom";
import type { Item } from "../types";
import { createItem, updateItem } from "../api/items";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";

interface ItemFormProps {
    item?: Item;
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
                const updated = await updateItem(item.item_id, { name, category, image_url });
                onSave(updated.data);
                toast.success("アイテムを更新しました");
            } else {
                const created = await createItem({ name, category, image_url });
                onSave(created.data);
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

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-96 mx-4 p-6 relative
                transform transition-all duration-300 ease-out
                animate-fadeInModal text-gray-900 dark:text-gray-100">

                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-black dark:hover:text-white"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold mb-4">
                    {item ? "アイテム編集" : "アイテム追加"}
                </h2>

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
                    <Button type="submit" disabled={loading} variant="primary">
                        {loading ? "保存中..." : "保存"}
                    </Button>
                </form>
            </div>
        </div>,
        document.body
    );
}
