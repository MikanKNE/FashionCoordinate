// frontend/src/components/CoordinationEditor.tsx
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

import { getAllCoordinationItems } from "../api/coordination_items";
import { getItems } from "../api/items";

import Card from "./ui/Card";

import CoordinationForm from "./CoordinationForm";
import Filter from "./Filter";
import ItemCard from "./ItemCard";

import type { Item, MultiFilters, Coordination, CoordinationItem } from "../types";
import { COLOR_OPTIONS, MATERIAL_OPTIONS, PATTERN_OPTIONS, } from "../types";

interface Props {
  coordination?: Coordination; // 編集時に渡す
  onSubmitSuccess?: () => void;
}

const CoordinationEditor: React.FC<Props> = ({ coordination, onSubmitSuccess }) => {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
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
  const [error] = useState<string | null>(null);

  const fetchedCoordinationRef = useRef<number | null>(null);

  const matchWithOther = (
    rawValue: string | null,
    selected: string[],
    options: readonly string[]
  ): boolean => {
    if (selected.length === 0) return true;

    if (!rawValue) {
      return selected.includes("未選択");
    }

    const values = rawValue.split(",").map(v => v.trim());
    const normals = values.filter(v => options.includes(v));
    const hasOther = values.some(v => !options.includes(v));

    if (selected.some(v => normals.includes(v))) return true;
    if (hasOther && selected.includes("その他")) return true;

    return false;
  };

  // アイテム初回取得
  useEffect(() => {
    const currentId = coordination?.coordination_id ?? -1;

    // 同じ coordination では二度 fetch しない
    if (fetchedCoordinationRef.current === currentId) return;
    fetchedCoordinationRef.current = currentId;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await getItems();
        const itemsArr: Item[] = Array.isArray(res) ? res : res?.data || [];
        setAllItems(itemsArr);
        setFilteredItems(itemsArr);

        if (coordination) {
          const ciRes = await getAllCoordinationItems();
          const ciList: CoordinationItem[] = ciRes?.data ?? [];
          const itemsMap = new Map<number, Item>();
          itemsArr.forEach((item: Item) => itemsMap.set(item.item_id, item));

          const selected = ciList
            .filter(ci => ci.coordination_id === coordination.coordination_id)
            .map(ci => itemsMap.get(ci.item_id))
            .filter(Boolean) as Item[];

          setSelectedItems(selected);
        }
      } catch (e) {
        console.error(e);
        toast.error("アイテム取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [coordination]);


  // フィルター適用
  useEffect(() => {
    if (!allItems) return;

    const filtered = allItems.filter(item => {
      const subcategoryMatch =
        filters.subcategory_ids.length === 0 ||
        (item.subcategory_id !== undefined && filters.subcategory_ids.includes(item.subcategory_id));
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
      if (filters.name && !item.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* 左：Filter */}
      <aside className="md:col-span-1 sticky top-6 space-y-4">
        <Filter filters={filters} setFilters={setFilters} />
      </aside>

      {/* 中央：アイテム一覧 */}
      <main className="md:col-span-2">
        <Card className="p-4">
          {loading && <div>読み込み中...</div>}

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

      {/* 右：選択 + フォーム */}
      <aside className="md:col-span-1 sticky top-6">
        <Card className="space-y-4 p-4">
          <h4 className="text-lg font-semibold">選択中アイテム</h4>
          {/* フォーム */}
          <CoordinationForm
            selectedItems={selectedItems}
            coordination={coordination}
            onSubmitSuccess={onSubmitSuccess}
          />

          {/* 画像一覧 */}
          <div className="space-y-2">
            {selectedItems.map((item) => (
              <ItemCard
                key={item.item_id}
                item={item}
                compact
                disableHover
              />
            ))}
          </div>
        </Card>
      </aside>
    </div>
  );
};

export default CoordinationEditor;
