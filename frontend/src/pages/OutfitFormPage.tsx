// frontend/src/pages/OutfitFormPage.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { supabase } from "../lib/supabaseClient";
import { getItems } from "../api/items";

import { Button } from "../components/ui/Button";
import Card from "../components/ui/Card";
import Header from "../components/Header";
import ItemCard from "../components/ItemCard";
import Filter from "../components/Filter";
import { ItemImage } from "../components/ItemImage";

import type { Item, MultiFilters } from "../types";
import { COLOR_OPTIONS, MATERIAL_OPTIONS, PATTERN_OPTIONS, } from "../types";

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
    const [selectedCoordinationId, setSelectedCoordinationId] = useState<number | null>(null);

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


    const [loading, setLoading] = useState<boolean>(true);

    const matchWithOther = (
        rawValue: string | null,
        selected: string[],
        options: readonly string[]
    ): boolean => {
        if (selected.length === 0) return true; // フィルター未選択は常に true
        if (!rawValue) return selected.includes("未選択");

        const values = rawValue.split(",").map(v => v.trim());
        const normals = values.filter(v => options.includes(v));
        const hasOther = values.some(v => !options.includes(v));

        if (selected.some(v => normals.includes(v))) return true;
        if (hasOther && selected.includes("その他")) return true;

        return false;
    };


    // ---------------------------
    // アイテム取得 + 使用履歴
    // ---------------------------
    useEffect(() => {
        const fetchItemsAndHistory = async () => {
            setLoading(true);
            try {
                const res = await getItems();
                const items: Item[] = Array.isArray(res)
                    ? res
                    : (res as any)?.data || [];

                setAllItems(items);
                setFilteredItems(items);

                if (date) {
                    const { data: history } = await supabase
                        .from("usage_history")
                        .select("item_id")
                        .eq("used_date", date);

                    if (history) {
                        const selected = items.filter((i) =>
                            history.some((h: any) => h.item_id === i.item_id)
                        );
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
    // コーデ一覧取得
    // ---------------------------
    useEffect(() => {
        const fetchCoordinations = async () => {
            const { data, error } = await supabase
                .from("coordinations")
                .select(`
                        coordination_id,
                        name,
                        coordination_items (
                            item:items (*)
                        )
                    `);

            if (!error && data) {
                const formatted: Coordination[] = data.map((c: any) => ({
                    coordination_id: c.coordination_id,
                    name: c.name,
                    items: c.coordination_items.map((ci: any) => ci.item),
                }));
                setCoordinations(formatted);
            }
        };

        fetchCoordinations();
    }, []);

    // ---------------------------
    // フィルター適用（itemsモードのみ）
    // ---------------------------
    useEffect(() => {
        if (mode !== "items") return;

        const filtered = allItems.filter(item => {
            if (filters.is_favorite === true && !item.is_favorite) {
                return false;
            }

            const subcategoryMatch =
                filters.subcategory_ids.length === 0 ||
                (item.subcategory_id !== undefined &&
                    filters.subcategory_ids.includes(item.subcategory_id));

            const colorMatch = matchWithOther(item.color ?? null, filters.color, COLOR_OPTIONS);
            const materialMatch = matchWithOther(item.material ?? null, filters.material, MATERIAL_OPTIONS);
            const patternMatch = matchWithOther(item.pattern ?? null, filters.pattern, PATTERN_OPTIONS);

            const seasonMatch =
                filters.season_tag.length === 0 ||
                (item.season_tag?.some(s => filters.season_tag.includes(s)) ?? false);

            const tpoMatch =
                filters.tpo_tags.length === 0 ||
                (item.tpo_tags?.some(t => filters.tpo_tags.includes(t)) ?? false);

            const nameMatch =
                !filters.name ||
                item.name.toLowerCase().includes(filters.name.toLowerCase());

            return (
                subcategoryMatch &&
                colorMatch &&
                materialMatch &&
                patternMatch &&
                seasonMatch &&
                tpoMatch &&
                nameMatch
            );
        });

        setFilteredItems(filtered);
    }, [filters, allItems, mode]);

    // ---------------------------
    // 選択アイテムと一致するコーデがあれば自動選択
    // ---------------------------
    useEffect(() => {
        if (mode !== "coordination") return;

        const matched = coordinations.find((c) =>
            isSameItems(c.items, selectedItems)
        );

        setSelectedCoordinationId(matched?.coordination_id ?? null);
    }, [selectedItems, coordinations, mode]);

    const toggleSelectItem = (item: Item) => {
        setSelectedItems((prev) => {
            const exists = prev.some((i) => i.item_id === item.item_id);
            const next = exists
                ? prev.filter((i) => i.item_id !== item.item_id)
                : [...prev, item];

            setSelectedCoordinationId(null);
            return next;
        });
    };

    const handleSelectCoordination = (coordination: Coordination) => {
        if (selectedCoordinationId === coordination.coordination_id) {
            setSelectedCoordinationId(null);
            setSelectedItems((prev) =>
                prev.filter(
                    (item) =>
                        !coordination.items.some(
                            (ci) => ci.item_id === item.item_id
                        )
                )
            );
            return;
        }

        setSelectedCoordinationId(coordination.coordination_id);

        setSelectedItems((prev) => {
            const prevCoordination = coordinations.find(
                (c) => c.coordination_id === selectedCoordinationId
            );

            const cleaned = prevCoordination
                ? prev.filter(
                    (item) =>
                        !prevCoordination.items.some(
                            (ci) => ci.item_id === item.item_id
                        )
                )
                : prev;

            const map = new Map<number, Item>();
            [...cleaned, ...coordination.items].forEach((i) =>
                map.set(i.item_id, i)
            );

            return Array.from(map.values());
        });
    };

    const isSameItems = (a: Item[], b: Item[]) => {
        if (a.length !== b.length) return false;
        const aIds = a.map(i => i.item_id).sort();
        const bIds = b.map(i => i.item_id).sort();
        return aIds.every((id, idx) => id === bIds[idx]);
    };

    const handleSave = async () => {
        if (!date) return toast("日付が取得できません");
        if (selectedItems.length === 0) return toast("アイテムを選択してください");

        try {
            await supabase.from("usage_history").delete().eq("used_date", date);

            const inserts = selectedItems.map((item) => ({
                item_id: item.item_id,
                used_date: date,
            }));

            const { error } = await supabase.from("usage_history").insert(inserts);
            if (error) toast("保存に失敗しました");
            else {
                toast("服装を登録しました");
                navigate("/dashboard");
            }
        } catch (err) {
            console.error(err);
            toast("保存中にエラーが発生しました");
        }
    };

    const displayItems = mode === "items" ? filteredItems : allItems;

    return (
        <>
            <Header />
            <div className="min-h-screen p-6">
                <div className="mx-auto">
                    <h1 className="text-2xl font-bold mb-4">
                        {date ? `${date} の服装記録` : "今日の服装記録"}
                    </h1>

                    {loading && <p className="text-gray-500 mb-4">読み込み中…</p>}

                    {/* モード切替 */}
                    <div className="mb-4 flex gap-2">
                        <button
                            className={`]
                                px-4 py-2 rounded-lg shadow-sm dark:shadow-black/20
                                hover:scale-[1.03]
                                ${mode === "items"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }
                                `}
                            onClick={() => {
                                setMode("items");
                                setSelectedCoordinationId(null);
                            }}
                        >
                            アイテムから選択
                        </button>

                        <button
                            className={`]
                                px-4 py-2 rounded-lg shadow-sm dark:shadow-black/20
                                hover:scale-[1.03]
                                ${mode === "coordination"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }
                                `}
                            onClick={() => {
                                setMode("coordination");
                                setSelectedCoordinationId(null);
                            }}
                        >
                            コーディネートから選択
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* 左 */}
                        <aside className="md:col-span-1 sticky top-6">
                            {mode === "items" ? (
                                <Filter filters={filters} setFilters={setFilters} />
                            ) : (
                                <Card>
                                    <h4 className="font-semibold mb-3">コーデ一覧</h4>
                                    {coordinations.map((c) => (
                                        <div
                                            key={c.coordination_id}
                                            onClick={() => handleSelectCoordination(c)}
                                            className={`p-3 mb-3 cursor-pointer
                                                    border border-gray-200 rounded-2xl shadow-md
                                                    bg-white text-gray-800
                                                    dark:bg-gray-800 dark:text-gray-100
                                                    dark:border-gray-500/70
                                                    ${selectedCoordinationId === c.coordination_id
                                                    ? "bg-blue-50 ring-2 ring-blue-400"
                                                    : "hover:scale-[1.03] hover:shadow-lg"}`}
                                        >
                                            <p className="text-sm mb-2 font-bold">
                                                {c.name}
                                                <span className="text-xs text-gray-500 ml-2">
                                                    {c.items.length} アイテム
                                                </span>
                                            </p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {c.items.slice(0, 3).map((item) => (
                                                    <ItemImage
                                                        key={item.item_id}
                                                        itemId={item.item_id}
                                                        alt=""
                                                        className="w-full h-16 object-cover rounded"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </Card>
                            )}
                        </aside>

                        {/* 中央 */}
                        <main className="md:col-span-2">
                            <Card>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {displayItems.map((it) => (
                                        <ItemCard
                                            key={it.item_id}
                                            item={it}
                                            selected={selectedItems.some(
                                                (s) => s.item_id === it.item_id
                                            )}
                                            onClick={() => toggleSelectItem(it)}
                                        />
                                    ))}
                                </div>
                            </Card>
                        </main>

                        {/* 右 */}
                        <aside className="md:col-span-1 sticky top-6">
                            <Card>
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    disabled={selectedItems.length === 0}
                                    className="w-full mb-4"
                                >
                                    保存
                                </Button>

                                {selectedItems.map((item) => (
                                    <ItemCard
                                        key={item.item_id}
                                        item={item}
                                        compact
                                        disableHover
                                        className="mb-3"
                                    />
                                ))}
                            </Card>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
