import { useNavigate } from "react-router-dom";
import Card from "./ui/Card";
import type { StorageWithItems } from "../types";
import { Button } from "./ui/Button";

interface Props {
    storages: StorageWithItems[];
    selectedStorageId: number | null;
    onSelect: (id: number | null) => void;
}

export default function StorageFilter({
    storages,
    selectedStorageId,
    onSelect,
}: Props) {
    const navigate = useNavigate();

    return (
        <Card>
            {/* タイトル行 */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">収納場所</h3>

                {/* 収納場所追加ボタン */}
                <div className="ml-auto">
                    <Button
                        onClick={() => navigate("/user-profile")}
                        title="収納場所を追加"
                    >
                        ＋追加
                    </Button>
                </div>
            </div>

            <div className="space-y-1">
                {/* すべて */}
                <button
                    onClick={() => onSelect(null)}
                    className={`w-full text-left px-3 py-2 rounded-md transition
                        ${selectedStorageId === null
                            ? "bg-gray-100 border border-gray-300 font-semibold dark:bg-slate-700 dark:border-slate-600"
                            : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                        }
                    `}
                >
                    すべて
                </button>

                {storages.map((storage) => {
                    const isSelected =
                        selectedStorageId === storage.storage_id;

                    return (
                        <button
                            key={storage.storage_id}
                            onClick={() => onSelect(storage.storage_id)}
                            className={`w-full text-left px-3 py-2 rounded-md transition
                                ${isSelected
                                    ? "bg-gray-100 border border-gray-300 font-semibold dark:bg-slate-700 dark:border-slate-600"
                                    : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                                }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <span>{storage.storage_location}</span>
                                <span className="text-sm text-gray-500">
                                    ({storage.items.length})
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </Card>
    );
}
