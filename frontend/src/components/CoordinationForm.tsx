// frontend/src/components/CoordinationForm.tsx
import type { FC } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createCoordination, updateCoordination } from "../api/coordinations";

import { Button } from "./ui/Button";

import type { Item, Coordination } from "../types";

export interface CoordinationFormData {
    name: string;
    is_favorite: boolean;
}

interface Props {
    selectedItems: Item[];
    coordination?: Coordination;
    onSubmitSuccess?: () => void;
}

const CoordinationForm: FC<Props> = ({ selectedItems, coordination, onSubmitSuccess }) => {
    const [form, setForm] = useState<CoordinationFormData>({
        name: "",
        is_favorite: false,
    });
    const [status, setStatus] = useState<string>("");
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
        if (!form.name.trim()) {
            setStatus("コーディネート名を入力してください");
            return;
        }

        // アイテム選択チェック
        if (selectedItems.length === 0) {
            setStatus("アイテムを選択してください");
            return;
        }

        try {
            if (coordination) {
                // 編集更新
                const res = await updateCoordination(coordination.coordination_id, {
                    ...form,
                    items: selectedItems.map((i) => i.item_id),
                });
                if (res.status === "success") {
                    setStatus("更新完了！");
                    onSubmitSuccess?.();
                    navigate("/coordination-list");
                } else {
                    setStatus("更新失敗: " + (res.message ?? ""));
                }
            } else {
                // 新規作成
                const res = await createCoordination({
                    ...form,
                    items: selectedItems.map((i) => i.item_id),
                });
                if (res.status === "success") {
                    setStatus("登録完了！");
                    setForm({ name: "", is_favorite: false });
                    onSubmitSuccess?.();
                    navigate("/coordination-list");
                } else {
                    setStatus("登録失敗: " + (res.message ?? ""));
                }
            }
        } catch (err) {
            setStatus("エラー: " + (err instanceof Error ? err.message : ""));
        }
    };

    return (
        <div className="mt-4 space-y-2">
            <label>コーディネート名<span className="text-red-500">*</span></label>
            <input
                type="text"
                value={form.name}
                className="w-full p-2 rounded
                        bg-white text-gray-900 border border-gray-300
                        dark:bg-gray-800 dark:text-white dark:border-gray-600
                        focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                required
                onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                }
            />
            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={form.is_favorite}
                    onChange={(e) =>
                        setForm({ ...form, is_favorite: e.target.checked })
                    }
                />
                お気に入り
            </label>

            <Button variant="primary" onClick={handleSubmit}>
                {coordination ? "更新" : "登録"}
            </Button>
            <Button type="button" onClick={() => navigate("/coordination-list")}>
                キャンセル
            </Button>

            {status && <p>{status}</p>}
        </div>
    );
};

export default CoordinationForm;
