// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { getItems } from "../api/items";
import ItemList from "../components/ItemList";
import ItemDetailModal from "../components/ItemDetailModal";
import ItemEditModal from "../components/ItemEditModal";
import Header from "../components/Header";
import type { Item } from "../types";

export default function Home() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

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

    const handleCloseDetail = () => setSelectedItemId(null);
    const handleCloseEdit = () => setEditingItem(null);

    return (
        <>
            <Header />
            <h1 className="text-2xl font-bold mb-4">アイテム一覧</h1>

            <ItemList
                items={items}
                onItemClick={(id) => {
                    // 他のモーダルを閉じてから開く例（必要なら）
                    setEditingItem(null);
                    setSelectedItemId(id);
                }}
                onEditClick={(item) => {
                    // 直接編集モーダルを開く
                    setSelectedItemId(null);
                    setEditingItem(item);
                }}
            />

            <ItemDetailModal
                itemId={selectedItemId}
                isOpen={!!selectedItemId}
                onClose={handleCloseDetail}
                onEdit={(item) => {
                    // 詳細→編集への遷移
                    handleCloseDetail();
                    setEditingItem(item);
                }}
            />

            <ItemEditModal item={editingItem} isOpen={!!editingItem} onClose={handleCloseEdit} />
        </>
    );
}
