// src/components/DeclutterCandidateCard.tsx
import Card from "./ui/Card";
import { Button } from "./ui/Button";
import type { DeclutterItem } from "../api";

type Props = {
    item: DeclutterItem;
};

export function DeclutterCandidateCard({ item }: Props) {
    const isStrong = item.declutter_score >= 10;

    return (
        <Card className="p-4 space-y-3">
            {/* ヘッダー */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{item.name}</h3>

                <span
                    className={`text-sm px-2 py-1 rounded
            ${isStrong ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}
          `}
                >
                    {isStrong ? "強めの提案" : "検討候補"}
                </span>
            </div>

            {/* 理由 */}
            <ul className="list-disc pl-5 text-sm text-gray-700">
                {item.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                ))}
            </ul>

            {/* 補足情報 */}
            <div className="text-xs text-gray-500">
                <p>着用回数：{item.stats.usage_count}回</p>
                <p>
                    最終着用日：
                    {item.stats.last_used_date ?? "未使用"}
                </p>
                <p>登録から：{item.stats.days_since_created}日</p>
            </div>

            {/* アクション */}
            <div className="flex gap-2 pt-2">
                <Button variant="secondary">残す</Button>
                <Button variant="secondary">お気に入り</Button>
                <Button variant="danger">処分予定</Button>
            </div>
        </Card>
    );
}
