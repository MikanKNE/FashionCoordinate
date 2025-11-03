import { useState } from "react";
import ItemDetailModal from "./ItemDetailModal";

type Item = {
    item_id: number;
    name: string;
    category?: string;
    image_url?: string;
    description?: string;
};

type Props = {
    items: Item[];
};

export default function ItemList({ items }: Props) {
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpen = (item: Item) => {
        setSelectedItemId(item.item_id);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setSelectedItemId(null);
        setIsModalOpen(false);
    };

    if (!items || items.length === 0) {
        return <p>アイテムが登録されていません。</p>;
    }

    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, 150px)",
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
                        onClick={() => handleOpen(item)}
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

            {/* 詳細モーダル */}
            <ItemDetailModal
                isOpen={isModalOpen}
                onClose={handleClose}
                itemId={selectedItemId}
            />
        </>
    );
}
