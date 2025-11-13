// frontend/src/components/CoordinationForm.tsx
import type { FC } from "react";
import type { Item } from "../types";
import { useState } from "react";
import { createCoordination } from "../api/coordinations";
import { Button } from "./ui/Button";

export interface CoordinationFormData {
    name: string;
    is_favorite: boolean;
}

interface Props {
    selectedItems: Item[];
}

const CoordinationForm: FC<Props> = ({ selectedItems }) => {
    const [form, setForm] = useState<CoordinationFormData>({
        name: "",
        is_favorite: false,
    });
    const [status, setStatus] = useState<string>("");

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            setStatus("アイテムを選択してください");
            return;
        }
        try {
            const res = await createCoordination({
                ...form,
                items: selectedItems.map((i) => i.item_id),
            });
            if (res.status === "success") {
                setStatus("登録完了！");
                setForm({ name: "", is_favorite: false });
            } else {
                setStatus("登録失敗");
            }
        } catch (err) {
            setStatus("登録エラー");
        }
    };

    return (
        <div className="mt-4 space-y-2">
            <input
                type="text"
                placeholder="コーディネート名"
                value={form.name}
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
                登録
            </Button>

            {status && <p>{status}</p>}
        </div>
    );
};

export default CoordinationForm;
