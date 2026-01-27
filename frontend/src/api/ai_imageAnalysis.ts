// frontend/src/api/ai_imageAnalysis.ts
import { API_BASE } from "./index";
import { supabase } from "../lib/supabaseClient";

/**
 * AI画像解析の正式レスポンス型
 * confidence は参照用に保持するが、採用可否には使わない
 */
export interface AiImageAnalysisResult {
    category?: string;
    subcategory_name?: string;
    color?: string;
    material?: string;
    pattern?: string;
    confidence?: {
        category?: number;
        color?: number;
        material?: number;
        pattern?: number;
    };
}


async function authHeaders(): Promise<HeadersInit> {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;
    if (!token) {
        throw new Error("ログインが必要です");
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}

/**
 * 画像解析API
 * confidence の値に関係なく result をそのまま返す
 */
export async function analyzeImage(
    file: File,
    mode: "preview" | "analyze" = "preview"
): Promise<AiImageAnalysisResult> {
    const headers = await authHeaders();

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_BASE}/ai_image_analysis/${mode}/`, {
        method: "POST",
        headers,
        body: form,
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    const json = await res.json();

    if (json.status !== "success") {
        throw new Error(json.message || "Image analysis failed");
    }

    return json.result as AiImageAnalysisResult;
}
