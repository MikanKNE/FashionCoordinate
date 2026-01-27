// frontend/src/components/UsageHistoryDaily.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getUsageByDate } from "../api/usage_history";
import { Button } from "./ui/Button";
import { ItemImage } from "./ItemImage";

function formatDateLocal(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

type UsageHistoryRow = {
    history_id: number;
    item_id: number | null;
    items?: {
        item_id: number;
        name: string;
    };
    weather?: string | null;
    temperature?: number | null;
};

export default function UsageHistoryDaily({
    date,
    onChangeDate,
}: {
    date: string;
    onChangeDate: (d: string) => void;
}) {
    const navigate = useNavigate();
    const [items, setItems] = useState<UsageHistoryRow[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadSafe = async () => {
            setLoading(true);
            try {
                const res = await getUsageByDate(date);
                if (cancelled) return;

                if (res.status === "success") {
                    setItems(res.data);
                } else {
                    setItems([]);
                }
            } catch (e: any) {
                if (cancelled) return;

                if (e?.message !== "ログインが必要です") {
                    toast.error("服装履歴の取得に失敗しました");
                }
                setItems([]);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadSafe();

        return () => {
            cancelled = true;
        };
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
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 whitespace-nowrap">
                    <button
                        className="px-2 py-1 text-sm rounded-lg bg-gray-100 dark:bg-slate-700"
                        onClick={() => moveDate(-1)}
                    >
                        ◁
                    </button>

                    <h2 className="text-lg font-semibold">{date}</h2>

                    <button
                        className="px-2 py-1 text-sm rounded-lg bg-gray-100 dark:bg-slate-700"
                        onClick={() => moveDate(1)}
                    >
                        ▷
                    </button>
                </div>

                <div className="ml-auto">
                    <Button onClick={handleEdit}>
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
                        className="rounded-2xl shadow-md bg-white dark:bg-gray-800 p-3 flex items-center gap-4"
                    >
                        {/* 左：画像（共通コンポーネント） */}
                        {h.items?.item_id ? (
                            <ItemImage
                                itemId={h.items.item_id}
                                alt={h.items.name}
                                className="w-16 h-16 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                                No Image
                            </div>
                        )}

                        {/* 右：情報 */}
                        <div className="flex flex-col items-start">
                            <p className="font-semibold">
                                {h.items?.name ?? "不明なアイテム"}
                            </p>
                            {/* 将来表示する場合
                            <p className="text-sm text-gray-600">
                                天気：{h.weather ?? "-"}
                            </p>
                            <p className="text-sm text-gray-600">
                                気温：{h.temperature ?? "-"}℃
                            </p>
                            */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
