// src/pages/ItemListPage.tsx
import { useEffect, useState, useCallback } from "react";
import { getItems } from "../api/items";
import ItemList from "../components/ItemList";
import ItemModal from "../components/ItemModal";
import ItemForm from "../components/ItemForm";
import Header from "../components/Header";
import type { Item } from "../types";

export default function ItemListPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // 最新アイテム再取得
    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getItems();
            setItems(res.data || []);
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

    const handleCloseModal = () => {
        setSelectedItemId(null);
        setEditingItem(null);
        setIsFormOpen(false);
    };

    const handleEdit = (item: Item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    // 保存後にリストをAPIで最新化
    const handleSave = async (item: Item) => {
        await fetchItems();
        handleCloseModal();
    };

    // モーダル（編集モード）内からの再取得対応
    const handleItemUpdated = async () => {
        await fetchItems();
    };

    return (
        <>
            <Header />
            <div className="flex items-center mt-4 mb-4">
                <h1 className="text-2xl font-bold">アイテム一覧</h1>
                <button
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={() => {
                        setEditingItem(null);
                        setSelectedItemId(null);
                        setIsFormOpen(true);
                    }}
                >
                    ＋ 追加
                </button>
            </div>



            {loading && <p>読み込み中...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <ItemList
                items={items}
                onItemClick={(id) => {
                    setEditingItem(null);
                    setIsFormOpen(false);
                    setSelectedItemId(id);
                }}
            />

            {selectedItemId && !isFormOpen && (
                <ItemModal
                    itemId={selectedItemId}
                    isOpen={!!selectedItemId}
                    onClose={() => setSelectedItemId(null)}
                    onItemUpdated={handleItemUpdated}
                />
            )}

            {isFormOpen && (
                <ItemForm
                    item={editingItem || undefined}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </>
    );
}