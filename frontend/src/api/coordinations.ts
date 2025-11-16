// frontend/src/api/coordinations.ts

// ----------------------------
// コーディネーション作成（coordinations + coordination_items のまとめ登録）
// ----------------------------
export const createCoordination = async (payload: {
    name: string;
    is_favorite: boolean;
    items: number[]; // item_id[]
}) => {
    const res = await fetch("/api/coordinations/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return res.json();
};

// ----------------------------
// 一覧取得
// ----------------------------
export const getCoordinations = async () => {
    const res = await fetch("/api/coordinations/");
    return res.json();
};

// ----------------------------
// 単体取得
// ----------------------------
export const getCoordination = async (coordination_id: number) => {
    const res = await fetch(`/api/coordinations/${coordination_id}/`);
    return res.json();
};

// ----------------------------
// 更新
// ----------------------------
export const updateCoordination = async (
    coordination_id: number,
    data: any
) => {
    const res = await fetch(`/api/coordinations/${coordination_id}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return res.json();
};

// ----------------------------
// 削除
// ----------------------------
export const deleteCoordination = async (coordination_id: number) => {
    const res = await fetch(`/api/coordinations/${coordination_id}/`, {
        method: "DELETE",
    });

    return res.json();
};

// ----------------------------
// coordination_items の追加
// ----------------------------
export const addItemToCoordination = async (
    coordination_id: number,
    item_id: number
) => {
    const res = await fetch("/api/coordination_items/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            coordination_id,
            item_id,
        }),
    });

    return res.json();
};

// ----------------------------
// coordination_items の削除
// ----------------------------
export const removeItemFromCoordination = async (
    coordination_id: number,
    item_id: number
) => {
    const res = await fetch("/api/coordination_items/", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            coordination_id,
            item_id,
        }),
    });

    return res.json();
};
