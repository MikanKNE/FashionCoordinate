import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../api/items";
import { getSubcategories } from "../api/subcategories";
import { getStorages } from "../api/storages";
import Header from "../components/Header";
import ItemForm, { type ItemFormValues } from "../components/ItemForm";
import toast from "react-hot-toast";

export default function ItemAddPage() {
    const navigate = useNavigate();
    const [subcategoryList, setSubcategoryList] = useState<any[]>([]);
    const [storageList, setStorageList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [subs, sts] = await Promise.all([getSubcategories(), getStorages()]);
                setSubcategoryList(subs.data || []);
                setStorageList(sts.data || []);
            } catch (err) {
                console.error(err);
                toast.error("フォーム項目の取得に失敗しました");
            }
        })();
    }, []);

    const initialValues: ItemFormValues = {
        name: "",
        category: "",
        subcategory_id: null,
        storage_id: null,
        image_url: "",
        color: "",
        material: "",
        pattern: "",
        season_tag: [],
        tpo_tags: [],
        is_favorite: false,
    };

    const handleSubmit = async (values: ItemFormValues) => {
        setLoading(true);
        try {
            await createItem(values);
            toast.success("アイテムを追加しました");
            navigate("/item-list");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen p-6 text-gray-900 dark:text-gray-100 flex flex-col items-center">
                <div className="w-full max-w-6xl mb-4">
                    <h1 className="text-2xl font-bold">アイテム追加</h1>
                </div>
                <ItemForm
                    initialValues={initialValues}
                    subcategoryList={subcategoryList}
                    storageList={storageList}
                    loading={loading}
                    onSubmit={handleSubmit}
                />
            </div>
        </>
    );
}
