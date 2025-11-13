import { useEffect, useState } from "react";
import { getItems } from "../api/items";
import ItemCard from "./ItemCard";

export default function DashboardItemList() {
    const [items, setItems] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        getItems()
            .then((res) => setItems(res.data || []))
            .catch(() => setItems([]));
    }, []);

    const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
    const handleNext = () => setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1));

    if (items.length === 0) {
        return <div className="p-4">アイテムがありません</div>;
    }

    const currentItem = items[currentIndex];

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-3">アイテム一覧</h2>
            <ItemCard item={currentItem} />
            <div className="flex mt-4 gap-2">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                    前へ
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentIndex === items.length - 1}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                    次へ
                </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
                {currentIndex + 1} / {items.length}
            </p>
        </div>
    );
}
