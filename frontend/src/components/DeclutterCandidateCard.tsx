// src/components/DeclutterCandidateCard.tsx
import { useState } from "react";
import Card from "./ui/Card";
import { Button } from "./ui/Button";
import type { DeclutterItem } from "../api";
import { updateDeclutterAction } from "../api/declutter";
import { ItemImage } from "./ItemImage";

type Props = {
    item: DeclutterItem;
    onActionComplete: (itemId: number) => void;
};

export function DeclutterCandidateCard({
    item,
    onActionComplete,
}: Props) {
    const [loading, setLoading] = useState(false);
    const isStrong = item.declutter_score >= 10;

    const handleAction = async (
        action: "pending" | "favorite" | "discard"
    ) => {
        setLoading(true);
        try {
            await updateDeclutterAction(item.item_id, action);
            onActionComplete(item.item_id);
        } catch (e) {
            console.error(e);
            alert("操作に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-4">
            <div className="flex gap-4">
                {/* 画像 */}
                <ItemImage
                    itemId={item.item_id}
                    className="w-24 h-24 object-cover rounded bg-gray-100 flex-shrink-0"
                />

                {/* 右側コンテンツ */}
                <div className="flex-1 space-y-3">
                    {/* ヘッダー */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                            {item.name}
                        </h3>

                        <span
                            className={`text-sm px-2 py-1 rounded
                                ${isStrong
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                        >
                            {isStrong ? "強めの提案" : "検討候補"}
                        </span>
                    </div>

                    {/* スコア */}
                    <p className="text-sm font-medium">
                        断捨離スコア：
                        <span className="ml-1 text-red-600 dark:text-red-400 space-y-1">
                            {item.declutter_score}
                        </span>
                    </p>

                    {/* 理由 */}
                    <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {item.score_breakdown.map((s, i) => (
                            <li key={i} className="flex justify-between">
                                <span>・{s.reason}</span>
                                <span className="text-gray-500">
                                    {s.point > 0 ? `+${s.point}` : s.point}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* 補足情報 */}
                    <div className="text-xs text-gray-500  dark:text-gray-400 space-y-1">
                        <p>着用回数：{item.stats.usage_count}回</p>
                        <p>
                            最終着用日：
                            {item.stats.last_used_date ?? "未使用"}
                        </p>
                        <p>
                            登録から：
                            {item.stats.days_since_created}日
                        </p>
                    </div>

                    {/* アクション */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="secondary"
                            disabled={loading}
                            onClick={() => handleAction("pending")}
                        >
                            保留
                        </Button>

                        <Button
                            variant="secondary"
                            disabled={loading}
                            onClick={() => handleAction("favorite")}
                        >
                            お気に入り
                        </Button>

                        <Button
                            variant="danger"
                            disabled={loading}
                            onClick={() => handleAction("discard")}
                        >
                            処分予定
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
