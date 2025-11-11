// src/pages/ItemListPage.tsx
import { useEffect, useState } from "react";
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

    useEffect(() => {
        const fetchItems = async () => {
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
        };
        fetchItems();
    }, []);

    const handleCloseModal = () => {
        setSelectedItemId(null);
        setEditingItem(null);
        setIsFormOpen(false);
    };

    const handleEdit = (item: Item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleSave = (item: Item) => {
        const index = items.findIndex((i) => i.item_id === item.item_id);
        if (index >= 0) {
            // 更新
            const newItems = [...items];
            newItems[index] = item;
            setItems(newItems);
        } else {
            // 新規追加
            setItems([...items, item]);
        }
        handleCloseModal();
    };

    return (
        <>
            <Header />
            <h1 className="text-2xl font-bold mb-4">アイテム一覧</h1>

            {loading && <p>読み込み中...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <ItemList
                items={items}
                onItemClick={(id) => {
                    setEditingItem(null);
                    setIsFormOpen(false);
                    setSelectedItemId(id);
                }}
                onEditClick={(item) => {
                    setSelectedItemId(item.item_id);
                    handleEdit(item);
                }}
            />

            {selectedItemId && !isFormOpen && (
                <ItemModal
                    itemId={selectedItemId}
                    isOpen={!!selectedItemId}
                    onClose={() => setSelectedItemId(null)}
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
