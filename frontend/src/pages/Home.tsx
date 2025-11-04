// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { getItems } from "../api/items";
import ItemList from "../components/ItemList";
import Header from "../components/Header";
import type { Item } from "../types";

export default function Home() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (loading) return <p>読み込み中...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            <Header />
            <h1 className="text-2xl font-bold mb-4">アイテム一覧</h1>
            <ItemList items={items} />
        </>
    );
}
