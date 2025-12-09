// frontend/src/components/ItemCard.tsx
import { useEffect, useState } from "react";

import type { Item } from "../types";
import { API_BASE } from "../api";
import toast from "react-hot-toast";

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

    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!item?.item_id) return;

        let isMounted = true;

        const fetchSignedUrl = async () => {
            try {
                const res = await fetch(`${API_BASE}/items/${item.item_id}/image/`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json();

                if (isMounted) {
                    setImageUrl(data.url ?? null);
                }
            } catch (err) {
                console.error("Failed to load image:", err);
                if (isMounted) setImageUrl(null);
            }
        };

        fetchSignedUrl();

        return () => { isMounted = false };
    }, [item.item_id]);

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
                ${className ?? ""}
            `}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <div className="w-full mb-2">
                {imageUrl ? (
                    <img
                        src={imageUrl}
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
