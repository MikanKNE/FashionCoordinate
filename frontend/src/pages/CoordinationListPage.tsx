// src/pages/CoordinationListPage.tsx
import { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import ItemCard from "../components/ItemCard";
import toast from "react-hot-toast";
import { getCoordinations } from "../api/coordinations";
import { getAllCoordinationItems } from "../api/coordination_items";
import { getItems } from "../api/items";
import CoordinationDetailModal from "../components/CoordinationDetailModal";
import type { Coordination, Item, CoordinationItem } from "../types";

export default function CoordinationListPage() {
    const [coordinations, setCoordinations] = useState<Coordination[]>([]);
    const [coordinationItems, setCoordinationItems] = useState<CoordinationItem[]>([]);
    const [selected, setSelected] = useState<Coordination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // コーディネーション一覧取得
            const res = await getCoordinations();
            const list = res?.data ?? [];
            setCoordinations(list);

            // コーディネーションアイテム中間テーブル取得
            const ciRes = await getAllCoordinationItems();
            const ciListRaw = ciRes?.data ?? [];

            // アイテム一覧取得
            const itemsRes = await getItems();
            const itemsMap = new Map<number, Item>();
            itemsRes.data.forEach((item: Item) => itemsMap.set(item.item_id, item));

            // ciList に item を紐付け
            const ciList: CoordinationItem[] = ciListRaw.map((ci: { coordination_id: number; item_id: number }) => ({
                coordination_id: ci.coordination_id,
                item_id: ci.item_id,
                item: itemsMap.get(ci.item_id),
            }));

            setCoordinationItems(ciList);
        } catch (e) {
            console.error(e);
            setError("コーディネーション一覧の取得に失敗しました");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    // コーディネーションごとに紐づくアイテム配列を取得（最大2個）
    const getItemsForCoordination = (coordination_id: number): Item[] => {
        const related = coordinationItems.filter(ci => ci.coordination_id === coordination_id);
        return related.map(ci => ci.item).filter(Boolean) as Item[];
    };

    return (
        <>
            <Header />

            <div className="min-h-screen p-6 text-slate-800 dark:text-slate-100">
                <div className="max-w-6xl mx-auto">
                    {/* ヘッダー＆新規作成ボタン */}
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">コーディネーション一覧</h1>
                        <Button
                            className="max-w-xs"
                            onClick={() => (window.location.href = "/coordination/new")}
                        >
                            ＋ 作成
                        </Button>
                    </div>

                    {/* 読み込み中・エラー表示 */}
                    {loading && <p>読み込み中...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    {/* コーディネーションカード */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {coordinations.map(c => {
                            const items = getItemsForCoordination(c.coordination_id).slice(0, 2); // 最大2個
                            return (
                                <Card
                                    key={c.coordination_id}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                                    onClick={() => setSelected(c)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-lg font-semibold">{c.name}</div>
                                        <div className="text-xl text-yellow-500">
                                            {c.is_favorite ? "★" : "☆"}
                                        </div>
                                    </div>

                                    {/* アイテムカード表示（最大2個） */}
                                    <div className="mt-2 flex gap-2">
                                        {items.length ? (
                                            items.map((item: Item) => (
                                                <ItemCard
                                                    key={item.item_id}
                                                    item={item}
                                                    compact={true} // 小型表示
                                                />
                                            ))
                                        ) : (
                                            <div className="text-gray-400">アイテムなし</div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* モーダル */}
                {selected && (
                    <CoordinationDetailModal
                        coordination={selected}
                        isOpen={!!selected}
                        onClose={() => setSelected(null)}
                    />
                )}
            </div>
        </>
    );
}
