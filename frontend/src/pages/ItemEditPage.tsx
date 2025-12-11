// frontend/src/pages/ItemEditPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getSubcategories } from "../api/subcategories";
import { getStorages } from "../api/storages";
import { getItemDetail, updateItem } from "../api/items";

import Header from "../components/Header";
import ItemForm from "../components/ItemForm";
import type { ItemFormValues } from "../components/ItemForm";

export default function ItemEditPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const itemId = Number(id);

    const [subcategoryList, setSubcategoryList] = useState<any[]>([]);
    const [storageList, setStorageList] = useState<any[]>([]);
    const [initialValues, setInitialValues] = useState<ItemFormValues | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [subs, sts, itemRes] = await Promise.all([
                    getSubcategories(),
                    getStorages(),
                    getItemDetail(itemId),
                ]);

                setSubcategoryList(subs.data || []);
                setStorageList(sts.data || []);

                const item = itemRes.data;
                if (item) {
                    setInitialValues({
                        item_id: item.item_id,
                        name: item.name,
                        category: item.category || "",
                        subcategory_id: item.subcategory_id || null,
                        storage_id: item.storage_id || null,
                        image_url: item.image_url || "",
                        image_file: null,
                        color: item.color || "",
                        material: item.material || "",
                        pattern: item.pattern || "",
                        season_tag: item.season_tag || [],
                        tpo_tags: item.tpo_tags || [],
                        is_favorite: item.is_favorite || false,
                    });
                }
            } catch (err) {
                console.error(err);
                toast.error("アイテム情報の取得に失敗しました");
            }
        })();
    }, [itemId]);

    if (!initialValues) return <p>読み込み中...</p>;

    const handleSubmit = async (values: ItemFormValues) => {
        setLoading(true);
        try {
            await updateItem(itemId, values);
            toast.success("アイテムを更新しました");
            navigate("/item-list");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen p-6 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-4">アイテム編集</h1>

                    <ItemForm
                        initialValues={initialValues}
                        subcategoryList={subcategoryList}
                        storageList={storageList}
                        loading={loading}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </>
    );
}
