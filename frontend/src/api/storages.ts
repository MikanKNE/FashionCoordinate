// frontend/src/api/storages.ts
import { supabase } from "../lib/supabaseClient";
import { API_BASE } from "./index";

async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("ログインが必要です");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

// 一覧
export const getStorages = async () => {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/storages/`, { headers });
    return res.json();
};

// 新規作成
export const createStorage = async (storage_location: string) => {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/storages/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ storage_location }),
    });
    return res.json();
};

// 1件取得
export const getStorage = async (id: number) => {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/storages/${id}/`, { headers });
    return res.json();
};

// 更新
export const updateStorage = async (id: number, data: any) => {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/storages/${id}/`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });
    return res.json();
};

// 削除
export const deleteStorage = async (id: number) => {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/storages/${id}/`, {
        method: "DELETE",
        headers,
    });
    return res.json();
};
