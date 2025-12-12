// frontend/src/components/UsageHistoryDaily.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getUsageByDate } from "../api/usage_history";
import { API_BASE } from "../api/index";
import { Button } from "./ui/Button";
import type { UsageHistory } from "../types";

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
    const navigate = useNavigate();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function getSignedUrl(item_id: number) {
        const res = await fetch(`${API_BASE}/items/${item_id}/image/`);
        const json = await res.json();
        return json.url || null;
    }

    const load = async (d: string) => {
        setLoading(true);
        try {
            const res = await getUsageByDate(d);

            if (res.status === "success") {
                const rows = res.data;

                // 各アイテムに signed URL を付与
                const withSigned = await Promise.all(
                    rows.map(async (h) => {
                        const signed = await getSignedUrl(h.item_id);
                        return {
                            ...h,
                            items: {
                                ...h.items,
                                image_url: signed,
                            },
                        };
                    })
                );

                setItems(withSigned);
            } else {
                setItems([]);
            }
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

    const handleEdit = () => {
        navigate(`/outfit-form?date=${date}`);
    };

    return (
        <div className="space-y-4">
            {/* ヘッダー */}
            <div className="relative flex items-center mb-4">
                {/* 中央：日付と ◁▷ */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 whitespace-nowrap">
                    <button
                        className="px-2 py-1 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                        onClick={() => moveDate(-1)}
                    >
                        ◁
                    </button>

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{date}</h2>

                    <button
                        className="px-2 py-1 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                        onClick={() => moveDate(1)}
                    >
                        ▷
                    </button>
                </div>

                {/* 右端：登録 / 編集ボタン */}
                <div className="ml-auto">
                    <Button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={handleEdit}
                    >
                        {items.length > 0 ? "編集" : "登録"}
                    </Button>
                </div>
            </div>

            {/* 内容 */}
            {loading && <p>読み込み中...</p>}
            {!loading && items.length === 0 && (
                <p className="text-gray-500">この日の服装記録はありません</p>
            )}

            <div className="flex flex-col gap-4">
                {items.map((h) => (
                    <div
                        key={h.history_id}
                        className="relative rounded-2xl shadow-md bg-white dark:bg-gray-800 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-lg p-3 flex items-center gap-4"
                    >
                        {/* 左：画像 */}
                        {h.items?.image_url ? (
                            <img
                                src={h.items.image_url}
                                alt={h.items.name}
                                className="w-16 h-16 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                                No Image
                            </div>
                        )}

                        {/* 右：アイテム名・天気・気温 */}
                        <div className="flex flex-col items-start">
                            <p className="font-semibold">{h.items?.name}</p>
                            {/* <p className="text-sm text-gray-600">天気：{h.weather ?? "-"}</p>
                            <p className="text-sm text-gray-600">気温：{h.temperature ?? "-"}℃</p> */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
