export type Item = {
    item_id: number
    name: string
    category?: string
    image_url?: string
}

export type Coordination = {
    id: number
    name: string
    items: Item[]
}
