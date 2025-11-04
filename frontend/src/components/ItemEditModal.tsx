// src/components/ItemEditModal.tsx
import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import type { Item } from "../types";

interface Props {
    item: Item | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedItem: Item) => void;
}

export default function ItemEditModal({ item, isOpen, onClose, onSave }: Props) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        if (item) {
            setName(item.name);
            setCategory(item.category || "");
            setImageUrl(item.image_url || "");
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSave = () => {
        onSave({
            ...item,
            name,
            category,
            image_url: imageUrl,
        });
        onClose();
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
                <h2 className="text-xl font-semibold mb-4">アイテム編集</h2>

                <label className="block mb-2">
                    名前
                    <input
                        className="w-full border rounded px-2 py-1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>

                <label className="block mb-2">
                    カテゴリ
                    <input
                        className="w-full border rounded px-2 py-1"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </label>

                <label className="block mb-4">
                    画像URL
                    <input
                        className="w-full border rounded px-2 py-1"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                </label>

                <div className="flex justify-between">
                    <Button variant="secondary" onClick={onClose}>キャンセル</Button>
                    <Button variant="primary" onClick={handleSave}>保存</Button>
                </div>
            </div>
        </div>
    );
}
