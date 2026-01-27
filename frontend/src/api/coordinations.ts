// frontend/src/api/coordinations.ts
import { supabase } from "../lib/supabaseClient";
import { API_BASE } from "./index";

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
// コーディネート作成
// ===========================
export async function createCoordination(payload: {
    name: string;
    is_favorite?: boolean;
    items?: number[];
}) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/coordinations/`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(
            data?.message ?? "コーディネート作成に失敗しました"
        );
    }

    return data;
}

// ===========================
// 一覧取得
// ===========================
export async function getCoordinations() {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/coordinations/`, { headers });

    if (!res.ok) throw new Error("コーディネート取得に失敗しました");
    return res.json();
}

// ===========================
// 詳細取得
// ===========================
export async function getCoordination(coordination_id: number) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/coordinations/${coordination_id}/`, { headers });

    if (!res.ok) throw new Error("コーディネート詳細の取得に失敗しました");
    return res.json();
}

// ===========================
// 更新
// ===========================
export async function updateCoordination(coordination_id: number, data: any) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/coordinations/${coordination_id}/`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });

    const resData = await res.json();

    if (!res.ok) {
        throw new Error(
            resData?.message ?? "コーディネート更新に失敗しました"
        );
    }

    return resData;
}

// ===========================
// 削除
// ===========================
export async function deleteCoordination(coordination_id: number) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/coordinations/${coordination_id}/`, {
        method: "DELETE",
        headers,
    });

    if (!res.ok) throw new Error("コーディネート削除に失敗しました");
    return res.json();
}
