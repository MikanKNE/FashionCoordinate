// frontend/src/components/DashboardDeclutterList.tsx
import { useEffect, useState } from "react";
import { getDeclutterCandidates, type DeclutterItem } from "../api";
import { ItemImage } from "./ItemImage";
import { useNavigate } from "react-router-dom";

export default function DashboardDeclutterList() {
    const [items, setItems] = useState<DeclutterItem[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getDeclutterCandidates();
                const top3 = [...res]
                    .sort((a, b) => b.declutter_score - a.declutter_score)
                    .slice(0, 3);

                setItems(top3);
            } catch (e) {
                console.error("断捨離候補取得エラー:", e);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-4">
            <h2
                className="text-lg font-semibold mb-3 flex items-center gap-1
               cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => navigate("/declutter")}
            >
                断捨離候補アイテム
                <span className="text">＞</span>
            </h2>

            <div className="flex flex-col gap-4">
                {items.map((item) => {
                    const isStrong = item.declutter_score >= 10;

                    return (
                        <div
                            key={item.item_id}
                            className="rounded-2xl shadow-md bg-white dark:bg-gray-800
                                       transition-all hover:shadow-lg
                                       p-3 flex gap-3"
                        >
                            {/* 画像 */}
                            <ItemImage
                                itemId={item.item_id}
                                alt={item.name}
                                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                            />

                            {/* 右側 */}
                            <div className="flex-1 space-y-2">
                                {/* ヘッダー */}
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium text-base">
                                        {item.name}
                                    </h3>

                                    <span
                                        className={`text-xs px-2 py-1 rounded
                                            ${isStrong
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {isStrong ? "強め" : "検討"}
                                    </span>
                                </div>

                                {/* スコア */}
                                <p className="text-sm">
                                    断捨離スコア：
                                    <span className="ml-1 text-red-600 font-semibold">
                                        {item.declutter_score}
                                    </span>
                                </p>

                                {/* 理由 */}
                                <ul className="text-xs text-gray-600 space-y-1">
                                    {item.score_breakdown.slice(0, 2).map((s, i) => (
                                        <li key={i} className="flex justify-between">
                                            <span>・{s.reason}</span>
                                            <span>+{s.point}</span>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        </div>
                    );
                })}
            </div>

            {items.length === 0 && (
                <p className="text-gray-500">
                    断捨離候補はありません
                </p>
            )}
        </div>
    );
}
