import { API_BASE } from "./index";

// 全アイテム取得
export async function getItems() {
    const res = await fetch(`${API_BASE}/items/`);
    if (!res.ok) throw new Error("アイテム取得に失敗しました");
    return res.json();
}

// アイテム詳細取得
export async function getItemDetail(item_id: number) {
    const res = await fetch(`${API_BASE}/items/${item_id}/`);
    if (!res.ok) throw new Error("アイテム詳細の取得に失敗しました");
    return res.json();
}

// アイテム作成
export async function createItem(item: any) {
    const res = await fetch(`${API_BASE}/items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("アイテム作成に失敗しました");
    return res.json();
}

// アイテム更新
export async function updateItem(item_id: number, item: any) {
    const res = await fetch(`${API_BASE}/items/${item_id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("アイテム更新に失敗しました");
    return res.json();
}

// アイテム削除
export async function deleteItem(item_id: number) {
    const res = await fetch(`${API_BASE}/items/${item_id}/`, { method: "DELETE" });
    if (!res.ok) throw new Error("アイテム削除に失敗しました");
    return res.json();
}

// お気に入り追加
export async function addFavorite(user_id: string, item_id: number) {
    const res = await fetch(`${API_BASE}/favorites/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, item_id }),
    });
    if (!res.ok) throw new Error("お気に入り追加に失敗しました");
    return res.json();
}

// コーディネートに追加
export async function addItemToCoordination(coordination_id: number, item_id: number) {
    const res = await fetch(`${API_BASE}/coordination_items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordination_id, item_id }),
    });
    if (!res.ok) throw new Error("コーディネート追加に失敗しました");
    return res.json();
}
