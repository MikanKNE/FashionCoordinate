// frontend/src/components/DashboardItemList.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemCard from "./ItemCard";
import ItemDetailModal from "./ItemDetailModal";
import { getItems } from "../api/items";

function shuffleArray<T>(array: T[]): T[] {
    const copied = [...array];
    for (let i = copied.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copied[i], copied[j]] = [copied[j], copied[i]];
    }
    return copied;
}

export default function DashboardItemList() {
    const [items, setItems] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const DISPLAY_COUNT = 10;    // 表示個数を制限

    useEffect(() => {
        const fetchItems = async () => {
            const res = await getItems();
            const list = Array.isArray(res) ? res : res.data;
            // シャッフル
            const shuffled = shuffleArray(list);

            setItems(shuffled.slice(0, DISPLAY_COUNT));
        };
        fetchItems();
    }, []);

    const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
    const handleNext = () => setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1));

    const currentItem = items[currentIndex];

    return (
        <div className="space-y-4">
            <h2
                className="text-lg font-semibold mb-3 flex items-center gap-1
                    cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => navigate("/item-list")}
            >
                アイテム一覧
                <span className="text">＞</span>
            </h2>

            <div className="flex flex-col gap-4 items-center">
                {items.length > 0 && (
                    <>
                        <ItemCard
                            item={currentItem}
                            className="w-64"
                            onClick={() => {
                                setSelectedItemId(currentItem.item_id);
                                setIsModalOpen(true);
                            }}
                        />

                        <div className="flex mt-4 gap-2">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-slate-700"
                            >
                                ◁
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={currentIndex === items.length - 1}
                                className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-slate-700"
                            >
                                ▷
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mt-2">
                            {currentIndex + 1} / {items.length}
                        </p>
                    </>
                )}
            </div>

            {items.length === 0 && (
                <p className="text-gray-500 w-full">
                    アイテムはまだ登録されていません
                </p>
            )}
            <ItemDetailModal
                itemId={selectedItemId}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedItemId(null);
                }}
                showActions={false}
            />
        </div>

    );
}
