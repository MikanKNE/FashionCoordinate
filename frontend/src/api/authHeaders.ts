// frontend/src/api/authHeaders.ts

/**
 * Supabaseのアクセストークンを取得して、
 * 認証付きリクエスト用の共通ヘッダーを返す
 */
export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("supabase.auth.token");
    let accessToken: string | null = null;

    if (token) {
        try {
            const parsed = JSON.parse(token);
            accessToken =
                parsed?.currentSession?.access_token ||
                parsed?.access_token ||
                null;
        } catch {
            accessToken = null;
        }
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return headers;
}
