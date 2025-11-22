// frontend/src/api/usage_history.ts
import { API_BASE } from "./index";
import { supabase } from "../lib/supabaseClient";

// JWT ヘッダー生成
async function authHeaders() {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("ユーザーがログインしていません");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

// ===========================
// 使用履歴一覧取得（自分のアイテムのみ）
// ===========================
export async function getUsageHistory() {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/usage_history/`, { headers });
    if (!res.ok) throw new Error("使用履歴の取得に失敗しました");
    return res.json();
}

// ===========================
// 使用履歴作成
// ===========================
export async function createUsage(data: any) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/usage_history/`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("使用履歴の作成に失敗しました");
    return res.json();
}

// ===========================
// 使用履歴更新
// ===========================
export async function updateUsage(id: number, data: any) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/usage_history/${id}/`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("使用履歴の更新に失敗しました");
    return res.json();
}

// ===========================
// 使用履歴削除
// ===========================
export async function deleteUsage(id: number) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/usage_history/${id}/`, {
        method: "DELETE",
        headers,
    });
    if (!res.ok) throw new Error("使用履歴の削除に失敗しました");
    return res.json();
}

// ===========================
// 日付で取得（auth 必須!!）
// ===========================
export async function getUsageByDate(date: string) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/usage_history/date/${date}/`, { headers });
    if (!res.ok) throw new Error("日付で使用履歴取得に失敗しました");
    return res.json();
}
