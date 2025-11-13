// frontend/src/api/items.ts
import { API_BASE } from "./index";
import { getAuthHeaders } from "./authHeaders";

// ----------------------------
// 全アイテム取得
// ----------------------------
export async function getItems() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/items/`, { headers });
    if (!res.ok) throw new Error("アイテム取得に失敗しました");
    return res.json();
}

// ----------------------------
// アイテム詳細取得
// ----------------------------
export async function getItemDetail(item_id: number) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/items/${item_id}/`, { headers });
    if (!res.ok) throw new Error("アイテム詳細の取得に失敗しました");
    return res.json();
}

// ----------------------------
// アイテム作成
// ----------------------------
export async function createItem(item: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/items/`, {
        method: "POST",
        headers,
        body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("アイテム作成に失敗しました");
    return res.json();
}

// ----------------------------
// アイテム更新
// ----------------------------
export async function updateItem(item_id: number, item: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/items/${item_id}/`, {
        method: "PUT",
        headers,
        body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("アイテム更新に失敗しました");
    return res.json();
}

// ----------------------------
// アイテム削除
// ----------------------------
export async function deleteItem(item_id: number) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/items/${item_id}/`, {
        method: "DELETE",
        headers,
    });
    if (!res.ok) throw new Error("アイテム削除に失敗しました");
    return res.json();
}

// ----------------------------
// お気に入り状態を更新
// ----------------------------
export async function toggleFavorite(item_id: number, is_favorite: boolean) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/items/${item_id}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_favorite }),
    });
    if (!res.ok) throw new Error("お気に入り状態の更新に失敗しました");
    return res.json();
}
