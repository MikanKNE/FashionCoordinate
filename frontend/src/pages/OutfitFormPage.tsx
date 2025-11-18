// frontend/src/pages/OutfitFormPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

import Header from "../components/Header";
import Card from "../components/ui/Card";
import ItemCard from "../components/ItemCard";

import type { Item, Subcategory } from "../types";
import { getItems } from "../api/items";

interface MultiFilters {
    subcategory_ids: number[];
    color: string[];
    material: string[];
    pattern: string[];
    season_tag: string[];
    tpo_tags: string[];
}

interface AccordionState {
    color: boolean;
    material: boolean;
    pattern: boolean;
    season_tag: boolean;
    tpo_tags: boolean;
}

interface FilterOption {
    label: string;
    key: keyof MultiFilters;
    values: string[];
}

export default function OutfitFormPage() {
    const [searchParams] = useSearchParams();
    const date = searchParams.get("date");
    const navigate = useNavigate();

    const [allItems, setAllItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
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

    // ---------------------------
    // アイテム取得 + 既存使用履歴反映
    // ---------------------------
    useEffect(() => {
        const fetchItemsAndHistory = async () => {
            setLoading(true);
            try {
                // アイテム取得
                const res = await getItems();
                const items: Item[] = Array.isArray(res) ? res : (res as any)?.data || [];
                setAllItems(items);

                // 日付がある場合は使用履歴取得
                if (date) {
                    const { data: history, error } = await supabase
                        .from("usage_history")
                        .select("item_id")
                        .eq("used_date", date);

                    if (!error && history) {
                        const selected = items.filter((i) => history.some((h: any) => h.item_id === i.item_id));
                        setSelectedItems(selected);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItemsAndHistory();
    }, [date]);

    // ---------------------------
    // サブカテゴリ構造
    // ---------------------------
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

    // ---------------------------
    // 色・素材・柄・季節・TPO のユニーク値
    // ---------------------------
    const uniqueValues = useMemo(() => {
        const colors = Array.from(new Set(allItems.map((i) => i.color).filter(Boolean))) as string[];
        const materials = Array.from(new Set(allItems.map((i) => i.material).filter(Boolean))) as string[];
        const patterns = Array.from(new Set(allItems.map((i) => i.pattern).filter(Boolean))) as string[];
        const seasons = Array.from(new Set(allItems.flatMap((i) => i.season_tag || []))) as string[];
        const tpos = Array.from(new Set(allItems.flatMap((i) => i.tpo_tags || []))) as string[];
        return { colors, materials, patterns, seasons, tpos };
    }, [allItems]);

    // ---------------------------
    // フィルタ処理
    // ---------------------------
    const filteredItems = useMemo(() => {
        return allItems.filter((i) => {
            if (filters.subcategory_ids.length > 0 && !filters.subcategory_ids.includes(i.subcategory_id!)) return false;
            if (filters.color.length && !filters.color.includes(i.color!)) return false;
            if (filters.material.length && !filters.material.includes(i.material!)) return false;
            if (filters.pattern.length && !filters.pattern.includes(i.pattern!)) return false;
            if (filters.season_tag.length && !(i.season_tag || []).some((s) => filters.season_tag.includes(s))) return false;
            if (filters.tpo_tags.length && !(i.tpo_tags || []).some((s) => filters.tpo_tags.includes(s))) return false;
            return true;
        });
    }, [allItems, filters]);

    const toggleFilterArray = (key: keyof MultiFilters, value: string | number) => {
        const arr = filters[key] as any[];
        if (arr.includes(value)) setFilters({ ...filters, [key]: arr.filter((v) => v !== value) });
        else setFilters({ ...filters, [key]: [...arr, value] });
    };

    const toggleAccordion = (key: keyof AccordionState) => {
        setAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleSelectItem = (item: Item) => {
        const exists = selectedItems.some((i) => i.item_id === item.item_id);
        if (exists) setSelectedItems((prev) => prev.filter((i) => i.item_id !== item.item_id));
        else setSelectedItems((prev) => [...prev, item]);
    };

    const filterOptions: FilterOption[] = [
        { label: "色", key: "color", values: uniqueValues.colors },
        { label: "素材", key: "material", values: uniqueValues.materials },
        { label: "柄", key: "pattern", values: uniqueValues.patterns },
        { label: "季節", key: "season_tag", values: uniqueValues.seasons },
        { label: "TPO", key: "tpo_tags", values: uniqueValues.tpos },
    ];

    // ---------------------------
    // 保存
    // ---------------------------
    const handleSave = async () => {
        if (!date) return alert("日付が取得できません");
        if (selectedItems.length === 0) return alert("アイテムを選択してください");

        try {
            // まず古い履歴を削除してから新規登録
            await supabase.from("usage_history").delete().eq("used_date", date);

            const inserts = selectedItems.map((item) => ({
                item_id: item.item_id,
                used_date: date,
                weather: null,
                temperature: null,
            }));

            const { error } = await supabase.from("usage_history").insert(inserts);

            if (error) {
                console.error(error);
                alert("保存に失敗しました");
            } else {
                alert("服装を登録しました");
                navigate("/");
            }
        } catch (err) {
            console.error(err);
            alert("保存中にエラーが発生しました");
        }
    };

    // ---------------------------
    // UI
    // ---------------------------
    return (
        <>
            <Header />
            <div className="min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">
                        {date ? `${date} の服装登録` : "今日の服装登録"}
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* 左：フィルター */}
                        <aside className="md:col-span-1 sticky top-6 space-y-4">
                            <Card>
                                <h4 className="text-lg font-semibold mb-4">フィルター</h4>

                                {/* カテゴリー */}
                                <div className="mb-3 border rounded-lg p-2">
                                    <button
                                        type="button"
                                        className="flex justify-between w-full text-sm font-medium border rounded-md px-2 py-1"
                                        onClick={() => setExpandedCategory(expandedCategory ? null : "category")}
                                    >
                                        <span>カテゴリー</span>
                                        <span>{expandedCategory ? "-" : "+"}</span>
                                    </button>
                                    {expandedCategory && (
                                        <div className="pl-2 mt-2">
                                            {["服", "靴", "アクセサリー", "帽子", "バッグ"].map((parent) => (
                                                <div key={parent} className="mb-2 border rounded-md p-1">
                                                    <button
                                                        type="button"
                                                        className="flex justify-between w-full text-sm font-medium border rounded-md px-2 py-1"
                                                        onClick={() =>
                                                            setExpandedCategory(expandedCategory === parent ? "category" : parent)
                                                        }
                                                    >
                                                        <span>{parent}</span>
                                                        <span>{expandedCategory === parent ? "-" : "+"}</span>
                                                    </button>
                                                    {expandedCategory === parent && (
                                                        <div className="pl-4 mt-1 space-y-1">
                                                            {subcategoriesByParent.get(parent)?.map((s) => (
                                                                <label key={s.subcategory_id} className="flex items-center text-sm">
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
                                {filterOptions.map(({ label, key, values }) => (
                                    <div key={key} className="mb-3 border rounded-lg p-2">
                                        <button
                                            type="button"
                                            className="flex justify-between w-full text-sm font-medium border rounded-md px-2 py-1"
                                            onClick={() => toggleAccordion(key as keyof AccordionState)}
                                        >
                                            <span>{label}</span>
                                            <span>{accordion[key as keyof AccordionState] ? "-" : "+"}</span>
                                        </button>
                                        {accordion[key as keyof AccordionState] && (
                                            <div className="pl-2 mt-2 space-y-1 max-h-40 overflow-y-auto">
                                                {(values as string[]).map((v) => (
                                                    <label key={v} className="flex items-center text-sm">
                                                        <input
                                                            type="checkbox"
                                                            className="mr-2"
                                                            checked={(filters[key as keyof MultiFilters] as string[]).includes(v)}
                                                            onChange={() => toggleFilterArray(key as keyof MultiFilters, v)}
                                                        />
                                                        {v}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </Card>
                        </aside>

                        {/* 中央：アイテム一覧 */}
                        <main className="md:col-span-2">
                            <Card className="p-4">
                                <div className="flex justify-between text-sm mb-4">
                                    <span>{loading ? "読み込み中..." : `${filteredItems.length} アイテム`}</span>
                                    <span>選択済み: {selectedItems.length}</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredItems.map((it) => {
                                        const selected = selectedItems.some((s) => s.item_id === it.item_id);
                                        return (
                                            <ItemCard
                                                key={it.item_id}
                                                item={it}
                                                selected={selected}
                                                onClick={() => toggleSelectItem(it)}
                                            />
                                        );
                                    })}
                                </div>
                            </Card>
                        </main>

                        {/* 右：選択アイテム + 保存 */}
                        <aside className="md:col-span-1 sticky top-6">
                            <Card className="p-4 space-y-4">
                                <h4 className="text-lg font-semibold">選択中アイテム</h4>
                                {selectedItems.length === 0 && <p className="text-sm text-gray-500">アイテムを選んでください</p>}
                                {selectedItems.map((item) => (
                                    <div key={item.item_id} className="mb-2">
                                        <img src={item.image_url} className="w-full h-32 object-cover rounded" />
                                        <p className="text-center mt-1">{item.name}</p>
                                    </div>
                                ))}
                                <div className="flex justify-end mt-4">
                                    <button
                                        className="px-4 py-2 bg-blue-500 text-white rounded"
                                        onClick={handleSave}
                                        disabled={selectedItems.length === 0}
                                    >
                                        保存
                                    </button>
                                </div>
                            </Card>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
