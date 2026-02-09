// src/pages/ItemListPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getItems } from "../api/items";
import { Button } from "../components/ui/Button";
import Filter from "../components/Filter";
import Header from "../components/Header";
import ItemDetailModal from "../components/ItemDetailModal";
import ItemList from "../components/ItemList";
import type { MultiFilters, Item } from "../types";
import { COLOR_OPTIONS, MATERIAL_OPTIONS, PATTERN_OPTIONS, } from "../types";

export default function ItemListPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
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

    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getItems();
            const dataArr = Array.isArray(res) ? res : res?.data || [];
            setItems(dataArr);
            setFilteredItems(dataArr);
        } catch (err: any) {
            console.error(err);
            setError("アイテム取得失敗");
        } finally {
            setLoading(false);
        }
    }, []);

    const matchWithOther = (
        rawValue: string | null,
        selected: string[],
        options: readonly string[]
    ): boolean => {
        // フィルター未選択なら常に true
        if (selected.length === 0) return true;

        // アイテム側が未選択
        if (!rawValue) {
            return selected.includes("未選択");
        }

        const values = rawValue.split(",").map(v => v.trim());

        const normals = values.filter(v => options.includes(v));
        const hasOther = values.some(v => !options.includes(v));

        // 通常選択と一致
        if (selected.some(v => normals.includes(v))) {
            return true;
        }

        // 「その他」判定
        if (hasOther && selected.includes("その他")) {
            return true;
        }

        return false;
    };

    useEffect(() => {
        const openItemId = location.state?.openItemId;
        if (openItemId) {
            setSelectedItemId(openItemId);
        }
    }, [location.state]);


    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // ------------------------------
    // フィルター適用（名前検索含む）
    // ------------------------------
    useEffect(() => {
        const filtered = items.filter(item => {
            if (filters.is_favorite === true && !item.is_favorite) {
                return false;
            }

            const subcategoryMatch =
                filters.subcategory_ids.length === 0 ||
                (item.subcategory_id !== undefined &&
                    filters.subcategory_ids.includes(item.subcategory_id));

            const colorMatch = matchWithOther(
                item.color ?? null,
                filters.color,
                COLOR_OPTIONS
            );

            const materialMatch = matchWithOther(
                item.material ?? null,
                filters.material,
                MATERIAL_OPTIONS
            );

            const patternMatch = matchWithOther(
                item.pattern ?? null,
                filters.pattern,
                PATTERN_OPTIONS
            );

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

        setFilteredItems([
            ...filtered.filter(i => i.is_favorite),
            ...filtered.filter(i => !i.is_favorite),
        ]);
    }, [filters, items]);

    const handleItemUpdated = async () => {
        await fetchItems();
    };

    return (
        <>
            <Header />
            <div className="min-h-screen p-6 text-slate-800 dark:text-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">アイテム一覧</h1>
                    <Button
                        className="max-w-xs cursor-pointer"
                        onClick={() => navigate("/items/new")}
                    >
                        ＋ 追加
                    </Button>
                </div>

                {/* 左右レイアウト */}
                <div className="grid grid-cols-10 gap-6">
                    {/* 左：Filter */}
                    <aside className="col-span-2 sticky top-0 mt-6">
                        <Filter filters={filters} setFilters={setFilters} />
                    </aside>

                    {/* 右：ItemList */}
                    <main className="col-span-8">
                        {loading && <p>読み込み中...</p>}
                        {error && <p className="text-red-500">{error}</p>}

                        <ItemList
                            items={filteredItems}
                            onItemClick={(id) => setSelectedItemId(id)}
                        />
                    </main>
                </div>

                {/* モーダル：詳細表示 */}
                {selectedItemId && (
                    <ItemDetailModal
                        itemId={selectedItemId}
                        isOpen={!!selectedItemId}
                        onClose={() => setSelectedItemId(null)}
                        onItemUpdated={handleItemUpdated}
                        showActions={true}
                    />
                )}
            </div>
        </>
    );
}
