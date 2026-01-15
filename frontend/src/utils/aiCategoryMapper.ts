// frontend/src/utils/aiCategoryMapper.ts

import type { CategoryType } from "../types";

/* ===============================
 * AI 大分類 → アプリカテゴリ
 * =============================== */
export const AI_CATEGORY_MAP: Record<string, CategoryType> = {
    tops: "服",
    bottoms: "服",
    outerwear: "服",
    onepiece: "服",
    shoes: "靴",
    bag: "バッグ",
    accessory: "アクセサリー",
};

/* ===============================
 * AI サブカテゴリ → DBサブカテゴリ名
 * （subcategories.name と完全一致）
 * =============================== */
export const AI_SUBCATEGORY_MAP: Record<string, string> = {
    pants: "パンツ",
    jeans: "デニム",
    skirt: "スカート",
    shorts: "ショートパンツ",

    tshirt: "Tシャツ",
    shirt: "シャツ",
    knit: "ニット",

    coat: "コート",
    jacket: "ジャケット",
};

/* ===============================
 * 色
 * =============================== */
export const AI_COLOR_MAP: Record<string, string> = {
    black: "黒",
    white: "白",
    gray: "グレー",
    beige: "ベージュ",
    brown: "茶",
    navy: "ネイビー",
    blue: "青",
    green: "緑",
    red: "赤",
    yellow: "黄色",
};

/* ===============================
 * 素材
 * =============================== */
export const AI_MATERIAL_MAP: Record<string, string> = {
    cotton: "綿",
    denim: "デニム",
    polyester: "ポリエステル",
    wool: "ウール",
    leather: "レザー",
    linen: "麻",
    knit: "ニット",
};

/* ===============================
 * 柄
 * =============================== */
export const AI_PATTERN_MAP: Record<string, string> = {
    solid: "無地",
    striped: "ストライプ",
    checked: "チェック",
    floral: "花柄",
    printed: "プリント",
    denim_texture: "デニム",
};

/* ===============================
 * AI 生結果 → ItemForm 用変換
 * =============================== */
export function convertAiResult(
    raw: any,
    subcategoryList: any[]
) {
    const category = AI_CATEGORY_MAP[raw.category] ?? null;

    let subcategory_id: number | null = null;

    if (category && raw.subcategory) {
        const jpName = AI_SUBCATEGORY_MAP[raw.subcategory];

        if (jpName) {
            const matched = subcategoryList.find(
                (s) => s.category === category && s.name === jpName
            );
            if (matched) {
                subcategory_id = matched.subcategory_id;
            }
        }
    }

    return {
        category,
        subcategory_id,
        color: AI_COLOR_MAP[raw.color] ?? raw.color ?? "",
        material: AI_MATERIAL_MAP[raw.material] ?? raw.material ?? "",
        pattern: AI_PATTERN_MAP[raw.pattern] ?? raw.pattern ?? "",
        confidence: raw.confidence ?? {},
    };
}
