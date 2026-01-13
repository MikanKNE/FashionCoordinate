// frontend/src/api/imageAnalysis.ts
import { API_BASE } from "./index";
import { supabase } from "../lib/supabaseClient";

export interface ImageAnalysisResult {
    category?: string;
    color?: string;
    material?: string;
    pattern?: string;
    season_tag?: string[];
    tpo_tags?: string[];
}

async function authHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Not logged in");

    return {
        Authorization: `Bearer ${token}`,
    };
}

/**
 * 画像解析API
 */
export async function analyzeImage(
    file: File,
    mode: "preview" | "analyze" = "preview"
): Promise<ImageAnalysisResult> {
    const headers = await authHeaders();

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_BASE}/image_analysis/${mode}/`, {
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

    return json.dummy_result ?? {};
}
