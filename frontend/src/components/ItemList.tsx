// src/components/ItemList.tsx
import Card from "./ui/Card";

import ItemCard from "./ItemCard";

import type { Item } from "../types";

type Props = {
    items: Item[];
    onItemClick: (id: number) => void;
};

export default function ItemList({ items, onItemClick }: Props) {
    if (!items || items.length === 0) return <p>該当するアイテムが登録されていません</p>;

    return (
        <Card className="m-6">
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
                        onClick={() => onItemClick(item.item_id)}
                    />
                ))}
            </div>
        </Card>
    );
}
