// frontend/src/components/Filter.tsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { getItems } from "../api/items";
import { getSubcategories } from "../api/subcategories";

import { Button } from "./ui/Button";
import Card from "./ui/Card";

import type { MultiFilters, AccordionState, Subcategory, Item } from "../types";
import { COLOR_OPTIONS, MATERIAL_OPTIONS, PATTERN_OPTIONS, } from "../types";

interface FilterProps {
    filters: MultiFilters;
    setFilters: React.Dispatch<React.SetStateAction<MultiFilters>>;
    showClearAllButton?: boolean;
}

// getSubcategories の返り値型
interface SubcategoryResponse {
    subcategory_id: number;
    category: string;
    name: string;
}

export default function Filter({ filters, setFilters }: FilterProps) {
    const [allItems, setAllItems] = useState<Item[]>([]);
    const [subcategoriesByParent, setSubcategoriesByParent] = useState<Map<string, Subcategory[]>>(new Map());
    const [accordion, setAccordion] = useState<AccordionState>({
        category: false,
        color: false,
        material: false,
        pattern: false,
        season_tag: false,
        tpo_tags: false,
        name: "",
    });
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const parentCategories = ["服", "靴", "アクセサリー", "帽子", "バッグ"];

    // ------------------------------
    // アイテム取得
    // ------------------------------
    useEffect(() => {
        let cancelled = false;

        const fetchItemsSafe = async () => {
            setLoading(true);
            try {
                const res = await getItems();
                if (cancelled) return;

                const itemsArr = Array.isArray(res) ? res : res?.data || [];
                setAllItems(itemsArr);
            } catch (e: any) {
                if (!cancelled && e?.message !== "ユーザーがログインしていません") {
                    toast.error("フィルター用アイテムの取得に失敗しました");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchItemsSafe();

        return () => {
            cancelled = true;
        };
    }, []);

    // ------------------------------
    // サブカテゴリ取得
    // ------------------------------
    useEffect(() => {
        let cancelled = false;

        const fetchSubcategoriesSafe = async () => {
            const map = new Map<string, Subcategory[]>();

            for (const parent of parentCategories) {
                try {
                    const res = await getSubcategories(parent);
                    if (cancelled) return;

                    const data: SubcategoryResponse[] =
                        Array.isArray(res) ? res : res.data || [];

                    map.set(
                        parent,
                        data.map(s => ({
                            subcategory_id: s.subcategory_id,
                            category: s.category,
                            name: s.name,
                        }))
                    );
                } catch (e: any) {
                    if (cancelled) return;

                    map.set(parent, []);
                }
            }

            if (!cancelled) {
                setSubcategoriesByParent(map);
            }
        };

        fetchSubcategoriesSafe();

        return () => {
            cancelled = true;
        };
    }, []);

    // ------------------------------
    // 色・素材・柄・季節・TPO を取得（未選択を末尾に追加）
    // ------------------------------
    const uniqueValues = useMemo(() => {
        const buildOptionsWithOther = (
            items: Item[],
            key: "color" | "material" | "pattern",
            options: readonly string[]
        ) => {
            const set = new Set<string>();
            let hasOther = false;

            items.forEach(item => {
                const raw = item[key];
                if (!raw) {
                    set.add("未選択");
                    return;
                }

                raw.split(",").map(v => v.trim()).forEach(v => {
                    if (options.includes(v)) {
                        set.add(v);
                    } else {
                        hasOther = true;
                    }
                });
            });

            if (hasOther) set.add("その他");

            return Array.from(set).filter(Boolean);
        };

        const colors = buildOptionsWithOther(allItems, "color", COLOR_OPTIONS);
        const materials = buildOptionsWithOther(allItems, "material", MATERIAL_OPTIONS);
        const patterns = buildOptionsWithOther(allItems, "pattern", PATTERN_OPTIONS);

        const seasons = Array.from(new Set(allItems.flatMap(i => i.season_tag || [])));
        const tpos = Array.from(new Set(allItems.flatMap(i => i.tpo_tags || [])));

        return { colors, materials, patterns, seasons, tpos };
    }, [allItems]);


    // ------------------------------
    // 使用されているサブカテゴリだけを表示
    // ------------------------------
    const filteredSubcategoriesByParent = useMemo(() => {
        const usedSubcategoryIds = new Set(allItems.map(i => i.subcategory_id).filter(Boolean));
        const map = new Map<string, Subcategory[]>();
        parentCategories.forEach(parent => {
            const subs = subcategoriesByParent.get(parent) || [];
            const filtered = subs.filter(s => usedSubcategoryIds.has(s.subcategory_id));
            if (filtered.length > 0) map.set(parent, filtered);
        });
        return map;
    }, [allItems, subcategoriesByParent]);

    // ------------------------------
    // フィルター操作
    // ------------------------------
    const toggleFilterArray = (key: keyof MultiFilters, value: string | number) => {
        const arr = filters[key] as any[];
        setFilters({
            ...filters,
            [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
        });
    };

    const toggleAccordion = (key: keyof AccordionState) =>
        setAccordion(prev => ({ ...prev, [key]: !prev[key] }));

    // ------------------------------
    // チェックボックスレンダラー
    // ------------------------------
    const renderCheckboxSection = (
        label: string,
        key: keyof AccordionState,
        options: { id: string | number; name: string }[],
        filterKey: keyof MultiFilters
    ) => (
        <div className="mb-3 border border-gray-300 dark:border-white/20 rounded-lg p-2">
            <button
                type="button"
                className="flex justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-100 border border-gray-300 dark:border-white/20 rounded-md px-2 py-1"
                onClick={() => toggleAccordion(key)}
            >
                <span>{label}</span>
                <span>{accordion[key] ? " - " : " + "}</span>
            </button>

            {accordion[key] && (
                <div className="pl-2 mt-1 space-y-1 max-h-48 overflow-y-auto">
                    {options.map(opt => (
                        <label key={opt.id} className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={(filters[filterKey] as any[]).includes(opt.id)}
                                onChange={() => toggleFilterArray(filterKey, opt.id)}
                            />
                            <span className="text-slate-800 dark:text-slate-100">{opt.name}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCategorySection = () => (
        <div className="mb-3 border border-gray-300 dark:border-white/20 rounded-lg p-2">
            <button
                type="button"
                className="flex justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-100 border border-gray-300 dark:border-white/20 rounded-md px-2 py-1"
                onClick={() => toggleAccordion("category")}
            >
                <span>カテゴリー</span>
                <span>{accordion.category ? "-" : "+"}</span>
            </button>

            {accordion.category && (
                <div className="pl-2 mt-2 space-y-2">
                    {parentCategories.map(parent => (
                        <div key={parent} className="border border-gray-300 dark:border-white/20 rounded-md p-1">
                            <button
                                type="button"
                                className="flex justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-100 border border-gray-300 dark:border-white/20 rounded-md px-2 py-1"
                                onClick={() =>
                                    setExpandedCategory(expandedCategory === parent ? null : parent)
                                }
                            >
                                <span>{parent}</span>
                                <span>{expandedCategory === parent ? "-" : "+"}</span>
                            </button>

                            {expandedCategory === parent && (
                                <div className="pl-4 mt-1 space-y-1">
                                    {(filteredSubcategoriesByParent.get(parent) || []).map((s: Subcategory) => (
                                        <label key={s.subcategory_id} className="flex items-center text-sm">
                                            <input
                                                type="checkbox"
                                                className="mr-2"
                                                checked={filters.subcategory_ids.includes(s.subcategory_id)}
                                                onChange={() =>
                                                    toggleFilterArray("subcategory_ids", s.subcategory_id)
                                                }
                                            />
                                            <span className="text-slate-800 dark:text-slate-100">{s.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // ------------------------------
    // 名前検索用レンダラー
    // ------------------------------
    const renderNameSearch = () => (
        <div className="mb-3">
            <input
                type="text"
                placeholder="名前で検索"
                className="w-full border border-gray-300 dark:border-white/20 rounded-md px-2 py-1 text-sm text-slate-800 dark:text-slate-100"
                value={filters.name || ""}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
        </div>
    );

    // ------------------------------
    // お気に入りフィルター用レンダラー
    // ------------------------------
    const renderFavoriteFilter = () => (
        <div className="mb-3 border border-gray-300 dark:border-white/20 rounded-lg p-2">
            <label className="flex items-center text-sm cursor-pointer">
                <input
                    type="checkbox"
                    className="mr-2"
                    checked={filters.is_favorite === true}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            is_favorite: e.target.checked ? true : undefined,
                        })
                    }
                />
                <span className="text-slate-800 dark:text-slate-100">
                    お気に入りのみ
                </span>
            </label>
        </div>
    );

    return (
        <Card>
            <div className="items-center justify-between mb-3">
                <h4 className="text-lg font-semibold pb-2">アイテムフィルター</h4>
                <Button
                    variant="secondary"
                    className="max-w-xs text-sm"
                    onClick={() =>
                        setFilters({
                            subcategory_ids: [],
                            color: [],
                            material: [],
                            pattern: [],
                            season_tag: [],
                            tpo_tags: [],
                            name: "",
                            is_favorite: undefined,
                        })
                    }
                >
                    全てクリア
                </Button>
            </div>


            {loading && <div>読み込み中...</div>}

            {!loading && (
                <>
                    {renderNameSearch()}
                    {renderFavoriteFilter()}
                    {renderCategorySection()}


                    {renderCheckboxSection(
                        "色",
                        "color",
                        uniqueValues.colors.map(v => ({ id: v, name: v })),
                        "color"
                    )}
                    {renderCheckboxSection(
                        "素材",
                        "material",
                        uniqueValues.materials.map(v => ({ id: v, name: v })),
                        "material"
                    )}
                    {renderCheckboxSection(
                        "柄",
                        "pattern",
                        uniqueValues.patterns.map(v => ({ id: v, name: v })),
                        "pattern"
                    )}
                    {renderCheckboxSection(
                        "季節",
                        "season_tag",
                        uniqueValues.seasons.map(v => ({ id: v, name: v })),
                        "season_tag"
                    )}
                    {renderCheckboxSection(
                        "TPO",
                        "tpo_tags",
                        uniqueValues.tpos.map(v => ({ id: v, name: v })),
                        "tpo_tags"
                    )}
                </>
            )}
        </Card>
    );
}
