import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Header from "../components/Header";
import { Button } from "../components/ui/Button";
import Card from "../components/ui/Card";
import { ItemImage } from "../components/ItemImage";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { useNavigate } from "react-router-dom";

import {
    getDiscardItems,
    bulkDeleteItems,
    cancelDiscard
} from "../api/items";

type DiscardItem = {
    item_id: number;
    name: string;
    usage_count: number;
    last_used_date: string | null;
    days_since_created: number;
};

export default function DiscardPage() {
    const [items, setItems] = useState<DiscardItem[]>([]);
    const [checkedIds, setCheckedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getDiscardItems()
            .then(setItems)
            .catch(() => {
                toast.error("処分予定アイテムの取得に失敗しました");
            })
            .finally(() => setLoading(false));
    }, []);

    const toggleCheck = (itemId: number) => {
        setCheckedIds(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    /** 削除確定 */
    const handleConfirmDelete = async () => {
        try {
            await bulkDeleteItems(checkedIds);

            setItems(prev =>
                prev.filter(item => !checkedIds.includes(item.item_id))
            );
            setCheckedIds([]);
            setIsDeleteModalOpen(false);

            toast.success("選択したアイテムを削除しました");
        } catch (err) {
            toast.error("削除に失敗しました");
        }
    };

    if (loading) {
        return <p className="p-6">読み込み中...</p>;
    }

    return (
        <>
            <Header />

            <div className="p-6 space-y-6">
                {/* ヘッダー */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        処分予定アイテム
                    </h1>

                    <Button
                        className="max-w-xs"
                        variant="secondary"
                        onClick={() => navigate("/declutter")}
                    >
                        断捨離提案に戻る
                    </Button>
                </div>

                {items.length === 0 ? (
                    <p className="text-gray-500">
                        処分予定のアイテムはありません
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 左：候補アイテム一覧 */}
                        <main className="md:col-span-2 space-y-4">
                            {items.map(item => (
                                <Card
                                    key={item.item_id}
                                    className={`p-4 cursor-pointer transition
        ${checkedIds.includes(item.item_id)
                                            ? "ring-2 ring-red-400 bg-red-50"
                                            : "hover:bg-gray-50"
                                        }`}
                                    onClick={() => toggleCheck(item.item_id)}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* 見た目用チェックボックス */}
                                        <input
                                            type="checkbox"
                                            checked={checkedIds.includes(item.item_id)}
                                            readOnly
                                            className="pointer-events-none"
                                        />

                                        <ItemImage
                                            itemId={item.item_id}
                                            className="w-20 h-20 rounded bg-gray-100"
                                        />

                                        <div className="flex-1">
                                            <h3 className="font-semibold">
                                                {item.name}
                                            </h3>

                                            <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                                                <p>着用回数：{item.usage_count}回</p>
                                                <p>
                                                    最終着用日：
                                                    {item.last_used_date ?? "未使用"}
                                                </p>
                                                <p>
                                                    登録から：
                                                    {item.days_since_created}日
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </main>

                        {/* 右：操作パネル */}
                        <aside className="md:col-span-1 sticky top-6">
                            <Card className="p-4 space-y-4">
                                <h2 className="font-semibold">
                                    選択中アイテム（{checkedIds.length}）
                                </h2>

                                {checkedIds.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        アイテムを選択してください
                                    </p>
                                ) : (
                                    <>
                                        {/* 処分解除 */}
                                        <Button
                                            variant="secondary"
                                            onClick={async () => {
                                                try {
                                                    await Promise.all(
                                                        checkedIds.map(id =>
                                                            cancelDiscard(id)
                                                        )
                                                    );
                                                    setItems(prev =>
                                                        prev.filter(
                                                            i =>
                                                                !checkedIds.includes(
                                                                    i.item_id
                                                                )
                                                        )
                                                    );
                                                    setCheckedIds([]);
                                                    toast.success("処分予定を解除しました");
                                                } catch {
                                                    toast.error("解除に失敗しました");
                                                }
                                            }}
                                        >
                                            処分予定を解除
                                        </Button>

                                        {/* 削除 */}
                                        <Button
                                            variant="danger"
                                            onClick={() =>
                                                setIsDeleteModalOpen(true)
                                            }
                                        >
                                            完全に削除
                                        </Button>

                                        {/* 選択中リスト */}
                                        <ul className="text-sm space-y-1">
                                            {items
                                                .filter(i =>
                                                    checkedIds.includes(i.item_id)
                                                )
                                                .map(i => (
                                                    <li key={i.item_id}>
                                                        ・{i.name}
                                                    </li>
                                                ))}
                                        </ul>
                                    </>
                                )}
                            </Card>
                        </aside>
                    </div>
                )}
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="アイテム削除の確認"
                description={`選択した ${checkedIds.length} 件のアイテムを完全に削除します。
この操作は取り消せません。`}
            />
        </>
    );
}
