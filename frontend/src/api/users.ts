// frontend/src/api/users.ts
import { API_BASE } from "./index";

// ===============================
// 全ユーザ取得
// ===============================
export async function getUsers() {
    const res = await fetch(`${API_BASE}/users/`);
    if (!res.ok) throw new Error("ユーザ取得に失敗しました");
    return res.json();
}

// ===============================
// ユーザ詳細取得
// ===============================
export async function getUserDetail(user_id: string) {
    const res = await fetch(`${API_BASE}/users/${user_id}/`);
    if (!res.ok) throw new Error("ユーザ詳細の取得に失敗しました");
    return res.json();
}

// ===============================
// ユーザ作成
// ===============================
export async function createUser(user: any) {
    const res = await fetch(`${API_BASE}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error("ユーザ作成に失敗しました");
    return res.json();
}

// ===============================
// ユーザ更新
// ===============================
export async function updateUser(user_id: string, user: any) {
    const res = await fetch(`${API_BASE}/users/${user_id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error("ユーザ更新に失敗しました");
    return res.json();
}

// ===============================
// メール更新
// ===============================
export async function updateEmail(user_id: string, email: string) {
    const res = await fetch(`${API_BASE}/users/${user_id}/email/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("メール更新に失敗しました");
    return res.json();
}

// ===============================
// パスワード更新
// ===============================
export async function updatePassword(user_id: string, password: string) {
    const res = await fetch(`${API_BASE}/users/${user_id}/password/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error("パスワード更新に失敗しました");
    return res.json();
}

// ===============================
// ユーザ削除
// ===============================
export async function deleteUser(user_id: string) {
    const res = await fetch(`${API_BASE}/users/${user_id}/`, { method: "DELETE" });
    if (!res.ok) throw new Error("ユーザ削除に失敗しました");
    return res.json();
}
