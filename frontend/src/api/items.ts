import { API_BASE } from "./index";

export async function getItems() {
    const res = await fetch(`${API_BASE}/items/`);
    return res.json();
}

export async function createItem(item: any) {
    const res = await fetch(`${API_BASE}/items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    return res.json();
}

export async function updateItem(item_id: number, item: any) {
    const res = await fetch(`${API_BASE}/items/${item_id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    return res.json();
}

export async function deleteItem(item_id: number) {
    const res = await fetch(`${API_BASE}/items/${item_id}/`, { method: "DELETE" });
    return res.json();
}