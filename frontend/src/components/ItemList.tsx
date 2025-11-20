// src/components/ItemList.tsx
import type { Item } from "../types";
import ItemCard from "./ItemCard";
import Card from "./ui/Card";

type Props = {
    items: Item[];
    onItemClick: (id: number) => void;
    onEditClick: (item: Item) => void;
};

export default function ItemList({ items, onItemClick, onEditClick }: Props) {
    if (!items || items.length === 0) return <p>アイテムが登録されていません</p>;

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
                        onEdit={() => onEditClick(item)}
                    />
                ))}
            </div>
        </Card>
    );
}
