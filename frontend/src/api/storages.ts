// frontend/src/api/storages.ts
import { API_BASE } from "./index";
import { supabase } from "../lib/supabaseClient";

// ===========================
// 認証ヘッダー生成
// ===========================
async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("ログインが必要です");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

// ===========================
// 一覧取得
// ===========================
export async function getStorages() {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/storages/`, { headers });

    if (!res.ok) throw new Error("ストレージ取得に失敗しました");
    return res.json();
}

// ===========================
// 作成
// ===========================
export async function createStorage(storage_location: string) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/storages/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ storage_location }),
    });

    if (!res.ok) throw new Error("ストレージ作成に失敗しました");
    return res.json();
}

// ===========================
// 詳細取得
// ===========================
export async function getStorage(id: number) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/storages/${id}/`, { headers });

    if (!res.ok) throw new Error("ストレージ詳細取得に失敗しました");
    return res.json();
}

// ===========================
// 更新
// ===========================
export async function updateStorage(id: number, data: any) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/storages/${id}/`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("ストレージ更新に失敗しました");
    return res.json();
}

// ===========================
// 削除
// ===========================
export async function deleteStorage(id: number) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/storages/${id}/`, {
        method: "DELETE",
        headers,
    });

    if (!res.ok) throw new Error("ストレージ削除に失敗しました");
    return res.json();
}
