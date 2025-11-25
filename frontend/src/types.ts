// src/types.ts
export interface Item {
    item_id: number;
    user_id?: string;
    name: string;
    storage_id?: number;
    storages?: { storage_location: string };
    storage_name?: string;
    category: string;
    subcategory_id?: number;
    subcategories?: { name: string };
    subcategory_name?: string;
    image_url?: string;
    season_tag: string[];
    tpo_tags: string[];
    color?: string;
    material?: string;
    pattern?: string;
    is_favorite: boolean;
    wear_count?: number;
    last_used_date?: string;
}

export type CategoryType = "服" | "靴" | "アクセサリー" | "帽子" | "バッグ";
export type SeasonType = "春" | "夏" | "秋" | "冬";
export type TpoType = "フォーマル" | "カジュアル" | "ビジネス" | "ルームウェア" | "その他";


export type Coordination = {
    coordination_id: number
    name: string
    is_favorite: boolean
    items: Item[]
}

export interface CoordinationItem {
    coordination_id: number;
    item_id: number;
    item?: Item;
}

export interface Subcategory {
    subcategory_id: number;
    category: string;
    name: string;
}

export interface Storage {
    storage_id: number;
    user_id?: string;
    storage_location: string;
}

export interface User {
    user_id: string;        // Supabase Auth UUID
    display_name: string;
    line_id?: string;
    email?: string;
    last_login_date?: string;
}

export interface MultiFilters {
    subcategory_ids: number[];
    color: string[];
    material: string[];
    pattern: string[];
    season_tag: string[];
    tpo_tags: string[];
    is_favorite?: boolean;
}

export interface AccordionState {
    category: boolean;
    color: boolean;
    material: boolean;
    pattern: boolean;
    season_tag: boolean;
    tpo_tags: boolean;
}
