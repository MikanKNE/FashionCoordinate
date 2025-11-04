// src/components/ItemList.tsx
import React from "react";
import type { Item } from "../types";
import ItemCard from "./ItemCard";

type Props = {
    items: Item[];
};

export default function ItemList({ items }: Props) {
    if (!items || items.length === 0) return <p>アイテムが登録されていません</p>;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "16px",
            }}
        >
            {items.map((item) => (
                <ItemCard key={item.item_id} item={item} />
            ))}
        </div>
    );
}
