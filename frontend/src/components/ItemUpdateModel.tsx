// frontend/src/components/ItemUpdateModel.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import type { Item } from "../types";
import { createItem, updateItem } from "../api/items";
import { getSubcategories } from "../api/subcategories";
import { getStorages } from "../api/storages";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";

interface ItemFormProps {
    item?: Item;
    onClose: () => void;
    onSave: (item: Item) => void;
}

export default function ItemUpdateModel({ item, onClose, onSave }: ItemFormProps) {
    const [name, setName] = useState(item?.name || "");
    const [category, setCategory] = useState(item?.category || "");
    const [subcategoryId, setSubcategoryId] = useState<number | null>(item?.subcategory_id || null);
    const [storageId, setStorageId] = useState(item?.storage_id || "");
    const [imageUrl, setImageUrl] = useState(item?.image_url || "");
    const [color, setColor] = useState(item?.color || "");
    const [material, setMaterial] = useState(item?.material || "");
    const [pattern, setPattern] = useState(item?.pattern || "");
    const [seasonTag, setSeasonTag] = useState<string[]>(item?.season_tag || []);
    const [tpoTags, setTpoTags] = useState<string[]>(item?.tpo_tags || []);
    const [isFavorite, setIsFavorite] = useState(item?.is_favorite || false);

    const [subcategoryList, setSubcategoryList] = useState<any[]>([]);
    const [storageList, setStorageList] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const sub = await getSubcategories();
                setSubcategoryList(sub.data || []);
                const st = await getStorages();
                setStorageList(st.data || []);
            } catch (e) {
                console.error(e);
                toast.error("フォーム項目の取得に失敗しました");
            }
        })();
    }, []);

    const toggleArrayValue = (value: string, list: string[], setter: (s: string[]) => void) => {
        setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    };

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
            if (item) {
                const updated = await updateItem(item.item_id, payload);
                onSave(updated.data[0]);
                toast.success("アイテムを更新しました");
            } else {
                const created = await createItem(payload);
                onSave(created.data);
                toast.success("アイテムを追加しました");
            }
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("保存に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const selectClass =
        "border p-2 rounded w-full bg-white text-gray-900 dark:bg-slate-800 dark:text-gray-100";

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        // サブカテゴリを初期化
        const subs = subcategoryList.filter(s => s.category === value);
        const other = subs.find(s => s.name === "その他");
        setSubcategoryId(other?.subcategory_id || null);
    };

    const isSubcategoryDisabled = (cat: string) => {
        return !["服", "靴", "アクセサリー"].includes(cat);
    };

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg 
                w-[720px] max-h-[90vh] overflow-y-auto mx-4 p-6 relative
                animate-fadeInModal text-gray-900 dark:text-gray-100"
            >
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-black dark:hover:text-white"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold mb-4">
                    {item ? "アイテム編集" : "アイテム追加（簡易）"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-4">
                            {/* 画像プレビュー */}
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

                            {/* カテゴリ */}
                            <select
                                value={category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="">カテゴリ未選択</option>
                                {["服", "靴", "アクセサリー", "帽子", "バッグ"].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            {/* サブカテゴリ */}
                            <select
                                value={subcategoryId ?? ""}
                                onChange={(e) => setSubcategoryId(Number(e.target.value))}
                                className={selectClass}
                                disabled={!category || isSubcategoryDisabled(category)}
                            >
                                {category && (
                                    <>
                                        {subcategoryList
                                            .filter(s => s.category === category)
                                            .map(s => (
                                                <option key={s.subcategory_id} value={s.subcategory_id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                    </>
                                )}
                            </select>

                            {/* 保存場所 */}
                            <select
                                value={storageId || ""}
                                onChange={(e) => setStorageId(Number(e.target.value))}
                                className={selectClass}
                            >
                                <option value="">保存場所未選択</option>
                                {storageList.map((s) => (
                                    <option key={s.storage_id} value={s.storage_id}>
                                        {s.storage_location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 右カラム（カラー・素材など） */}
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

                            {/* 使用履歴 */}
                            {item && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    <p>使用回数: {item.wear_count ?? 0}</p>
                                    <p>最終使用日: {item.last_used_date || "未使用"}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SAVE BUTTON */}
                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={loading} variant="primary">
                            {loading ? "保存中..." : "保存"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
