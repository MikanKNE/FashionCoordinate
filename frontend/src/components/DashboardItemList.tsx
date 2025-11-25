// frontend/src/components/DashboardItemList.tsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import ItemCard from "./ItemCard";

export default function DashboardItemList() {
    const [items, setItems] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        import("../api/items").then(({ getItems }) => {
            getItems().then((res) => {
                const list = Array.isArray(res) ? res : res.data;
                setItems(list);
            });
        })
    }, []);

    const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
    const handleNext = () => setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1));

    if (items.length === 0) return <p>アイテムがありません</p>;

    const currentItem = items[currentIndex];

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-3">アイテム一覧</h2>
            <ItemCard item={currentItem} className="w-64"/>
            <div className="flex mt-4 gap-2">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                    ◁
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentIndex === items.length - 1}
                    className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                    ▷
                </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">{currentIndex + 1} / {items.length}</p>
        </div>
    );
}
