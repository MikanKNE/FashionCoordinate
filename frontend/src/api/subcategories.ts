// frontend/src/api/subcategories.ts
import { API_BASE } from "./index";

export async function getSubcategories(category?: string) {
    const url = category
        ? `${API_BASE}/subcategories/?category=${encodeURIComponent(category)}`
        : `${API_BASE}/subcategories/`;

    const res = await fetch(url);
    return res.json();
}
