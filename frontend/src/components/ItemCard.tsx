// frontend/src/components/ItemCard.tsx
import type { Item } from "../types";
import { ItemImage } from "./ItemImage";

interface ItemCardProps {
    item: Item;
    onClick?: () => void;
    selected?: boolean;
    compact?: boolean;
    disableHover?: boolean;
    className?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
    item,
    onClick,
    selected = false,
    compact = false,
    disableHover = false,
    className = "",
}) => {
    return (
        <div
            onClick={onClick}
            className={`relative rounded-2xl shadow-md transition-all cursor-pointer 
                ${disableHover ? "" : "hover:scale-[1.03] hover:shadow-lg"}
                bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
                ${selected
                    ? "ring-2 ring-blue-400 dark:ring-blue-300"
                    : "border border-gray-200 dark:border-gray-500/70"
                }
                ${compact ? "p-2" : "p-3"}
                ${className}
            `}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            {/* 画像 */}
            <div className="w-full mb-2">
                <ItemImage
                    itemId={item.item_id}
                    alt={item.name}
                    className={`w-full rounded-xl object-cover ${compact ? "h-24" : "h-36"}`}
                />
            </div>

            {/* テキスト */}
            <h3 className={`font-medium ${compact ? "text-sm" : "text-base"}`}>
                {item.name}
                <span className="text-yellow-400 text-2xl">
                    {item.is_favorite ? "★" : ""}
                </span>
            </h3>

            {item.category && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.category}
                </p>
            )}
        </div>
    );
};

export default ItemCard;
