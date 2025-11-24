// frontend/src/components/UsageHistoryDaily.tsx
import { useEffect, useState } from "react";
import { getUsageByDate } from "../api/usage_history";

function formatDateLocal(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function UsageHistoryDaily({
    date,
    onChangeDate,
}: {
    date: string;
    onChangeDate: (d: string) => void;
}) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const load = async (d: string) => {
        setLoading(true);
        try {
            const res = await getUsageByDate(d);
            if (res.status === "success") setItems(res.data);
            else setItems([]);
        } catch (e) {
            console.error(e);
            setItems([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        load(date);
    }, [date]);

    const moveDate = (days: number) => {
        const d = new Date(date + "T00:00");
        d.setDate(d.getDate() + days);
        onChangeDate(formatDateLocal(d));
    };

    return (
        <div className="p-4 bg-white rounded-xl shadow">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-4">
                <button
                    className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                    onClick={() => moveDate(-1)}
                >
                    ◁
                </button>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {date}
                </h2>

                <button
                    className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                    onClick={() => moveDate(1)}
                >
                    ▷
                </button>
            </div>

            {/* 日別履歴 */}
            {loading && <p>読み込み中...</p>}
            {!loading && items.length === 0 && (
                <p className="text-gray-500">この日の服装記録はありません</p>
            )}

            <div className="space-y-4">
                {items.map((h) => (
                    <div
                        key={h.history_id}
                        className="border p-3 rounded-lg flex items-center gap-4"
                    >
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
