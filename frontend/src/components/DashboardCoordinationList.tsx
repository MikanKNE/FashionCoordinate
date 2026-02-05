// frontend/src/components/DashboardCoordinationList.tsx
import { useEffect, useState } from "react";
import { getAllCoordinationItems } from "../api/coordination_items";
import { getCoordinations } from "../api/coordinations";
import type { Coordination, Item, CoordinationItem } from "../types";
import { ItemImage } from "./ItemImage";
import { useNavigate } from "react-router-dom";

export default function DashboardCoordinationList() {
    const [coordinations, setCoordinations] = useState<Coordination[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getCoordinations();
                const coordinationList: Coordination[] = Array.isArray(res)
                    ? res
                    : res.data;

                const top3 = coordinationList.slice(0, 3);

                const allCoordItemsRes = await getAllCoordinationItems();
                const allCoordItems: CoordinationItem[] =
                    allCoordItemsRes.data;

                const itemsByCoordId: Record<number, Item[]> = {};

                allCoordItems.forEach((ci) => {
                    const item: Item =
                        ci.item ?? {
                            item_id: ci.item_id,
                            user_id: "unknown",
                            name: "No Name",
                            category: "",
                            season_tag: [],
                            tpo_tags: [],
                            color: "",
                            material: "",
                            pattern: "",
                            is_favorite: false,
                            status: "active",
                            wear_count: 0,
                            last_used_date: null,
                        };

                    if (!itemsByCoordId[ci.coordination_id]) {
                        itemsByCoordId[ci.coordination_id] = [];
                    }

                    itemsByCoordId[ci.coordination_id].push(item);
                });

                const listWithItems: Coordination[] = top3.map((c) => ({
                    ...c,
                    items: itemsByCoordId[c.coordination_id] || [],
                }));

                setCoordinations(listWithItems);
            } catch (err) {
                console.error("コーディネート取得エラー:", err);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-4">
            <h2
                className="text-lg font-semibold mb-3 flex items-center gap-1
               cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => navigate("/coordination-list")}
            >
                コーディネート一覧
                <span className="text">＞</span>
            </h2>

            <div className="flex flex-col gap-4">
                {coordinations.map((c) => (
                    <div
                        key={c.coordination_id}
                        className="relative rounded-2xl shadow-md bg-white dark:bg-gray-800 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-lg p-3 flex flex-col gap-2"
                        onClick={() =>
                            navigate("/coordination-list", {
                                state: { openCoordinationId: c.coordination_id },
                            })
                        }
                    >
                        {/* 名前とお気に入り */}
                        <h3 className="font-medium text-base">
                            {c.name}
                            {c.is_favorite && (
                                <span className="text-yellow-500 ml-1">
                                    ★
                                </span>
                            )}
                        </h3>

                        {/* アイテム画像 */}
                        <div className="flex items-center gap-2">
                            {c.items.slice(0, 3).map((item) => (
                                <ItemImage
                                    key={item.item_id}
                                    itemId={item.item_id}
                                    alt={item.name}
                                    className="w-16 h-16 rounded-xl object-cover"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {coordinations.length === 0 && (
                <p className="text-gray-500">
                    コーディネートはまだ登録されていません
                </p>
            )}
        </div>
    );
}
