// frontend/src/api/coordinations.ts
import { API_BASE } from "./index";

export async function getCoordinations() {
    const res = await fetch(`${API_BASE}/coordinations/`);
    return res.json();
}

export async function createCoordination(data: any) {
    const res = await fetch(`${API_BASE}/coordinations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updateCoordination(id: number, data: any) {
    const res = await fetch(`${API_BASE}/coordinations/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deleteCoordination(id: number) {
    const res = await fetch(`${API_BASE}/coordinations/${id}/`, { method: "DELETE" });
    return res.json();
}