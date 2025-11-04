// src/components/ItemList.tsx
import React, { useState } from "react";
import type { Item } from "../types";
import ItemDetailModal from "./ItemDetailModal";

type Props = {
    items: Item[];
};

export default function ItemList({ items }: Props) {
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    const handleClose = () => setSelectedItemId(null);

    if (!items || items.length === 0) return <p>アイテムが登録されていません</p>;

    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "16px",
                }}
            >
                {items.map((item) => (
                    <div
                        key={item.item_id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "8px",
                            textAlign: "center",
                            cursor: "pointer",
                        }}
                        onClick={() => setSelectedItemId(item.item_id)}
                    >
                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                alt={item.name}
                                style={{ width: "100%", borderRadius: "6px" }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: "100%",
                                    height: "100px",
                                    backgroundColor: "#f0f0f0",
                                    borderRadius: "6px",
                                }}
                            />
                        )}
                        <p>{item.name}</p>
                        {item.category && <small>{item.category}</small>}
                    </div>
                ))}
            </div>

            <ItemDetailModal itemId={selectedItemId} onClose={handleClose} />
        </>
    );
}
