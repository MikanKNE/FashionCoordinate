// frontend/src/api/coordination_items.ts
import { API_BASE } from "./index";

// ===========================
// コーディネートにアイテムを追加
// ===========================
export async function addItemToCoordination(coordination_id: number, item_id: number) {
    const res = await fetch(`${API_BASE}/coordination_items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordination_id, item_id }),
    });

    if (!res.ok) throw new Error("アイテム追加に失敗しました");
    return res.json();
}

// ===========================
// コーディネートからアイテムを削除
// ===========================
export async function removeItemFromCoordination(coordination_id: number, item_id: number) {
    const res = await fetch(`${API_BASE}/coordination_items/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordination_id, item_id }),
    });

    if (!res.ok) throw new Error("アイテム削除に失敗しました");
    return res.json();
}

// ===========================
// コーディネートに属する全アイテム取得
// ===========================
export async function getItemsOfCoordination(coordination_id: number) {
    const res = await fetch(`${API_BASE}/coordinations/${coordination_id}/`);
    if (!res.ok) throw new Error("アイテム一覧取得に失敗しました");

    return res.json();
}

// ===========================
// 中間テーブル全件取得
// ===========================
export async function getAllCoordinationItems() {
    const res = await fetch(`${API_BASE}/coordination_items/all/`);
    if (!res.ok) throw new Error("中間テーブル一覧取得に失敗しました");

    return res.json();
}
