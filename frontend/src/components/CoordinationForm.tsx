// frontend/src/components/CoordinationForm.tsx
import type { FC } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createCoordination, updateCoordination } from "../api/coordinations";
import {
    addItemToCoordination,
    removeItemFromCoordination,
    getAllCoordinationItems,
} from "../api/coordination_items";

import { Button } from "./ui/Button";

import type { Item, Coordination, CoordinationItem } from "../types";

export interface CoordinationFormData {
    name: string;
    is_favorite: boolean;
}

interface Props {
    selectedItems: Item[];
    coordination?: Coordination;
    onSubmitSuccess?: () => void;
}

const CoordinationForm: FC<Props> = ({
    selectedItems,
    coordination,
    onSubmitSuccess,
}) => {
    const [form, setForm] = useState<CoordinationFormData>({
        name: "",
        is_favorite: false,
    });

    const navigate = useNavigate();

    // 編集時に既存値を初期セット
    useEffect(() => {
        if (coordination) {
            setForm({
                name: coordination.name,
                is_favorite: coordination.is_favorite,
            });
        }
    }, [coordination]);

    const handleSubmit = async () => {
        // フロントバリデーション
        if (!form.name.trim()) {
            toast.error("コーディネート名を入力してください");
            return;
        }

        if (selectedItems.length === 0) {
            toast.error("アイテムを選択してください");
            return;
        }

        try {
            // ==========================
            // 編集
            // ==========================
            if (coordination) {
                const coordinationId = coordination.coordination_id;

                // ① coordination 本体更新
                await updateCoordination(coordinationId, {
                    name: form.name,
                    is_favorite: form.is_favorite,
                    items: selectedItems.map((i) => i.item_id),
                });

                // ② 既存アイテム取得
                const ciRes = await getAllCoordinationItems();
                const allCI: CoordinationItem[] = ciRes.data ?? [];

                const beforeIds = new Set(
                    allCI
                        .filter(
                            (ci) =>
                                ci.coordination_id === coordinationId
                        )
                        .map((ci) => ci.item_id)
                );

                // ③ 現在選択中
                const afterIds = new Set(
                    selectedItems.map((i) => i.item_id)
                );

                // ④ 差分計算
                const toAdd = [...afterIds].filter(
                    (id) => !beforeIds.has(id)
                );
                const toRemove = [...beforeIds].filter(
                    (id) => !afterIds.has(id)
                );

                // ⑤ 中間テーブル更新
                await Promise.all([
                    ...toAdd.map((id) =>
                        addItemToCoordination(coordinationId, id)
                    ),
                    ...toRemove.map((id) =>
                        removeItemFromCoordination(coordinationId, id)
                    ),
                ]);

                toast.success("コーディネートを更新しました");
                onSubmitSuccess?.();
                navigate("/coordination-list");
                return;
            }

            // ==========================
            // 新規作成
            // ==========================
            const res = await createCoordination({
                name: form.name,
                is_favorite: form.is_favorite,
                items: selectedItems.map((i) => i.item_id),
            });

            if (res.status === "success") {
                toast.success("コーディネートを登録しました");
                setForm({ name: "", is_favorite: false });
                onSubmitSuccess?.();
                navigate("/coordination-list");
            } else {
                toast.error(res.message ?? "登録に失敗しました");
            }
        } catch (err) {
            console.error(err);

            if (err instanceof Error) {
                toast.error(err.message);
                return;
            }

            toast.error("予期しないエラーが発生しました");
        }
    };

    return (
        <div className="mt-4 space-y-2">
            <label>
                コーディネート名
                <span className="text-red-500">*</span>
            </label>

            <input
                type="text"
                value={form.name}
                maxLength={50}
                className="w-full p-2 rounded
                    bg-white text-gray-900 border border-gray-300
                    dark:bg-gray-800 dark:text-white dark:border-gray-600
                    focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                }
            />

            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={form.is_favorite}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            is_favorite: e.target.checked,
                        })
                    }
                />
                お気に入り
            </label>

            <Button variant="primary" onClick={handleSubmit}>
                {coordination ? "更新" : "登録"}
            </Button>

            <Button
                type="button"
                onClick={() => navigate("/coordination-list")}
            >
                キャンセル
            </Button>
        </div>
    );
};

export default CoordinationForm;
