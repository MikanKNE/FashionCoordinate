// src/types/item.ts

export type Item = {
    item_id: number
    name: string
    category?: string
    image_url?: string
    description?: string
    is_favorite?: boolean
    created_at?: string
}

export type Coordination = {
    coordination_id: number
    name: string
    items: Item[]
}
