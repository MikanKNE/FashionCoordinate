import { supabase } from "../lib/supabaseClient";

/**
 * Supabaseのアクセストークンを取得して認証ヘッダーを返す
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
}
