import React, { useEffect, useState } from "react";
import CoordinationForm from "../components/CoordinationForm";
import CoordinationPreview from "../components/CoordinationPreview";
import Filter from "../components/Filter";
import type { Item, MultiFilters } from "../types";
import Header from "../components/Header";
import Card from "../components/ui/Card";
import ItemCard from "../components/ItemCard";
import { getItems } from "../api/items";

export default function CoordinationAddPage() {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [filters, setFilters] = useState<MultiFilters>({
    subcategory_ids: [],
    color: [],
    material: [],
    pattern: [],
    season_tag: [],
    tpo_tags: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------
  // アイテム初回取得
  // ------------------------------
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await getItems();
        const itemsArr = Array.isArray(res) ? res : res?.data || [];
        setAllItems(itemsArr);
        setFilteredItems(itemsArr);
      } catch (e) {
        console.error(e);
        setError("アイテム取得に失敗しました");
        setAllItems([]);
        setFilteredItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // ------------------------------
  // フィルター適用
  // ------------------------------
  useEffect(() => {
    if (!allItems) return;

    const filtered = allItems.filter(item => {
      const subcategoryMatch =
        filters.subcategory_ids.length === 0 ||
        (item.subcategory_id !== undefined && filters.subcategory_ids.includes(item.subcategory_id));

      const colorMatch =
        filters.color.length === 0 || (item.color && filters.color.includes(item.color));
      const materialMatch =
        filters.material.length === 0 || (item.material && filters.material.includes(item.material));
      const patternMatch =
        filters.pattern.length === 0 || (item.pattern && filters.pattern.includes(item.pattern));
      const seasonMatch =
        filters.season_tag.length === 0 ||
        (item.season_tag?.some(s => filters.season_tag.includes(s)) ?? false);
      const tpoMatch =
        filters.tpo_tags.length === 0 ||
        (item.tpo_tags?.some(t => filters.tpo_tags.includes(t)) ?? false);

      return subcategoryMatch && colorMatch && materialMatch && patternMatch && seasonMatch && tpoMatch;
    });

    setFilteredItems(filtered);
  }, [filters, allItems]);

  const toggleSelectItem = (item: Item) => {
    const exists = selectedItems.some(i => i.item_id === item.item_id);
    if (exists) setSelectedItems(prev => prev.filter(i => i.item_id !== item.item_id));
    else setSelectedItems(prev => [...prev, item]);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen p-6 text-slate-800 dark:text-slate-100">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">コーディネート登録</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 左：Filter */}
            <aside className="md:col-span-1 sticky top-6 space-y-4">
              <Filter filters={filters} setFilters={setFilters} />
            </aside>

            {/* 中央：アイテム一覧 */}
            <main className="md:col-span-2">
              <Card className="p-4">
                {loading && <div>読み込み中...</div>}
                {error && <div className="text-red-500">{error}</div>}

                {!loading && !error && (
                  <>
                    <div className="flex items-center justify-between mb-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>{filteredItems.length} アイテム</span>
                      <span>選択済み: {selectedItems.length}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredItems.map(it => {
                        const selected = selectedItems.some(s => s.item_id === it.item_id);
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

            {/* 右：選択 + 登録フォーム */}
            <aside className="md:col-span-1 sticky top-6">
              <Card className="space-y-4 p-4">
                <h4 className="text-lg font-semibold mb-2">選択中アイテム</h4>
                <CoordinationForm selectedItems={selectedItems} />
                <CoordinationPreview items={selectedItems} />
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
