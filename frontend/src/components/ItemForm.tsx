import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import Card from "./ui/Card";
import type { CategoryType, SeasonType, TpoType } from "../types";
import toast from "react-hot-toast";

export interface ItemFormValues {
    name: string;
    category: CategoryType | "";
    subcategory_id: number | null;
    storage_id: number | null;
    image_url: string;
    color: string;
    material: string;
    pattern: string;
    season_tag: SeasonType[];
    tpo_tags: TpoType[];
    is_favorite: boolean;
}

interface Props {
    initialValues: ItemFormValues;
    subcategoryList: any[];
    storageList: any[];
    loading?: boolean;
    onSubmit: (values: ItemFormValues) => Promise<void>;
}

export default function ItemForm({
    initialValues,
    subcategoryList,
    storageList,
    loading = false,
    onSubmit,
}: Props) {
    const [values, setValues] = useState<ItemFormValues>(initialValues);
    const navigate = useNavigate();

    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    const toggleArrayValue = <T,>(value: T, list: T[], setter: (s: T[]) => void) => {
        setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    };

    const handleCategoryChange = (value: string) => {
        setValues(prev => {
            const subs = subcategoryList.filter(s => s.category === value);
            const other = subs.find(s => s.name === "その他");
            return { ...prev, category: value as CategoryType, subcategory_id: other?.subcategory_id || null };
        });
    };

    const isSubcategoryDisabled = (cat: string) => !["服", "靴", "アクセサリー"].includes(cat);

    const handleChange = (field: keyof ItemFormValues, val: any) => {
        setValues(prev => ({ ...prev, [field]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(values);
        } catch (err) {
            console.error(err);
            toast.error("保存に失敗しました");
        }
    };

    const selectClass =
        "border p-2 rounded w-full bg-white text-gray-900 dark:bg-slate-800 dark:text-gray-100";

    return (
        <Card className="w-full max-w-4xl min-h-[400px] overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                {/* 左カラム */}
                <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-sm font-semibold mb-1">画像</p>
                        <div className="flex justify-center">
                            <img
                                src={values.image_url || "/noimage.png"}
                                alt={values.name || "noimage"}
                                className="w-40 h-40 object-cover rounded-xl border"
                            />
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">画像URL</p>
                        <input
                            type="text"
                            placeholder="画像URL"
                            value={values.image_url}
                            onChange={(e) => handleChange("image_url", e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">名前</p>
                        <input
                            type="text"
                            placeholder="名前"
                            value={values.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">カテゴリ</p>
                        <select
                            value={values.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className={selectClass}
                            required
                        >
                            <option value="">カテゴリ選択</option>
                            {["服", "靴", "アクセサリー", "帽子", "バッグ"].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">サブカテゴリ</p>
                        <select
                            value={values.subcategory_id ?? ""}
                            onChange={(e) => handleChange("subcategory_id", Number(e.target.value))}
                            className={selectClass}
                            disabled={!values.category || isSubcategoryDisabled(values.category)}
                        >
                            {values.category && subcategoryList
                                .filter(s => s.category === values.category)
                                .map(s => (
                                    <option key={s.subcategory_id} value={s.subcategory_id}>
                                        {s.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">保存場所</p>
                        <select
                            value={values.storage_id || ""}
                            onChange={(e) => handleChange("storage_id", Number(e.target.value))}
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
                </div>

                {/* 右カラム */}
                <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-sm font-semibold mb-1">カラー</p>
                        <input
                            type="text"
                            placeholder="カラー"
                            value={values.color}
                            onChange={(e) => handleChange("color", e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">素材</p>
                        <input
                            type="text"
                            placeholder="素材"
                            value={values.material}
                            onChange={(e) => handleChange("material", e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">柄</p>
                        <input
                            type="text"
                            placeholder="柄"
                            value={values.pattern}
                            onChange={(e) => handleChange("pattern", e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">シーズン</p>
                        <div className="flex gap-2 flex-wrap">
                            {["春", "夏", "秋", "冬"].map((s) => (
                                <button
                                    type="button"
                                    key={s}
                                    className={`px-2 py-1 rounded border ${values.season_tag.includes(s as SeasonType)
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 dark:bg-gray-700"
                                        }`}
                                    onClick={() => toggleArrayValue(s as SeasonType, values.season_tag, val => handleChange("season_tag", val))}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">TPO</p>
                        <div className="flex gap-2 flex-wrap">
                            {["フォーマル", "カジュアル", "ビジネス", "ルームウェア", "その他"].map((t) => (
                                <button
                                    type="button"
                                    key={t}
                                    className={`px-2 py-1 rounded border ${values.tpo_tags.includes(t as TpoType)
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100 dark:bg-gray-700"
                                        }`}
                                    onClick={() => toggleArrayValue(t as TpoType, values.tpo_tags, val => handleChange("tpo_tags", val))}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">お気に入り</p>
                        <button
                            type="button"
                            className={`text-2xl ${values.is_favorite ? "text-yellow-400" : "text-gray-400"} transition-colors`}
                            onClick={() => handleChange("is_favorite", !values.is_favorite)}
                        >
                            ★
                        </button>
                    </div>

                    <div className="col-span-2 flex justify-end gap-2 mt-6">
                        <Button type="submit" disabled={loading}>
                            {loading ? "保存中..." : "保存"}
                        </Button>
                        <Button type="button" onClick={() => navigate("/item-list")}>
                            キャンセル
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}
