// src/pages/ItemFormPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Item } from "../types";
import { getItemDetail, createItem, updateItem } from "../api/items";
import ItemForm from "../components/ItemUpdateModel";
import Header from "../components/Header";
import toast from "react-hot-toast";

export default function ItemFormPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<Item | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return; // 新規追加の場合
        setLoading(true);
        getItemDetail(Number(id))
            .then((res) => setItem(res.data))
            .catch((err) => {
                console.error(err);
                toast.error("アイテムの取得に失敗しました");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleSave = async (savedItem: Item) => {
        // 保存後一覧ページに戻る
        navigate("/item-list");
    };

    const handleClose = () => navigate("/item-list");

    if (loading) return <p>読み込み中...</p>;

    return (
        <>
            <Header />
            <div className="max-w-md mx-auto mt-8">
                <ItemForm
                    item={item}
                    onSave={handleSave}
                    onClose={handleClose}
                />
            </div>
        </>
    );
}
