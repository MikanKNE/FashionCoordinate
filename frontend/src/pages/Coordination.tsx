// frontend/src/pages/Coordination.tsx
import React, { useEffect, useMemo, useState } from "react";
import CoordinationForm from "../components/CoordinationForm";
import CoordinationPreview from "../components/CoordinationPreview";
import type { Item, Subcategory } from "../types";
import { getItems } from "../api/items";
import Header from "../components/Header";
import toast from "react-hot-toast";

interface MultiFilters {
    subcategory_ids: number[];
    color: string[];
    material: string[];
    pattern: string[];
    season_tag: string[];
    tpo_tags: string[];
    is_favorite?: boolean;
}

interface AccordionState {
    color: boolean;
    material: boolean;
    pattern: boolean;
    season_tag: boolean;
    tpo_tags: boolean;
}

export default function CoordinationPage() {
    const [allItems, setAllItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<MultiFilters>({
        subcategory_ids: [],
        color: [],
        material: [],
        pattern: [],
        season_tag: [],
        tpo_tags: [],
    });

    const [accordion, setAccordion] = useState<AccordionState>({
        color: false,
        material: false,
        pattern: false,
        season_tag: false,
        tpo_tags: false,
    });

    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await getItems();
                if (Array.isArray(res)) setAllItems(res);
                else if ((res as any)?.data) setAllItems((res as any).data);
                else setAllItems([]);
            } catch (e) {
                console.error(e);
                setError("アイテム取得に失敗しました");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // 親カテゴリーごとにサブカテゴリー整理
    const subcategoriesByParent = useMemo(() => {
        const map = new Map<string, Subcategory[]>();
        allItems.forEach((i) => {
            if (i.subcategory_id && i.subcategory_name && i.category) {
                if (!map.has(i.category)) map.set(i.category, []);
                const arr = map.get(i.category)!;
                if (!arr.some((s) => s.subcategory_id === i.subcategory_id)) {
                    arr.push({
                        subcategory_id: i.subcategory_id,
                        category: i.category,
                        name: i.subcategory_name,
                    });
                }
            }
        });
        return map;
    }, [allItems]);

    const uniqueValues = useMemo(() => {
        const colors = Array.from(new Set(allItems.map((i) => i.color).filter(Boolean))) as string[];
        const materials = Array.from(new Set(allItems.map((i) => i.material).filter(Boolean))) as string[];
        const patterns = Array.from(new Set(allItems.map((i) => i.pattern).filter(Boolean))) as string[];
        const seasons = Array.from(new Set(allItems.flatMap((i) => i.season_tag || [])));
        const tpos = Array.from(new Set(allItems.flatMap((i) => i.tpo_tags || [])));
        return { colors, materials, patterns, seasons, tpos };
    }, [allItems]);

    const filteredItems = useMemo(() => {
        return allItems.filter((i) => {
            if (filters.subcategory_ids.length > 0 && (!i.subcategory_id || !filters.subcategory_ids.includes(i.subcategory_id))) return false;
            if (filters.color.length && !filters.color.includes(i.color!)) return false;
            if (filters.material.length && !filters.material.includes(i.material!)) return false;
            if (filters.pattern.length && !filters.pattern.includes(i.pattern!)) return false;
            if (filters.season_tag.length && !(i.season_tag || []).some((s) => filters.season_tag.includes(s))) return false;
            if (filters.tpo_tags.length && !(i.tpo_tags || []).some((s) => filters.tpo_tags.includes(s))) return false;
            if (filters.is_favorite !== undefined && i.is_favorite !== filters.is_favorite) return false;
            return true;
        });
    }, [allItems, filters]);

    const toggleFilterArray = (key: keyof MultiFilters, value: string | number) => {
        const arr = filters[key] as any[];
        if (arr.includes(value)) setFilters({ ...filters, [key]: arr.filter((v) => v !== value) });
        else setFilters({ ...filters, [key]: [...arr, value] });
    };

    const toggleAccordion = (key: keyof AccordionState) => setAccordion((prev) => ({ ...prev, [key]: !prev[key] }));

    const toggleSelectItem = (item: Item) => {
        const exists = selectedItems.some((i) => i.item_id === item.item_id);
        if (exists) setSelectedItems((prev) => prev.filter((i) => i.item_id !== item.item_id));
        else setSelectedItems((prev) => [...prev, item]);
    };

    const renderCheckboxSection = (
        label: string,
        key: keyof AccordionState,
        options: { id: string | number; name: string }[],
        filterKey: keyof MultiFilters
    ) => (
        <div className="mb-3">
            <button
                type="button"
                className="flex justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300"
                onClick={() => toggleAccordion(key)}
            >
                <span>{label}</span>
                <span>{accordion[key] ? "-" : "+"}</span>
            </button>
            {accordion[key] && (
                <div className="pl-2 mt-1 space-y-1 max-h-48 overflow-y-auto">
                    {options.map((opt) => (
                        <label key={opt.id} className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={(filters[filterKey] as any[]).includes(opt.id)}
                                onChange={() => toggleFilterArray(filterKey, opt.id)}
                            />
                            {opt.name}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <>
            <Header />
            <div className="min-h-screen bg-blue-50 dark:bg-gray-900 p-6 text-gray-800 dark:text-gray-100">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold mb-4">コーディネート登録</h1>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* 左：フィルター */}
                        <aside className="md:col-span-1 sticky top-6 space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
                                <h4 className="text-lg font-semibold mb-3">フィルター</h4>

                                {/* カテゴリー */}
                                <div className="mb-3">
                                    <button
                                        type="button"
                                        className="flex justify-between w-full text-sm font-medium"
                                        onClick={() => setExpandedCategory(expandedCategory ? null : "category")}
                                    >
                                        <span>カテゴリー</span>
                                        <span>{expandedCategory ? "-" : "+"}</span>
                                    </button>
                                    {expandedCategory && (
                                        <div className="pl-2 mt-1">
                                            {["服", "靴", "アクセサリー", "帽子", "バッグ"].map((parent) => (
                                                <div key={parent} className="mb-1">
                                                    <button
                                                        type="button"
                                                        className="flex justify-between w-full text-sm font-medium"
                                                        onClick={() =>
                                                            setExpandedCategory(
                                                                expandedCategory === parent ? null : parent
                                                            )
                                                        }
                                                    >
                                                        <span>{parent}</span>
                                                        <span>
                                                            {expandedCategory === parent ? "-" : "+"}
                                                        </span>
                                                    </button>
                                                    {expandedCategory === parent && (
                                                        <div className="pl-4 mt-1">
                                                            {subcategoriesByParent.get(parent)?.map((s) => (
                                                                <label key={s.subcategory_id} className="flex items-center text-sm mb-1">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="mr-2"
                                                                        checked={filters.subcategory_ids.includes(s.subcategory_id)}
                                                                        onChange={() => toggleFilterArray("subcategory_ids", s.subcategory_id)}
                                                                    />
                                                                    {s.name}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 色・素材・柄・季節・TPO */}
                                {renderCheckboxSection(
                                    "色",
                                    "color",
                                    uniqueValues.colors.map((v) => ({ id: v, name: v })),
                                    "color"
                                )}
                                {renderCheckboxSection(
                                    "素材",
                                    "material",
                                    uniqueValues.materials.map((v) => ({ id: v, name: v })),
                                    "material"
                                )}
                                {renderCheckboxSection(
                                    "柄",
                                    "pattern",
                                    uniqueValues.patterns.map((v) => ({ id: v, name: v })),
                                    "pattern"
                                )}
                                {renderCheckboxSection(
                                    "季節",
                                    "season_tag",
                                    uniqueValues.seasons.map((v) => ({ id: v, name: v })),
                                    "season_tag"
                                )}
                                {renderCheckboxSection(
                                    "TPO",
                                    "tpo_tags",
                                    uniqueValues.tpos.map((v) => ({ id: v, name: v })),
                                    "tpo_tags"
                                )}
                            </div>
                        </aside>

                        {/* 中央：アイテム一覧 */}
                        <main className="md:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
                                <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>{loading ? "読み込み中..." : `${filteredItems.length} アイテム`}</span>
                                    <span>選択済み: {selectedItems.length}</span>
                                </div>
                                {error && <div className="text-red-500 mb-3">{error}</div>}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredItems.map((it) => {
                                        const selected = selectedItems.some((s) => s.item_id === it.item_id);
                                        return (
                                            <button
                                                key={it.item_id}
                                                onClick={() => toggleSelectItem(it)}
                                                className={`text-left p-2 rounded border transition group bg-white dark:bg-gray-700 hover:shadow-md ${selected
                                                    ? "ring-2 ring-indigo-400 dark:ring-indigo-300"
                                                    : "border-gray-100 dark:border-gray-600"
                                                    }`}
                                            >
                                                <div className="w-full h-36 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden mb-2">
                                                    <img
                                                        src={it.image_url || "/noimage.png"}
                                                        alt={it.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                    {it.name}
                                                </div>
                                                {it.category && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{it.category}</div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </main>

                        {/* 右：選択 + 登録フォーム */}
                        <aside className="md:col-span-1 sticky top-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 space-y-4">
                                <h4 className="text-lg font-semibold mb-2">選択中アイテム</h4>
                                <CoordinationForm selectedItems={selectedItems} />
                                <CoordinationPreview items={selectedItems} />
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
