// src/components/ItemList.tsx
import React from "react";
import type { Item } from "../types";
import ItemCard from "./ItemCard";

type Props = {
    items: Item[];
    // id を直接渡すより親で制御するので onItemClick は id を受け取る形
    onItemClick: (id: number) => void;
    onEditClick: (item: Item) => void;
};

export default function ItemList({ items, onItemClick, onEditClick }: Props) {
    if (!items || items.length === 0) return <p>アイテムが登録されていません</p>;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "16px",
            }}
        >
            {items.map((item: Item) => (
                <ItemCard
                    key={item.item_id}
                    item={item}
                    // 親の関数はここでクロージャを作って必要情報を捕まえる（これで型が一致する）
                    onClick={() => onItemClick(item.item_id)}
                    onEdit={() => onEditClick(item)}
                />
            ))}
        </div>
    );
}
