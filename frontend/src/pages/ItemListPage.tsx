// src/pages/ItemListPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getItems } from "../api/items";
import { Button } from "../components/ui/Button";
import Filter from "../components/Filter";
import Header from "../components/Header";
import ItemDetailModal from "../components/ItemDetailModal";
import ItemList from "../components/ItemList";
import type { MultiFilters, Item } from "../types";

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
        name: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    const navigate = useNavigate();

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

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // ------------------------------
    // フィルター適用（名前検索含む）
    // ------------------------------
    useEffect(() => {
        const filtered = items.filter(item => {
            const subcategoryMatch =
                filters.subcategory_ids.length === 0 ||
                (item.subcategory_id !== undefined && filters.subcategory_ids.includes(item.subcategory_id));

            const itemColors = item.color ? item.color.split(",").map(c => c.trim()) : ["未選択"];
            const colorMatch = filters.color.length === 0 || filters.color.some(f => itemColors.includes(f));

            const itemMaterials = item.material ? item.material.split(",").map(c => c.trim()) : ["未選択"];
            const materialMatch = filters.material.length === 0 || filters.material.some(f => itemMaterials.includes(f));

            const itemPatterns = item.pattern ? item.pattern.split(",").map(c => c.trim()) : ["未選択"];
            const patternMatch = filters.pattern.length === 0 || filters.pattern.some(f => itemPatterns.includes(f));

            const seasonMatch =
                filters.season_tag.length === 0 ||
                (item.season_tag?.some(s => filters.season_tag.includes(s)) ?? false);

            const tpoMatch =
                filters.tpo_tags.length === 0 ||
                (item.tpo_tags?.some(t => filters.tpo_tags.includes(t)) ?? false);

            const nameMatch =
                !filters.name ||
                item.name.toLowerCase().includes(filters.name.toLowerCase());

            return subcategoryMatch && colorMatch && materialMatch && patternMatch && seasonMatch && tpoMatch && nameMatch;
        });

        setFilteredItems(filtered);
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
                        className="max-w-xs"
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
                    />
                )}
            </div>
        </>
    );
}
