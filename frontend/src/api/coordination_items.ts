// frontend/src/api/coordination_items.ts
import { API_BASE } from "./index";

/**
 * コーディネーションにアイテムを追加
 * @param coordination_id コーディネーションID
 * @param item_id アイテムID
 */
export async function addItemToCoordination(coordination_id: number, item_id: number) {
    const res = await fetch(`${API_BASE}/coordination_items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordination_id, item_id }),
    });
    return res.json();
}

/**
 * コーディネーションからアイテムを削除
 * @param coordination_id コーディネーションID
 * @param item_id アイテムID
 */
export async function removeItemFromCoordination(coordination_id: number, item_id: number) {
    const res = await fetch(`${API_BASE}/coordination_items/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordination_id, item_id }),
    });
    return res.json();
}

/**
 * 指定コーディネーションのアイテム一覧を取得
 * （バックエンドで join して返す場合は不要）
 */
export async function getItemsOfCoordination(coordination_id: number) {
    const res = await fetch(`${API_BASE}/coordinations/${coordination_id}/`);
    const data = await res.json();
    // 返ってくる data.data.items がアイテム配列として返る想定
    return data;
}