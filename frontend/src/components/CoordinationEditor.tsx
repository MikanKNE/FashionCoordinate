import { useEffect, useState } from "react";
import { getItems } from "../api/items";
import { addItemToCoordination, removeItemFromCoordination } from "../api/coordination_items";

interface Props {
    coordinationId: number;
}

export default function CoordinationEditor({ coordinationId }: Props) {
    const [allItems, setAllItems] = useState<any[]>([]);
    const [coordinationItems, setCoordinationItems] = useState<any[]>([]);

    // 全アイテム取得
    useEffect(() => {
        fetchItems();
        fetchCoordinationItems();
    }, []);

    const fetchItems = async () => {
        const data = await getItems();
        if (data.status === "success") setAllItems(data.data);
    };

    const fetchCoordinationItems = async () => {
        const res = await fetch(`http://127.0.0.1:8000/api/coordinations/${coordinationId}/`);
        const data = await res.json();
        if (data.status === "success") setCoordinationItems(data.data.items || []);
    };

    const handleAdd = async (itemId: number) => {
        const res = await addItemToCoordination(coordinationId, itemId);
        if (res.status === "success") fetchCoordinationItems();
    };

    const handleRemove = async (itemId: number) => {
        const res = await removeItemFromCoordination(coordinationId, itemId);
        if (res.status === "success") fetchCoordinationItems();
    };

    // まだ追加されていないアイテムのみ表示
    const availableItems = allItems.filter(
        (item) => !coordinationItems.some((ci) => ci.item_id === item.item_id)
    );

    return (
        <div>
            <h2>コーディネーション編集</h2>
            <div style={{ display: "flex", gap: "2rem" }}>
                <div>
                    <h3>追加可能なアイテム</h3>
                    <ul>
                        {availableItems.map((item) => (
                            <li key={item.item_id}>
                                {item.name}
                                <button onClick={() => handleAdd(item.item_id)}>追加</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3>コーディネーション内アイテム</h3>
                    <ul>
                        {coordinationItems.map((item) => (
                            <li key={item.item_id}>
                                {item.name}
                                <button onClick={() => handleRemove(item.item_id)}>削除</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}