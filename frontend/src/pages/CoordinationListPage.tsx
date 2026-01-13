// src/pages/CoordinationListPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getAllCoordinationItems } from "../api/coordination_items";
import { getCoordinations } from "../api/coordinations";
import { getItems } from "../api/items";

import { Button } from "../components/ui/Button";
import Card from "../components/ui/Card";

import CoordinationDetailModal from "../components/CoordinationDetailModal";
import Filter from "../components/Filter";
import Header from "../components/Header";
import ItemCard from "../components/ItemCard";

import type {
    Coordination,
    CoordinationItem,
    Item,
    MultiFilters,
} from "../types";

export default function CoordinationListPage() {
    const [coordinations, setCoordinations] = useState<Coordination[]>([]);
    const [coordinationItems, setCoordinationItems] = useState<
        (CoordinationItem & { item?: Item })[]
    >([]);
    const [selected, setSelected] = useState<Coordination | null>(null);

    const [filters, setFilters] = useState<MultiFilters>({
        subcategory_ids: [],
        color: [],
        material: [],
        pattern: [],
        season_tag: [],
        tpo_tags: [],
        is_favorite: undefined,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    // =========================
    // 一覧取得
    // =========================
    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // ① コーディネート一覧
            const coordinationRes = await getCoordinations();
            const coordinationList = coordinationRes?.data ?? [];
            setCoordinations(coordinationList);

            // ② 中間テーブル
            const ciRes = await getAllCoordinationItems();
            const ciListRaw: CoordinationItem[] = ciRes?.data ?? [];

            // ③ アイテム一覧（※ 配列が返る前提）
            const items: Item[] = await getItems();
            const itemsMap = new Map<number, Item>();
            items.forEach(item => {
                itemsMap.set(item.item_id, item);
            });

            // ④ 中間テーブルに item を紐付け
            const ciList = ciListRaw.map(ci => ({
                ...ci,
                item: itemsMap.get(ci.item_id),
            }));

            setCoordinationItems(ciList);
        } catch (e) {
            console.error(e);
            setError("コーディネート一覧の取得に失敗しました");
            toast.error("コーディネート一覧の取得に失敗しました");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    // =========================
    // コーデごとのアイテム取得
    // =========================
    const getItemsForCoordination = (coordination_id: number): Item[] => {
        return coordinationItems
            .filter(ci => ci.coordination_id === coordination_id)
            .map(ci => ci.item)
            .filter(Boolean) as Item[];
    };

    // =========================
    // フィルタ判定
    // =========================
    const matchesFilter = (item: Item, filters: MultiFilters) => {
        if (!item) return false;

        if (filters.is_favorite && !item.is_favorite) return false;
        if (
            filters.subcategory_ids.length &&
            !filters.subcategory_ids.includes(item.subcategory_id!)
        )
            return false;
        if (filters.color.length && !filters.color.includes(item.color ?? ""))
            return false;
        if (
            filters.material.length &&
            !filters.material.includes(item.material ?? "")
        )
            return false;
        if (
            filters.pattern.length &&
            !filters.pattern.includes(item.pattern ?? "")
        )
            return false;
        if (
            filters.season_tag.length &&
            !item.season_tag.some(tag =>
                filters.season_tag.includes(tag)
            )
        )
            return false;
        if (
            filters.tpo_tags.length &&
            !item.tpo_tags.some(tag =>
                filters.tpo_tags.includes(tag)
            )
        )
            return false;

        return true;
    };

    // =========================
    // フィルター適用後のコーデ
    // =========================
    const filteredCoordinations = coordinations.filter(c => {
        const items = getItemsForCoordination(c.coordination_id);
        return items.some(item => matchesFilter(item, filters));
    });

    // =========================
    // JSX
    // =========================
    return (
        <>
            <Header />

            <div className="min-h-screen p-6 text-slate-800 dark:text-slate-100">
                <div className="max-w-6xl mx-auto">
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">
                            コーディネート一覧
                        </h1>
                        <Button
                            className="max-w-xs"
                            onClick={() => navigate("/coordination/new")}
                        >
                            ＋ 追加
                        </Button>
                    </div>

                    <div className="grid grid-cols-10 gap-6">
                        {/* 左：フィルター */}
                        <aside className="col-span-2 sticky top-0">
                            <Filter
                                filters={filters}
                                setFilters={setFilters}
                            />
                        </aside>

                        {/* 右：一覧 */}
                        <main className="col-span-8">
                            {loading && <p>読み込み中...</p>}
                            {error && (
                                <p className="text-red-500">{error}</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredCoordinations.length > 0 ? (
                                    filteredCoordinations.map(c => {
                                        const items =
                                            getItemsForCoordination(
                                                c.coordination_id
                                            ).slice(0, 3);

                                        return (
                                            <Card
                                                key={c.coordination_id}
                                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                                                onClick={() => setSelected(c)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="text-lg font-semibold">
                                                        {c.name}
                                                    </div>
                                                    <div className="text-xl text-yellow-500">
                                                        {c.is_favorite
                                                            ? "★"
                                                            : "☆"}
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex gap-2">
                                                    {items.length > 0 ? (
                                                        items.map(item => (
                                                            <ItemCard
                                                                key={
                                                                    item.item_id
                                                                }
                                                                item={item}
                                                                compact
                                                                disableHover
                                                                className="flex-1"
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="text-gray-400">
                                                            アイテムなし
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 mt-4">
                                        条件に合うコーディネートがありません
                                    </p>
                                )}
                            </div>
                        </main>
                    </div>

                    {/* 詳細モーダル */}
                    {selected && (
                        <CoordinationDetailModal
                            coordination={selected}
                            isOpen={true}
                            onClose={() => setSelected(null)}
                            onDeleted={fetchList}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
