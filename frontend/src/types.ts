// src/types.ts

export interface Item {
    item_id: number;
    user_id?: string;
    storage_id?: number;
    category: string;
    subcategory_id?: number;
    subcategory_name?: string;
    name: string;
    image_url?: string;
    tpo_tags: string[];
    color?: string;
    material?: string;
    pattern?: string;
    is_favorite: boolean;
    season_tag: string[];
}

export type Coordination = {
    coordination_id: number
    name: string
    items: Item[]
}

export interface Subcategory {
    subcategory_id: number;
    category: string;
    name: string;
}

export interface User {
    user_id: string;        // Supabase Auth UUID
    display_name: string;
    line_id?: string;
    email?: string;
    last_login_date?: string;
}
