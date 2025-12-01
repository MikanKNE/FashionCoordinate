// frontend/src/pages/OutfitFormPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { supabase } from "../lib/supabaseClient";

import { getItems } from "../api/items";

import { Button } from "../components/ui/Button";
import Card from "../components/ui/Card";

import Header from "../components/Header";
import ItemCard from "../components/ItemCard";
import Filter from "../components/Filter";

import type { Item, MultiFilters } from "../types";


type SelectionMode = "items" | "coordination";

interface Coordination {
    coordination_id: number;
    name: string;
    items: Item[];
}

export default function OutfitFormPage() {
    const [searchParams] = useSearchParams();
    const date = searchParams.get("date");
    const navigate = useNavigate();

    const [mode, setMode] = useState<SelectionMode>("items");
    const [allItems, setAllItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);
    const [coordinations, setCoordinations] = useState<Coordination[]>([]);
    const [filters, setFilters] = useState<MultiFilters>({
        subcategory_ids: [],
        color: [],
        material: [],
        pattern: [],
        season_tag: [],
        tpo_tags: [],
    });
    const [loading, setLoading] = useState(true);

    // ---------------------------
    // アイテム取得 + 使用履歴
    // ---------------------------
    useEffect(() => {
        const fetchItemsAndHistory = async () => {
            setLoading(true);
            try {
                const res = await getItems();
                const items: Item[] = Array.isArray(res) ? res : (res as any)?.data || [];
                setAllItems(items);
                setFilteredItems(items);

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
    // フィルター適用
    // ---------------------------
    useEffect(() => {
        const filtered = allItems.filter((i) => {
            if (filters.subcategory_ids.length > 0 && !filters.subcategory_ids.includes(i.subcategory_id!)) return false;
            if (filters.color.length > 0 && !filters.color.includes(i.color!)) return false;
            if (filters.material.length > 0 && !filters.material.includes(i.material!)) return false;
            if (filters.pattern.length > 0 && !filters.pattern.includes(i.pattern!)) return false;
            if (filters.season_tag.length > 0 && !(i.season_tag || []).some((s) => filters.season_tag.includes(s))) return false;
            if (filters.tpo_tags.length > 0 && !(i.tpo_tags || []).some((s) => filters.tpo_tags.includes(s))) return false;
            return true;
        });
        setFilteredItems(filtered);
    }, [filters, allItems]);

    // ---------------------------
    // コーデ一覧取得
    // ---------------------------
    useEffect(() => {
        if (mode !== "coordination") return;

        const fetchCoordinations = async () => {
            try {
                const { data, error } = await supabase
                    .from("coordinations")
                    .select(`
            coordination_id,
            name,
            coordination_items (
              item_id,
              items (*)
            )
          `)
                    .order("coordination_id", { ascending: true });

                if (!error && data) {
                    const mapped: Coordination[] = data.map((c: any) => ({
                        coordination_id: c.coordination_id,
                        name: c.name,
                        items: c.coordination_items.map((ci: any) => ci.items),
                    }));
                    setCoordinations(mapped);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchCoordinations();
    }, [mode]);

    const toggleSelectItem = (item: Item) => {
        const exists = selectedItems.some((i) => i.item_id === item.item_id);
        if (exists) setSelectedItems((prev) => prev.filter((i) => i.item_id !== item.item_id));
        else setSelectedItems((prev) => [...prev, item]);
    };

    const handleSave = async () => {
        if (!date) return toast("日付が取得できません");
        if (selectedItems.length === 0) return toast("アイテムを選択してください");

        try {
            await supabase.from("usage_history").delete().eq("used_date", date);
            const inserts = selectedItems.map((item) => ({
                item_id: item.item_id,
                used_date: date,
                weather: null,
                temperature: null,
            }));
            const { error } = await supabase.from("usage_history").insert(inserts);
            if (error) toast("保存に失敗しました");
            else {
                toast("服装を登録しました");
                navigate("/");
            }
        } catch (err) {
            console.error(err);
            toast("保存中にエラーが発生しました");
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen p-6 text-slate-800 dark:text-slate-100">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold mb-4">{date ? `${date} の服装記録` : "今日の服装記録"}</h1>

                    {/* モード切替 */}
                    <div className="mb-4 flex gap-2">
                        <button
                            className={`px-3 py-1 border rounded ${mode === "items" ? "bg-blue-500 text-white" : ""}`}
                            onClick={() => setMode("items")}
                        >
                            アイテムから選択
                        </button>
                        <button
                            className={`px-3 py-1 border rounded ${mode === "coordination" ? "bg-blue-500 text-white" : ""}`}
                            onClick={() => setMode("coordination")}
                        >
                            コーディネートから選択
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* 左サイド */}
                        <aside className="md:col-span-1 sticky top-6 space-y-4">
                            {mode === "items" ? (
                                <Filter filters={filters} setFilters={setFilters} />
                            ) : (
                                <Card>
                                    <h4 className="text-lg font-semibold mb-4">コーディネート一覧</h4>
                                    {coordinations.map((c) => (
                                        <div
                                            key={c.coordination_id}
                                            className="border border-gray-300 rounded p-2 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                            onClick={() => setSelectedItems(c.items)}
                                        >
                                            <p className="text-sm font-medium mb-1">{c.name}</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {c.items.map((i) => (
                                                    <img key={i.item_id} src={i.image_url} className="w-12 h-12 object-cover rounded" />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </Card>
                            )}
                        </aside>

                        {/* 中央サイド */}
                        <main className="md:col-span-2">
                            <Card className="p-4">
                                {loading ? (
                                    <div>読み込み中...</div>
                                ) : (
                                    <>
                                        {/* 中央は常にアイテム一覧を表示 */}
                                        <div className="flex items-center justify-between mb-4 text-sm text-slate-600 dark:text-slate-400">
                                            <span>{filteredItems.length} アイテム</span>
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
                                    </>
                                )}
                            </Card>
                        </main>

                        {/* 右サイド：選択アイテム */}
                        <aside className="md:col-span-1 sticky top-6">
                            <Card className="p-4 flex flex-col">

                                <h4 className="text-lg font-semibold mb-2">選択中アイテム</h4>

                                <div className="mb-4">
                                    <Button
                                        variant="primary"
                                        onClick={handleSave}
                                        disabled={selectedItems.length === 0}
                                        className="w-full"
                                    >
                                        保存
                                    </Button>
                                </div>

                                {selectedItems.length === 0 && (
                                    <p className="text-sm text-gray-500">アイテムを選んでください</p>
                                )}

                                <div className="overflow-y-auto flex-1 space-y-2">
                                    {selectedItems.map((item) => (
                                        <div key={item.item_id} className="relative">
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-32 object-cover rounded"
                                            />
                                            <p className="text-center mt-1 text-sm">{item.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
