// frontend/src/pages/Coordination.tsx
import React, { useEffect, useMemo, useState } from "react";
import CoordinationForm from "../components/CoordinationForm";
import CoordinationPreview from "../components/CoordinationPreview";
import Filter from "../components/Filter";
import type { Item, Subcategory, MultiFilters } from "../types";
import { getItems } from "../api/items";
import Header from "../components/Header";
import Card from "../components/ui/Card";
import ItemCard from "../components/ItemCard";

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
      if (filters.subcategory_ids.length > 0 && (!i.subcategory_id || !filters.subcategory_ids.includes(i.subcategory_id)))
        return false;
      if (filters.color.length && !filters.color.includes(i.color!)) return false;
      if (filters.material.length && !filters.material.includes(i.material!)) return false;
      if (filters.pattern.length && !filters.pattern.includes(i.pattern!)) return false;
      if (filters.season_tag.length && !(i.season_tag || []).some((s) => filters.season_tag.includes(s))) return false;
      if (filters.tpo_tags.length && !(i.tpo_tags || []).some((s) => filters.tpo_tags.includes(s))) return false;
      if (filters.is_favorite !== undefined && i.is_favorite !== filters.is_favorite) return false;
      return true;
    });
  }, [allItems, filters]);

  const toggleSelectItem = (item: Item) => {
    const exists = selectedItems.some((i) => i.item_id === item.item_id);
    if (exists) setSelectedItems((prev) => prev.filter((i) => i.item_id !== item.item_id));
    else setSelectedItems((prev) => [...prev, item]);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen p-6 text-slate-800 dark:text-slate-100">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">コーディネート登録</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 左：フィルター */}
            <aside className="md:col-span-1 sticky top-6 space-y-4">
              <Filter
                filters={filters}
                setFilters={setFilters}
                subcategoriesByParent={subcategoriesByParent}
                uniqueValues={uniqueValues}
              />
            </aside>

            {/* 中央：アイテム一覧 */}
            <main className="md:col-span-2">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4 text-sm text-slate-600 dark:text-slate-400">
                  <span>{loading ? "読み込み中..." : `${filteredItems.length} アイテム`}</span>
                  <span>選択済み: {selectedItems.length}</span>
                </div>
                {error && <div className="text-red-500 mb-3">{error}</div>}
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
