import { useEffect, useState } from "react";
import Modal from "./Modal";
import {
    getItemDetail,
    addFavorite,
    addItemToCoordination,
} from "../api/items";

export interface Item {
    item_id: number;
    name: string;
    category?: string;
    image_url?: string;
    description?: string;
    created_at?: string;
}

interface ItemDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: number | null;
    coordinationId?: number; // 任意（指定時に「コーデ追加」ボタン表示）
}

export default function ItemDetailModal({
    isOpen,
    onClose,
    itemId,
    coordinationId,
}: ItemDetailModalProps) {
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // 詳細データ取得
    useEffect(() => {
        if (isOpen && itemId) {
            setMessage("");
            fetchDetail(itemId);
        }
    }, [isOpen, itemId]);

    const fetchDetail = async (id: number) => {
        try {
            setLoading(true);
            const data = await getItemDetail(id);
            setItem(data);
        } catch (err) {
            setMessage("詳細データの取得に失敗しました。");
        } finally {
            setLoading(false);
        }
    };

    const handleAddFavorite = async () => {
        try {
            const user_id = "test-user"; // 認証後にユーザーIDを取得する箇所
            await addFavorite(user_id, item!.item_id);
            setMessage("お気に入りに追加しました！");
        } catch {
            setMessage("お気に入り追加に失敗しました。");
        }
    };

    const handleAddCoordination = async () => {
        try {
            if (!coordinationId) {
                setMessage("コーディネートIDが指定されていません。");
                return;
            }
            await addItemToCoordination(coordinationId, item!.item_id);
            setMessage("コーディネートに追加しました！");
        } catch {
            setMessage("コーディネート追加に失敗しました。");
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="アイテム詳細"
            footer={
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={handleAddFavorite}
                        className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                    >
                        ★ お気に入り追加
                    </button>
                    {coordinationId && (
                        <button
                            onClick={handleAddCoordination}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            コーディネートに追加
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                    >
                        閉じる
                    </button>
                </div>
            }
        >
            {loading ? (
                <p>読み込み中...</p>
            ) : item ? (
                <div className="flex flex-col items-center text-center">
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-48 h-48 object-cover rounded-xl mb-4"
                        />
                    ) : (
                        <div className="w-48 h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                        </div>
                    )}
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    {item.category && (
                        <p className="text-gray-500 mt-1">{item.category}</p>
                    )}
                    {item.description && (
                        <p className="mt-3 text-sm text-gray-600">
                            {item.description}
                        </p>
                    )}
                    {item.created_at && (
                        <p className="mt-2 text-xs text-gray-400">
                            登録日: {new Date(item.created_at).toLocaleDateString()}
                        </p>
                    )}
                    {message && (
                        <p className="mt-3 text-sm text-blue-500">{message}</p>
                    )}
                </div>
            ) : (
                <p>データが見つかりません。</p>
            )}
        </Modal>
    );
}
