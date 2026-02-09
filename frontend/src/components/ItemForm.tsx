// frontend/src/components/ItemForm.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "./ui/Button";
import Card from "./ui/Card";
import type { CategoryType, SeasonType, TpoType } from "../types";
import { analyzeImage } from "../api/ai_imageAnalysis";
import { useSignedImageUrl } from "../hooks/useSignedImageUrl";

export interface ItemFormValues {
    item_id?: number;
    name: string;
    category: CategoryType | "";
    subcategory_id: number | null;
    storage_id: number | null;
    image_file: File | null;
    image_url?: string;
    color: string[];
    material: string[];
    pattern: string[];
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
    enableDraft: boolean;
}

const DRAFT_VALUES_KEY = "item_draft_values";
const DRAFT_PREVIEW_KEY = "item_draft_preview";

export default function ItemForm({
    initialValues,
    subcategoryList,
    storageList,
    loading = false,
    onSubmit,
    enableDraft,
}: Props) {
    const navigate = useNavigate();

    const [values, setValues] = useState<ItemFormValues>(initialValues);
    const [preview, setPreview] = useState<string>("/noimage.png");
    const [analyzing, setAnalyzing] = useState(false);

    const [colorInput, setColorInput] = useState("");
    const [materialInput, setMaterialInput] = useState("");
    const [patternInput, setPatternInput] = useState("");

    const [showColorInput, setShowColorInput] = useState(false);
    const [showMaterialInput, setShowMaterialInput] = useState(false);
    const [showPatternInput, setShowPatternInput] = useState(false);

    const { url: signedImageUrl } = useSignedImageUrl(values.item_id);

    const [isInitialized, setIsInitialized] = useState(false);
    const [otherInitialized, setOtherInitialized] = useState(false);


    // 候補
    const COLOR_OPTIONS = ["黒", "白", "グレー", "ベージュ", "茶", "ネイビー", "青", "緑", "赤", "黄色"];
    const MATERIAL_OPTIONS = ["綿", "デニム", "ポリエステル", "ウール", "レザー", "麻", "ニット"];
    const PATTERN_OPTIONS = ["無地", "ストライプ", "チェック", "花柄", "プリント", "デニム"];

    const splitByOptions = (
        values: string[],
        options: string[]
    ) => {
        const normals: string[] = [];
        const others: string[] = [];

        let isOther = false;

        for (const v of values) {
            if (!isOther && options.includes(v)) {
                normals.push(v);
            } else {
                isOther = true;
                others.push(v);
            }
        }

        return {
            normals,
            otherText: others.join(","),
        };
    };

    /**
     * 初回マウント時：ドラフト or initialValues 復元
     */
    useEffect(() => {
        if (!enableDraft) {
            setValues(initialValues);
            setIsInitialized(true);
            return;
        }

        const savedValues = sessionStorage.getItem(DRAFT_VALUES_KEY);
        const savedPreview = sessionStorage.getItem(DRAFT_PREVIEW_KEY);

        if (savedValues) {
            setValues(JSON.parse(savedValues));
        } else {
            setValues(initialValues);
        }

        if (savedPreview) {
            setPreview(savedPreview);
        }

        setIsInitialized(true);
    }, [initialValues, enableDraft]);

    /*
    * その他選択肢の復元処理
    */
    useEffect(() => {
        if (!isInitialized) return;
        if (otherInitialized) return; // ←★これが命

        // ===== カラー =====
        {
            const { normals, otherText } = splitByOptions(
                values.color ?? [],
                COLOR_OPTIONS
            );
            setValues(prev => ({
                ...prev,
                color: normals,
            }));
            if (otherText) {
                sessionStorage.setItem("draft_color_other", otherText);
                setColorInput(otherText);
                setShowColorInput(true);
            }
        }

        // ===== 素材 =====
        {
            const { normals, otherText } = splitByOptions(
                values.material ?? [],
                MATERIAL_OPTIONS
            );
            setValues(prev => ({
                ...prev,
                material: normals,
            }));
            if (otherText) {
                sessionStorage.setItem("draft_material_other", otherText);
                setMaterialInput(otherText);
                setShowMaterialInput(true);
            }
        }

        // ===== 柄 =====
        {
            const { normals, otherText } = splitByOptions(
                values.pattern ?? [],
                PATTERN_OPTIONS
            );
            setValues(prev => ({
                ...prev,
                pattern: normals,
            }));
            if (otherText) {
                sessionStorage.setItem("draft_pattern_other", otherText);
                setPatternInput(otherText);
                setShowPatternInput(true);
            }
        }

        setOtherInitialized(true); // ←★最後にロック
    }, [isInitialized]);


    /**
     * signedImageUrl が来たら preview に反映
     * （image_file が未選択の場合のみ）
     */
    useEffect(() => {
        if (!values.image_file && signedImageUrl) {
            setPreview(signedImageUrl);
        }
    }, [signedImageUrl, values.image_file]);

    /**
     * values が変わるたびにドラフト保存
     */
    useEffect(() => {
        if (!enableDraft) return;
        if (!isInitialized) return;
        sessionStorage.setItem(DRAFT_VALUES_KEY, JSON.stringify(values));
    }, [values, enableDraft, isInitialized]);

    /**
     * preview が変わるたびに保存
     */
    useEffect(() => {
        if (!enableDraft) return;
        if (!isInitialized) return;
        if (preview) {
            sessionStorage.setItem(DRAFT_PREVIEW_KEY, preview);
        }
    }, [preview, enableDraft, isInitialized]);

    const handleImageFile = (file: File | null) => {
        setValues((prev) => ({ ...prev, image_file: file }));

        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(signedImageUrl || "/noimage.png");
        }
    };

    /**
     * その他カラーの復元
     */
    useEffect(() => {
        if (showColorInput) {
            const saved = sessionStorage.getItem("draft_color_other");
            if (saved) {
                setColorInput(saved);
            }
        }
    }, [showColorInput]);

    /**
     * その他素材の復元
     */
    useEffect(() => {
        if (showMaterialInput) {
            const saved = sessionStorage.getItem("draft_material_other");
            if (saved) {
                setMaterialInput(saved);
            }
        }
    }, [showMaterialInput]);

    /*
    * その他柄の復元
    */
    useEffect(() => {
        if (showPatternInput) {
            const saved = sessionStorage.getItem("draft_pattern_other");
            if (saved) {
                setPatternInput(saved);
            }
        }
    }, [showPatternInput]);


    /**
     * AI解析
     */
    const analyzeImageWithAI = async () => {
        if (!values.image_file) {
            toast.error("画像を選択してください");
            return;
        }

        setAnalyzing(true);
        try {
            const result = await analyzeImage(values.image_file);

            setValues((prev) => ({
                ...prev,
                category: result.category
                    ? (result.category as CategoryType)
                    : prev.category,
                subcategory_id: (() => {
                    if (!result.subcategory_name) return prev.subcategory_id;
                    const matched = subcategoryList.find(
                        (s) =>
                            s.category === result.category &&
                            s.name === result.subcategory_name
                    );
                    return matched?.subcategory_id ?? prev.subcategory_id;
                })(),
                color: result.color ? [result.color] : [],
                material: result.material ? [result.material] : [],
                pattern: result.pattern ? [result.pattern] : [],
            }));

            toast.success("AI解析結果を反映しました");
        } catch (err) {
            console.error(err);
            toast.error("画像解析に失敗しました");
        } finally {
            setAnalyzing(false);
        }
    };

    const toggleArrayValue = <T,>(
        value: T,
        list: T[],
        setter: (s: T[]) => void
    ) => {
        setter(
            list.includes(value)
                ? list.filter((v) => v !== value)
                : [...list, value]
        );
    };

    const handleCategoryChange = (value: string) => {
        setValues((prev) => {
            const subs = subcategoryList.filter((s) => s.category === value);
            const other = subs.find((s) => s.name === "その他");
            return {
                ...prev,
                category: value as CategoryType,
                subcategory_id: other?.subcategory_id || null,
            };
        });
    };

    const isSubcategoryDisabled = (cat: string) =>
        !["服", "靴", "アクセサリー"].includes(cat);

    const handleChange = (field: keyof ItemFormValues, val: any) => {
        setValues((prev) => ({ ...prev, [field]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const buildFinalValues = (
            selected: string[],
            options: string[],
            otherInput: string,
            showOther: boolean
        ) => {
            const normals = selected.filter(v => options.includes(v));

            if (!showOther) {
                return normals;
            }

            const other = otherInput.trim();
            return other
                ? [...normals, other] // ← ★その他は「1要素」
                : normals;
        };

        const submitValues: ItemFormValues = {
            ...values,
            color: buildFinalValues(
                values.color,
                COLOR_OPTIONS,
                colorInput,
                showColorInput
            ),
            material: buildFinalValues(
                values.material,
                MATERIAL_OPTIONS,
                materialInput,
                showMaterialInput
            ),
            pattern: buildFinalValues(
                values.pattern,
                PATTERN_OPTIONS,
                patternInput,
                showPatternInput
            ),
        };

        try {
            await onSubmit(submitValues);

            if (enableDraft) {
                sessionStorage.removeItem(DRAFT_VALUES_KEY);
                sessionStorage.removeItem(DRAFT_PREVIEW_KEY);
                sessionStorage.removeItem("draft_color_other");
                sessionStorage.removeItem("draft_material_other");
                sessionStorage.removeItem("draft_pattern_other");
            }
        } catch {
            toast.error("保存に失敗しました");
        }
    };

    const handleCancel = () => {
        if (enableDraft) {
            sessionStorage.removeItem(DRAFT_VALUES_KEY);
            sessionStorage.removeItem(DRAFT_PREVIEW_KEY);
            sessionStorage.removeItem("draft_color_other");
            sessionStorage.removeItem("draft_material_other");
            sessionStorage.removeItem("draft_pattern_other");
        }
        navigate("/item-list");
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
                                src={preview}
                                className="w-40 h-40 object-cover rounded-xl border"
                            />
                        </div>

                        <div className="flex gap-2 items-stretch mt-2">
                            <label
                                className={`
                                    flex-[2] cursor-pointer rounded-lg border-2 border-dashed
                                    flex items-center justify-center text-sm
                                    transition
                                    ${values.image_file
                                        ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-slate-700 dark:text-slate-100"
                                        : "border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-slate-800"
                                    }
                                `}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleImageFile(e.target.files?.[0] || null)
                                    }
                                />
                                {values.image_file ? "画像を変更" : "画像を選択"}
                            </label>

                            <Button
                                type="button"
                                onClick={analyzeImageWithAI}
                                disabled={analyzing || !values.image_file}
                                className="flex-[3]"
                            >
                                {analyzing ? "AI解析中..." : "AI解析"}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">
                            名前 <span className="text-red-500">*</span>
                        </p>
                        <input
                            type="text"
                            value={values.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">
                            カテゴリ <span className="text-red-500">*</span>
                        </p>
                        <select
                            value={values.category}
                            onChange={(e) =>
                                handleCategoryChange(e.target.value)
                            }
                            className={selectClass}
                            required
                        >
                            <option value="">カテゴリ選択</option>
                            {["服", "靴", "アクセサリー", "帽子", "バッグ"].map(
                                (c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">
                            サブカテゴリ
                        </p>
                        <select
                            value={values.subcategory_id ?? ""}
                            onChange={(e) =>
                                handleChange(
                                    "subcategory_id",
                                    Number(e.target.value)
                                )
                            }
                            className={selectClass}
                            disabled={
                                !values.category ||
                                isSubcategoryDisabled(values.category)
                            }
                        >
                            {values.category &&
                                subcategoryList
                                    .filter(
                                        (s) =>
                                            s.category === values.category
                                    )
                                    .map((s) => (
                                        <option
                                            key={s.subcategory_id}
                                            value={s.subcategory_id}
                                        >
                                            {s.name}
                                        </option>
                                    ))}
                        </select>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">保存場所</p>
                        <select
                            value={values.storage_id || ""}
                            onChange={(e) =>
                                handleChange(
                                    "storage_id",
                                    Number(e.target.value)
                                )
                            }
                            className={selectClass}
                        >
                            <option value="">保存場所未選択</option>
                            {storageList.map((s) => (
                                <option
                                    key={s.storage_id}
                                    value={s.storage_id}
                                >
                                    {s.storage_location}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 右カラム */}
                <div className="flex flex-col gap-4">
                    {/* カラー */}
                    <div>
                        <p className="text-sm font-semibold mb-1">カラー</p>
                        <div className="flex gap-2 flex-wrap mb-2">
                            {COLOR_OPTIONS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`px-2 py-1 rounded border text-sm hover:scale-[1.05]
                                        ${values.color.includes(c)
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 dark:bg-gray-700"
                                        }`}
                                    onClick={() =>
                                        toggleArrayValue(c, values.color, (val) =>
                                            handleChange("color", val)
                                        )
                                    }
                                >
                                    {c}
                                </button>
                            ))}
                            <button
                                type="button"
                                className={`px-2 py-1 rounded border text-sm
                                    ${showColorInput
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 dark:bg-gray-600"
                                    }`}
                                onClick={() => setShowColorInput((v) => !v)}
                            >
                                その他
                            </button>
                        </div>
                        {showColorInput && (
                            <input
                                type="text"
                                value={colorInput}
                                placeholder="他のカラーの入力"
                                className="border p-2 rounded w-full text-sm"
                                onChange={(e) => setColorInput(e.target.value)}
                                onBlur={() => {
                                    if (colorInput.trim()) {
                                        sessionStorage.setItem(
                                            "draft_color_other",
                                            colorInput.trim()
                                        );
                                    }
                                }}
                            />
                        )}
                    </div>

                    {/* 素材 */}
                    <div>
                        <p className="text-sm font-semibold mb-1">素材</p>
                        <div className="flex gap-2 flex-wrap mb-2">
                            {MATERIAL_OPTIONS.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    className={`px-2 py-1 rounded border text-sm hover:scale-[1.05]
                                        ${values.material.includes(m)
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 dark:bg-gray-700"
                                        }`}
                                    onClick={() =>
                                        toggleArrayValue(m, values.material, (val) =>
                                            handleChange("material", val)
                                        )
                                    }
                                >
                                    {m}
                                </button>
                            ))}
                            <button
                                type="button"
                                className={`px-2 py-1 rounded border text-sm
                                    ${showMaterialInput
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 dark:bg-gray-600"
                                    }`}
                                onClick={() => setShowMaterialInput((v) => !v)}
                            >
                                その他
                            </button>
                        </div>
                        {showMaterialInput && (
                            <input
                                type="text"
                                value={materialInput}
                                placeholder="他の素材の入力"
                                className="border p-2 rounded w-full text-sm"
                                onChange={(e) => setMaterialInput(e.target.value)}
                                onBlur={() => {
                                    if (materialInput.trim()) {
                                        sessionStorage.setItem(
                                            "draft_material_other",
                                            materialInput.trim()
                                        );
                                    }
                                }}
                            />
                        )}
                    </div>

                    {/* 柄 */}
                    <div>
                        <p className="text-sm font-semibold mb-1">柄</p>
                        <div className="flex gap-2 flex-wrap mb-2">
                            {PATTERN_OPTIONS.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`px-2 py-1 rounded border text-sm hover:scale-[1.05]
                                        ${values.pattern.includes(p)
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 dark:bg-gray-700"
                                        }`}
                                    onClick={() =>
                                        toggleArrayValue(p, values.pattern, (val) =>
                                            handleChange("pattern", val)
                                        )
                                    }
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                type="button"
                                className={`px-2 py-1 rounded border text-sm
                                    ${showPatternInput
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 dark:bg-gray-600"
                                    }`}
                                onClick={() => setShowPatternInput((v) => !v)}
                            >
                                その他
                            </button>
                        </div>
                        {showPatternInput && (
                            <input
                                type="text"
                                value={patternInput}
                                placeholder="他の柄の入力"
                                className="border p-2 rounded w-full text-sm"
                                onChange={(e) => setPatternInput(e.target.value)}
                                onBlur={() => {
                                    if (patternInput.trim()) {
                                        sessionStorage.setItem(
                                            "draft_pattern_other",
                                            patternInput.trim()
                                        );
                                    }
                                }}
                            />
                        )}
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">シーズン</p>
                        <div className="flex gap-2 flex-wrap">
                            {["春", "夏", "秋", "冬"].map((s) => (
                                <button
                                    type="button"
                                    key={s}
                                    className={`px-2 py-1 rounded border hover:scale-[1.05]
                                        ${values.season_tag.includes(s as SeasonType)
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 dark:bg-gray-700"
                                        }`}
                                    onClick={() =>
                                        toggleArrayValue(
                                            s as SeasonType,
                                            values.season_tag,
                                            (val) =>
                                                handleChange(
                                                    "season_tag",
                                                    val
                                                )
                                        )
                                    }
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">TPO</p>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                "フォーマル",
                                "カジュアル",
                                "ビジネス",
                                "ルームウェア",
                                "その他",
                            ].map((t) => (
                                <button
                                    type="button"
                                    key={t}
                                    className={`px-2 py-1 rounded border hover:scale-[1.05]
                                        ${values.tpo_tags.includes(t as TpoType)
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 dark:bg-gray-700"
                                        }`}
                                    onClick={() =>
                                        toggleArrayValue(
                                            t as TpoType,
                                            values.tpo_tags,
                                            (val) =>
                                                handleChange("tpo_tags", val)
                                        )
                                    }
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-1">
                            お気に入り
                        </p>
                        <button
                            type="button"
                            className={`text-2xl hover:scale-[1.05]
                                ${values.is_favorite
                                    ? "text-yellow-400"
                                    : "text-gray-400"
                                }`}
                            onClick={() =>
                                handleChange(
                                    "is_favorite",
                                    !values.is_favorite
                                )
                            }
                        >
                            ★
                        </button>
                    </div>

                    <div className="col-span-2 flex justify-end gap-2 mt-6">
                        <Button type="submit" disabled={loading}>
                            {loading ? "保存中..." : "保存"}
                        </Button>
                        <Button type="button" onClick={handleCancel}>
                            キャンセル
                        </Button>
                    </div>
                </div>
            </form>
        </Card >
    );
}
