// frontend/src/api/items.ts
import { API_BASE } from "./index";
import { supabase } from "../lib/supabaseClient";
import type { ItemFormValues } from "../components/ItemForm";

// ===========================
// JWT ヘッダー作成
// ===========================
async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Not logged in");

    return {
        Authorization: `Bearer ${token}`,
    };
}

// ===========================
// 全アイテム取得
// ===========================
export async function getItems() {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/items/`, { headers });
    if (!res.ok) throw new Error("Failed to fetch items");
    return res.json();
}

// ===========================
// アイテム作成
// ===========================
export async function createItem(values: ItemFormValues) {
    const headers = await authHeaders();

    const form = new FormData();
    form.append("name", values.name);
    form.append("category", values.category);
    form.append("subcategory_id", String(values.subcategory_id ?? ""));
    form.append("storage_id", String(values.storage_id ?? ""));
    form.append("color", values.color);
    form.append("material", values.material);
    form.append("pattern", values.pattern);
    form.append("season_tag", JSON.stringify(values.season_tag));
    form.append("tpo_tags", JSON.stringify(values.tpo_tags));
    form.append("is_favorite", String(values.is_favorite));

    if (values.image_file) {
        form.append("image", values.image_file);
    }

    const res = await fetch(`${API_BASE}/items/`, {
        method: "POST",
        headers,
        body: form,
    });

    if (!res.ok) {
        console.error(await res.text());
        throw new Error("Failed to create item");
    }

    return res.json();
}

// ===========================
// アイテム更新
// ===========================
export async function updateItem(item_id: number, values: ItemFormValues) {
    const headers = await authHeaders();

    const form = new FormData();
    form.append("name", values.name);
    form.append("category", values.category);
    form.append("subcategory_id", String(values.subcategory_id ?? ""));
    form.append("storage_id", String(values.storage_id ?? ""));
    form.append("color", values.color);
    form.append("material", values.material);
    form.append("pattern", values.pattern);
    form.append("season_tag", JSON.stringify(values.season_tag));
    form.append("tpo_tags", JSON.stringify(values.tpo_tags));
    form.append("is_favorite", String(values.is_favorite));

    if (values.image_file) {
        form.append("image", values.image_file);
    }

    const res = await fetch(`${API_BASE}/items/${item_id}/`, {
        method: "PUT",
        headers,
        body: form,
    });

    if (!res.ok) {
        console.error(await res.text());
        throw new Error("Failed to update item");
    }

    return res.json();
}

// ===========================
// アイテム取得
// ===========================
export async function getItemDetail(item_id: number) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/items/${item_id}/`, { headers });
    if (!res.ok) throw new Error("Failed to fetch item detail");
    return res.json();
}

// ===========================
// アイテム削除
// ===========================
export async function deleteItem(item_id: number) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/items/${item_id}/`, {
        method: "DELETE",
        headers
    });
    if (!res.ok) throw new Error("Failed to delete item");
    return res.json();
}

// ===========================
// 署名付きURLを取得
// ===========================
export async function getItemImageUrl(item_id: number) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/items/${item_id}/image/`, {
        headers,
    });

    if (!res.ok) {
        console.error(await res.text());
        throw new Error("Failed to get signed image URL");
    }

    const json = await res.json();
    return json.url as string; // 署名付きURL
}
