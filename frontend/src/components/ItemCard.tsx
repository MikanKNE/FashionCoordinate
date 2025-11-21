// frontend/src/components/ItemCard.tsx
import { Button } from "./ui/Button";
import type { Item } from "../types";

interface ItemCardProps {
    item: Item;
    onClick?: () => void;
    selected?: boolean;
    compact?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({
    item,
    onClick,
    selected = false,
    compact = false,
}) => {
    return (
        <div
            onClick={onClick}
            className={`relative rounded-2xl shadow-md transition-all cursor-pointer 
                hover:scale-[1.03] hover:shadow-lg
                bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
                ${selected
                    ? "ring-2 ring-blue-400 dark:ring-blue-300"
                    : "border border-gray-200 dark:border-gray-500/70"
                }
                ${compact ? "p-2" : "p-3"}
            `}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <div className="w-full mb-2">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className={`w-full object-cover rounded-xl ${compact ? "h-24" : "h-36"}`}
                    />
                ) : (
                    <div
                        className={`w-full ${compact ? "h-24" : "h-36"} rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-sm`}
                    >
                        No Image
                    </div>
                )}
            </div>

            <h3 className={`font-medium ${compact ? "text-sm" : "text-base"}`}>{item.name}</h3>
            {item.category && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.category}
                </p>
            )}
        </div>
    );
};

export default ItemCard;
