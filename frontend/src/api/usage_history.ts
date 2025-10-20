import { API_BASE } from "./index";

export async function getUsageHistory() {
    const res = await fetch(`${API_BASE}/usage_history/`);
    return res.json();
}

export async function createUsage(data: any) {
    const res = await fetch(`${API_BASE}/usage_history/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updateUsage(id: number, data: any) {
    const res = await fetch(`${API_BASE}/usage_history/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deleteUsage(id: number) {
    const res = await fetch(`${API_BASE}/usage_history/${id}/`, { method: "DELETE" });
    return res.json();
}