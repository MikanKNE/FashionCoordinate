import { supabase } from "../lib/supabaseClient";

// ----------------------------
// コーディネーション作成（coordinations + coordination_items のまとめ登録）
// ----------------------------
export const createCoordination = async (payload: {
    name: string;
    is_favorite: boolean;
    items: number[]; // item_id[]
}) => {
    // JWT取得
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) throw new Error("ログインが必要です");

    const res = await fetch("/api/coordinations/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // JWTをヘッダーに追加
        },
        body: JSON.stringify(payload),
    });

    return res.json();
};

// ----------------------------
// 一覧取得
// ----------------------------
export const getCoordinations = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch("/api/coordinations/", {
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        },
    });
    return res.json();
};

// ----------------------------
// 単体取得
// ----------------------------
export const getCoordination = async (coordination_id: number) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/coordinations/${coordination_id}/`, {
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        },
    });
    return res.json();
};

// ----------------------------
// 更新
// ----------------------------
export const updateCoordination = async (
    coordination_id: number,
    data: any
) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/coordinations/${coordination_id}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
    });

    return res.json();
};

// ----------------------------
// 削除
// ----------------------------
export const deleteCoordination = async (coordination_id: number) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/coordinations/${coordination_id}/`, {
        method: "DELETE",
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        },
    });

    return res.json();
};
