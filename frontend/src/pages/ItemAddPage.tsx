// src/pages/ItemAddPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../api/items";
import { getSubcategories } from "../api/subcategories";
import { getStorages } from "../api/storages";
import { Button } from "../components/ui/Button";
import Card from "../components/ui/Card";
import toast from "react-hot-toast";
import Header from "../components/Header";

export default function ItemAddPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
    const [storageId, setStorageId] = useState<number | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [color, setColor] = useState("");
    const [material, setMaterial] = useState("");
    const [pattern, setPattern] = useState("");
    const [seasonTag, setSeasonTag] = useState<string[]>([]);
    const [tpoTags, setTpoTags] = useState<string[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    const [subcategoryList, setSubcategoryList] = useState<any[]>([]);
    const [storageList, setStorageList] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const subs = await getSubcategories();
                setSubcategoryList(subs.data || []);
                const sts = await getStorages();
                setStorageList(sts.data || []);
            } catch (err) {
                console.error(err);
                toast.error("フォーム項目の取得に失敗しました");
            }
        })();
    }, []);

    const toggleArrayValue = (value: string, list: string[], setter: (s: string[]) => void) => {
        setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        const subs = subcategoryList.filter(s => s.category === value);
        const other = subs.find(s => s.name === "その他");
        setSubcategoryId(other?.subcategory_id || null);
    };

    const isSubcategoryDisabled = (cat: string) => !["服", "靴", "アクセサリー"].includes(cat);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            name,
            category,
            subcategory_id: subcategoryId || null,
            storage_id: storageId || null,
            image_url: imageUrl,
            color,
            material,
            pattern,
            season_tag: seasonTag,
            tpo_tags: tpoTags,
            is_favorite: isFavorite,
        };

        try {
            await createItem(payload);
            toast.success("アイテムを追加しました");
            navigate("/item-list");
        } catch (err) {
            console.error(err);
            toast.error("保存に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const selectClass =
        "border p-2 rounded w-full bg-white text-gray-900 dark:bg-slate-800 dark:text-gray-100";

    return (
        <>
            <Header />
            <div className="min-h-screen p-6 text-gray-900 dark:text-gray-100 flex flex-col items-center">
                <div className="w-full max-w-6xl mb-4">
                    <h1 className="text-2xl font-bold">アイテム追加</h1>
                </div>

                <Card className="w-full max-w-4xl min-h-[400px] overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                        {/* 左カラム */}
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-center">
                                <img
                                    src={imageUrl || "/noimage.png"}
                                    alt={name || "preview"}
                                    className="w-40 h-40 object-cover rounded-xl border"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="画像URL"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="border p-2 rounded"
                            />
                            <input
                                type="text"
                                placeholder="名前"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border p-2 rounded"
                                required
                            />
                            <select
                                value={category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="">カテゴリ選択</option>
                                {["服", "靴", "アクセサリー", "帽子", "バッグ"].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <select
                                value={subcategoryId ?? ""}
                                onChange={(e) => setSubcategoryId(Number(e.target.value))}
                                className={selectClass}
                                disabled={!category || isSubcategoryDisabled(category)}
                            >
                                {category && subcategoryList
                                    .filter(s => s.category === category)
                                    .map(s => (
                                        <option key={s.subcategory_id} value={s.subcategory_id}>
                                            {s.name}
                                        </option>
                                    ))}
                            </select>
                            <select
                                value={storageId || ""}
                                onChange={(e) => setStorageId(Number(e.target.value))}
                                className={selectClass}
                            >
                                <option value="">保存場所未選択</option>
                                {storageList.map(s => (
                                    <option key={s.storage_id} value={s.storage_id}>
                                        {s.storage_location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 右カラム */}
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="カラー"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="border p-2 rounded"
                            />
                            <input
                                type="text"
                                placeholder="素材"
                                value={material}
                                onChange={(e) => setMaterial(e.target.value)}
                                className="border p-2 rounded"
                            />
                            <input
                                type="text"
                                placeholder="柄"
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                className="border p-2 rounded"
                            />

                            {/* シーズン */}
                            <div>
                                <p className="text-sm font-semibold mb-1">シーズン</p>
                                <div className="flex gap-2 flex-wrap">
                                    {["春", "夏", "秋", "冬"].map(s => (
                                        <button
                                            type="button"
                                            key={s}
                                            className={`px-2 py-1 rounded border ${
                                                seasonTag.includes(s)
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100 dark:bg-gray-700"
                                            }`}
                                            onClick={() => toggleArrayValue(s, seasonTag, setSeasonTag)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* TPO */}
                            <div>
                                <p className="text-sm font-semibold mb-1">TPO</p>
                                <div className="flex gap-2 flex-wrap">
                                    {["フォーマル", "カジュアル", "ビジネス", "ルームウェア", "その他"].map(t => (
                                        <button
                                            type="button"
                                            key={t}
                                            className={`px-2 py-1 rounded border ${
                                                tpoTags.includes(t)
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-100 dark:bg-gray-700"
                                            }`}
                                            onClick={() => toggleArrayValue(t, tpoTags, setTpoTags)}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* お気に入り */}
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isFavorite}
                                    onChange={() => setIsFavorite(!isFavorite)}
                                />
                                お気に入り
                            </label>

                            <div className="mt-6 flex justify-end">
                                <Button type="submit" disabled={loading}>
                                    {loading ? "保存中..." : "保存"}
                                </Button>
                                <Button type="button" className="ml-2" onClick={() => navigate("/item-list")}>
                                    キャンセル
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        </>
    );
}
