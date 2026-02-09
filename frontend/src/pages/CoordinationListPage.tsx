// src/pages/CoordinationListPage.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
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

import type { Item, MultiFilters, Coordination, CoordinationItem } from "../types";
import { COLOR_OPTIONS, MATERIAL_OPTIONS, PATTERN_OPTIONS, } from "../types";

export default function CoordinationListPage() {
    const [coordinations, setCoordinations] = useState<Coordination[]>([]);
    const [coordinationItems, setCoordinationItems] = useState<(
        CoordinationItem & { item?: Item }
    )[]>([]);
    const [selected, setSelected] = useState<Coordination | null>(null);

    const [filters, setFilters] = useState<MultiFilters>({
        subcategory_ids: [],
        color: [],
        material: [],
        pattern: [],
        season_tag: [],
        tpo_tags: [],
        is_favorite: undefined,
        name: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    // =========================
    // 一覧取得
    // =========================
    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [coordinationRes, ciRes, itemsRes] = await Promise.all([
                getCoordinations(),
                getAllCoordinationItems(),
                getItems(),
            ]);

            const coordinations = coordinationRes?.data ?? [];
            const ciListRaw: CoordinationItem[] = ciRes?.data ?? [];
            const items: Item[] = itemsRes ?? [];

            const itemsMap = new Map<number, Item>();
            items.forEach(item => itemsMap.set(item.item_id, item));

            const ciList = ciListRaw.map(ci => ({
                ...ci,
                item: itemsMap.get(ci.item_id),
            }));

            // ★ ここでまとめて state 更新
            setCoordinations(coordinations);
            setCoordinationItems(ciList);
        } catch (e) {
            console.error(e);
            setError("コーディネート一覧の取得に失敗しました");
            toast.error("コーディネート一覧の取得に失敗しました");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchedRef = useRef(false);
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        fetchList();
    }, [fetchList]);

    useEffect(() => {
        const openId = location.state?.openCoordinationId;
        if (!openId || coordinations.length === 0) return;

        const target = coordinations.find(
            c => c.coordination_id === openId
        );

        if (target) {
            setSelected(target);
        }
    }, [location.state, coordinations]);

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
    // お気に入り → 非お気に入り の順に並び替え
    // =========================
    const sortedCoordinations = [
        ...coordinations.filter(c => c.is_favorite),
        ...coordinations.filter(c => !c.is_favorite),
    ];

    // =========================
    // フィルタ判定
    // =========================
    const matchesFilter = (item: Item, filters: MultiFilters) => {
        if (!item) return false;

        if (filters.is_favorite && !item.is_favorite) return false;

        // サブカテゴリ
        if (filters.subcategory_ids.length && !filters.subcategory_ids.includes(item.subcategory_id!)) return false;

        // 色・素材・パターンはカンマ区切り対応
        const itemColors = item.color ? item.color.split(",").map(c => c.trim()) : ["未選択"];
        if (filters.color.length && !filters.color.some(f => itemColors.includes(f))) return false;

        const itemMaterials = item.material ? item.material.split(",").map(c => c.trim()) : ["未選択"];
        if (filters.material.length && !filters.material.some(f => itemMaterials.includes(f))) return false;

        const itemPatterns = item.pattern ? item.pattern.split(",").map(c => c.trim()) : ["未選択"];
        if (filters.pattern.length && !filters.pattern.some(f => itemPatterns.includes(f))) return false;

        if (filters.season_tag.length && !item.season_tag.some(tag => filters.season_tag.includes(tag))) return false;
        if (filters.tpo_tags.length && !item.tpo_tags.some(tag => filters.tpo_tags.includes(tag))) return false;

        // 名前検索（部分一致・大文字小文字無視）
        if (filters.name && !item.name.toLowerCase().includes(filters.name.toLowerCase())) return false;

        return true;
    };

    // =========================
    // フィルター適用後のコーデ
    // =========================
    const filteredCoordinations = sortedCoordinations.filter(c => {
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
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">コーディネート一覧</h1>
                    <Button
                        className="max-w-xs cursor-pointer"
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
                            showClearAllButton // 全フィルター解除対応
                        />
                    </aside>

                    {/* 右：一覧 */}
                    <main className="col-span-8">
                        {loading && <p>読み込み中...</p>}
                        {error && <p className="text-red-500">{error}</p>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredCoordinations.length > 0 ? (
                                filteredCoordinations.map(c => {
                                    const items = getItemsForCoordination(c.coordination_id).slice(0, 3);

                                    return (
                                        <Card
                                            key={c.coordination_id}
                                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                                            onClick={() => setSelected(c)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex">
                                                    <div className="text-lg font-semibold">{c.name}</div>
                                                    <div className="text-sm text-gray-500 px-2 content-center">
                                                        {getItemsForCoordination(c.coordination_id).length} アイテム
                                                    </div>
                                                </div>
                                                <div className="text-xl text-yellow-500">
                                                    {c.is_favorite ? "★" : "☆"}
                                                </div>
                                            </div>

                                            <div className="mt-2 flex gap-2">
                                                {items.length > 0 ? (
                                                    items.map(item => (
                                                        <ItemCard
                                                            key={item.item_id}
                                                            item={item}
                                                            compact
                                                            disableHover
                                                            className="flex-1"
                                                        />
                                                    ))
                                                ) : (
                                                    <div className="text-gray-400">アイテムなし</div>
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
        </>
    );
}
