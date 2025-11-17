// frontend/src/api/coordinations.ts
import { supabase } from "../lib/supabaseClient";

// ヘッダー作成ヘルパー
async function authHeaders() {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("ログインが必要です");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

// ----------------------------
// コーディネーション作成（coordinations + coordination_items まとめ登録）
// ----------------------------
export const createCoordination = async (payload: {
    name: string;
    is_favorite?: boolean;
    items?: number[]; // item_id[]
}) => {
    const headers = await authHeaders();
    const res = await fetch("/api/coordinations/", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("コーディネーション作成に失敗しました");
    return res.json();
};

// ----------------------------
// 一覧取得
// ----------------------------
export const getCoordinations = async () => {
    const headers = await authHeaders();
    const res = await fetch("/api/coordinations/", { headers });
    if (!res.ok) throw new Error("コーディネーション取得に失敗しました");
    return res.json();
};

// ----------------------------
// 単体取得
// ----------------------------
export const getCoordination = async (coordination_id: number) => {
    const headers = await authHeaders();
    const res = await fetch(`/api/coordinations/${coordination_id}/`, { headers });
    if (!res.ok) throw new Error("コーディネーション詳細の取得に失敗しました");
    return res.json();
};

// ----------------------------
// 更新
// ----------------------------
export const updateCoordination = async (coordination_id: number, data: any) => {
    const headers = await authHeaders();
    const res = await fetch(`/api/coordinations/${coordination_id}/`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("コーディネーション更新に失敗しました");
    return res.json();
};

// ----------------------------
// 削除
// ----------------------------
export const deleteCoordination = async (coordination_id: number) => {
    const headers = await authHeaders();
    const res = await fetch(`/api/coordinations/${coordination_id}/`, {
        method: "DELETE",
        headers,
    });
    if (!res.ok) throw new Error("コーディネーション削除に失敗しました");
    return res.json();
};
