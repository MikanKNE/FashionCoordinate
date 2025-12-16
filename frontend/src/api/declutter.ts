// frontend/src/api/declutter.ts
import { API_BASE } from "./index";
import { supabase } from "../lib/supabaseClient";

export type DeclutterItem = {
    item_id: number;
    name: string;
    declutter_score: number;
    is_declutter_candidate: boolean;
    reasons: string[];
    stats: {
        usage_count: number;
        last_used_date: string | null;
        days_since_created: number;
    };
};

export async function getDeclutterCandidates(): Promise<DeclutterItem[]> {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("未ログインです");
    }

    const res = await fetch(
        `${API_BASE}/items/declutter_candidates/`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error("断捨離候補の取得に失敗しました: " + text);
    }

    return res.json();
}
