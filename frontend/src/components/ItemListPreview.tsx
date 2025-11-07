// frontend/src/components/ItemListPreview.tsx
import { useEffect, useState } from "react";
import { getItems } from "../api/items";

export default function ItemListPreview() {
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        getItems().then((res) => {
            const list = Array.isArray(res) ? res : res.data
            setItems(list.slice(0, 5))
        })
    }, [])

    return (
        <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">アイテム一覧</h2>
            <ul className="space-y-2">
                {items.map((item) => (
                    <li key={item.id} className="border-b pb-1">
                        {item.name || item.item_name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
