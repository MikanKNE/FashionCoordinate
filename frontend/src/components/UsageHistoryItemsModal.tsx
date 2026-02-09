// frontend/src/components/UsageHistoryItemsModal.tsx
import type { Item } from "../types";
import ItemCard from "./ItemCard";

interface Props {
    date: string;
    items: Item[];
    isOpen: boolean;
    onClose: () => void;
}

export default function UsageHistoryItemsModal({
    date,
    items,
    isOpen,
    onClose,
}: Props) {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center
                        bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg
                            w-1/2 relative animate-fadeIn
                            border border-gray-300 dark:border-white/20"
            >
                {/* 閉じる */}
                <button
                    className="absolute top-3 right-3 text-gray-500
                                hover:text-black dark:hover:text-white"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold mb-4">
                    {date} の服装
                </h2>

                <div className="grid grid-cols-3 gap-2">
                    {items.length > 0 ? (
                        items.map(item => (
                            <ItemCard
                                key={item.item_id}
                                item={item}
                                compact
                                disableHover
                            />
                        ))
                    ) : (
                        <p className="text-gray-400 col-span-3 text-center">
                            アイテムなし
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
