import { useEffect, useState } from "react";
import { getUsageByDate } from "../api/usage_history";

export default function UsageHistoryDaily() {
    // 今日を初期値に
    const today = new Date().toISOString().slice(0, 10);
    const [currentDate, setCurrentDate] = useState(today);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // =========================
    // 日付の履歴データを取得
    // =========================
    const load = async (date: string) => {
        setLoading(true);

        try {
            const res = await getUsageByDate(date);
            if (res.status === "success") {
                setItems(res.data);
            } else {
                setItems([]);
            }
        } catch (e) {
            console.error(e);
            setItems([]);
        }

        setLoading(false);
    };

    // 初回ロード
    useEffect(() => {
        load(currentDate);
    }, [currentDate]);

    // =========================
    // 日付の前後移動
    // =========================
    const moveDate = (days: number) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + days);
        setCurrentDate(d.toISOString().slice(0, 10));
    };

    return (
        <div className="p-4 bg-white rounded-xl shadow">
            {/* 上部ナビゲーション */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => moveDate(-1)}
                    className="px-3 py-1 bg-gray-200 rounded"
                >
                    ◁
                </button>

                <h2 className="text-xl font-bold">{currentDate}</h2>

                <button
                    onClick={() => moveDate(1)}
                    className="px-3 py-1 bg-gray-200 rounded"
                >
                    ▷
                </button>
            </div>

            {/* ローディング */}
            {loading && <p>読み込み中...</p>}

            {/* データなし */}
            {!loading && items.length === 0 && (
                <p className="text-gray-500">この日の服装記録はありません</p>
            )}

            {/* アイテム一覧 */}
            <div className="space-y-4">
                {items.map((h) => (
                    <div
                        key={h.history_id}
                        className="border p-3 rounded-lg flex items-center gap-4"
                    >
                        {/* 画像 */}
                        {h.items?.image_url ? (
                            <img
                                src={h.items.image_url}
                                alt={h.items.name}
                                className="w-16 h-16 rounded object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded" />
                        )}

                        <div>
                            <p className="font-semibold">{h.items?.name}</p>
                            <p className="text-sm text-gray-600">
                                天気：{h.weather ?? "-"}
                            </p>
                            <p className="text-sm text-gray-600">
                                気温：{h.temperature ?? "-"}℃
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
