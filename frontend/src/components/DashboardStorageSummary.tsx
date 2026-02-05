import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchStoragesWithItems } from "../api/storages";
import type { StorageWithItems } from "../types";

export default function DashboardStorageSummary() {
    const [storages, setStorages] = useState<StorageWithItems[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStoragesWithItems().then(setStorages);
    }, []);

    return (
        <div className="space-y-4">
            {/* 収納場所（すべて表示） */}
            <h2
                className="text-lg font-semibold mb-3 flex items-center gap-1
                           cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() =>
                    navigate("/storages/items", {
                        state: { storageId: null },
                    })
                }
            >
                収納場所
                <span>＞</span>
            </h2>

            <div className="flex flex-col gap-4">
                {storages.map((storage) => (
                    <div
                        key={storage.storage_id}
                        onClick={() =>
                            navigate("/storages/items", {
                                state: { storageId: storage.storage_id },
                            })
                        }
                        className="relative rounded-2xl shadow-md bg-white dark:bg-gray-800
                                   cursor-pointer transition-all
                                   border border-gray-200 dark:border-gray-500/70
                                   hover:scale-[1.03] hover:shadow-lg
                                   p-4 flex items-center justify-between"
                    >
                        {/* 収納場所名 */}
                        <span className="font-medium text-base">
                            {storage.storage_location}
                        </span>

                        {/* アイテム数 */}
                        <span className="text-sm text-gray-500">
                            {storage.items.length} アイテム
                        </span>
                    </div>
                ))}
            </div>

            {storages.length === 0 && (
                <p className="text-gray-500">
                    収納場所はまだ登録されていません
                </p>
            )}
        </div>
    );
}
