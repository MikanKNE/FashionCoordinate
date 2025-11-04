// src/components/ItemCard.tsx
import React, { useState } from "react";
import { Button } from "./ui/Button";
import type { Item } from "../types";
import ItemEditModal from "./ItemEditModal";
import ItemDetailModal from "./ItemDetailModal";

interface ItemCardProps {
    item: Item;
    selected?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, selected }) => {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleOpenDetail = () => {
        setIsEditOpen(false); // 他モーダルを閉じる
        setIsDetailOpen(true);
    };
    const handleOpenEdit = () => {
        setIsDetailOpen(false); // 他モーダルを閉じる
        setIsEditOpen(true);
    };

    return (
        <div
            className={`rounded-xl shadow-md p-3 cursor-pointer transition-transform transform hover:scale-105 
            ${selected ? "ring-2 ring-blue-500" : ""}`}
            style={{
                border: "1px solid #ddd",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                borderRadius: "12px",
                overflow: "hidden",
            }}
        >
            <div onClick={handleOpenDetail} style={{ width: "100%" }}>
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            display: "block",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "150px",
                            backgroundColor: "#f0f0f0",
                            borderRadius: "8px",
                            marginBottom: "8px",
                        }}
                    />
                )}
                <h3 className="text-lg font-semibold">{item.name}</h3>
                {item.category && <p className="text-sm text-gray-500">{item.category}</p>}
            </div>

            <Button
                onClick={handleOpenEdit}
                variant="primary"
                className="mt-2 w-full text-sm"
            >
                編集
            </Button>

            <ItemDetailModal
                itemId={item.item_id}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />
            <ItemEditModal
                item={item}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={(updatedItem) => console.log("保存:", updatedItem)}
            />
        </div>
    );
};

export default ItemCard;
