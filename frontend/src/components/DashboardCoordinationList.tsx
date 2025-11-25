// frontend/src/components/DashboardCoordinationList.tsx
import { useEffect, useState } from "react";
import { getCoordinations } from "../api/coordinations";
import { getAllCoordinationItems } from "../api/coordination_items";
import type { Coordination, Item, CoordinationItem } from "../types";

export default function DashboardCoordinationList() {
    const [coordinations, setCoordinations] = useState<Coordination[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getCoordinations();
                const coordinationList: Coordination[] = Array.isArray(res) ? res : res.data;
                const top3 = coordinationList.slice(0, 3);

                const allCoordItemsRes = await getAllCoordinationItems();
                const allCoordItems: CoordinationItem[] = allCoordItemsRes.data;

                const itemsByCoordId: Record<number, Item[]> = {};
                allCoordItems.forEach((ci) => {
                    if (!itemsByCoordId[ci.coordination_id]) itemsByCoordId[ci.coordination_id] = [];
                    itemsByCoordId[ci.coordination_id].push(
                        ci.item ?? {
                            item_id: ci.item_id,
                            name: "No Name",
                            category: "",
                            season_tag: [],
                            tpo_tags: [],
                            is_favorite: false,
                        } as Item
                    );
                });

                const listWithItems: Coordination[] = top3.map((c) => ({
                    ...c,
                    items: itemsByCoordId[c.coordination_id] || [],
                }));

                setCoordinations(listWithItems);
            } catch (err) {
                console.error("コーディネーション取得エラー:", err);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-3">コーディネート一覧</h2>

            <div className="flex flex-col gap-4">
                {coordinations.map((c) => (
                    <div
                        key={c.coordination_id}
                        className="relative rounded-2xl shadow-md bg-white dark:bg-gray-800 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-lg p-3 flex flex-col gap-2"
                    >
                        {/* 名前とお気に入り */}
                        <h3 className="font-medium text-base">
                            {c.name}
                            {c.is_favorite && (
                                <span className="text-yellow-500 ml-1">★</span>
                            )}
                        </h3>

                        {/* 名前の横にアイテム画像 */}
                        <div className="flex items-center gap-2">
                            {c.items.slice(0, 3).map((item) => (
                                <div
                                    key={item.item_id}
                                    className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                                >
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {coordinations.length === 0 && (
                <p className="text-gray-500">コーディネートはまだ登録されていません</p>
            )}
        </div>
    );
}
