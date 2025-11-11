// src/components/ItemCard.tsx
import { Button } from "./ui/Button";
import type { Item } from "../types";

interface ItemCardProps {
    item: Item;
    // 親がどのように開くか決められるように、単純なコールバックにする（引数は親クロージャで捕まる）
    onClick?: () => void;
    onEdit?: () => void;
    selected?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick, onEdit, selected }) => {
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
            <div onClick={onClick} style={{ width: "100%" }}>
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

            {onEdit && (
                <Button onClick={onEdit} variant="primary" className="mt-2 w-full text-sm">
                    編集
                </Button>
            )}
        </div>
    );
};

export default ItemCard;
