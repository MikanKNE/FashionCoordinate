import React from "react";

export interface Item {
    id: number;
    name: string;
    category: string;
    imageUrl: string;
}

interface ItemCardProps {
    item: Item;
    onClick?: (item: Item) => void;
    selected?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick, selected }) => {
    return (
        <div
            onClick={() => onClick && onClick(item)}
            className={`rounded-xl shadow-md p-3 cursor-pointer transition-transform transform hover:scale-105 
                ${selected ? "ring-2 ring-blue-500" : ""}`}
        >
            <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-40 object-cover rounded-md"
            />
            <div className="mt-2">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
            </div>
        </div>
    );
};

export default ItemCard;
