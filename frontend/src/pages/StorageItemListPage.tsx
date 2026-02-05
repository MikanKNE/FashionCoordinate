import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/Header";
import ItemList from "../components/ItemList";
import StorageFilter from "../components/StorageFilter";
import ItemDetailModal from "../components/ItemDetailModal";

import { fetchStoragesWithItems } from "../api/storages";
import type { StorageWithItems, Item } from "../types";

export default function StorageItemListPage() {
    const location = useLocation();

    const initialStorageId =
        (location.state as { storageId: number | null } | null)?.storageId ??
        null;

    const [storages, setStorages] = useState<StorageWithItems[]>([]);
    const [selectedStorageId, setSelectedStorageId] =
        useState<number | null>(initialStorageId);
    const [loading, setLoading] = useState(true);

    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchStoragesWithItems()
            .then((data) => {
                setStorages(data);

                if (initialStorageId === null) {
                    setSelectedStorageId(null);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredItems: Item[] = useMemo(() => {
        if (selectedStorageId === null) {
            return storages.flatMap((s) => s.items);
        }
        return (
            storages.find(
                (s) => s.storage_id === selectedStorageId
            )?.items || []
        );
    }, [storages, selectedStorageId]);

    return (
        <>
            <Header />

            <div className="min-h-screen p-6">
                <h1 className="text-2xl font-bold mb-4">
                    収納アイテム一覧
                </h1>

                <div className="grid grid-cols-10 gap-6">
                    {/* 左：フィルター */}
                    <aside className="col-span-2 sticky top-0 mt-6">
                        <StorageFilter
                            storages={storages}
                            selectedStorageId={selectedStorageId}
                            onSelect={setSelectedStorageId}
                        />
                    </aside>

                    {/* 右：アイテム一覧 */}
                    <main className="col-span-8">
                        {loading ? (
                            <p>読み込み中...</p>
                        ) : (
                            <ItemList
                                items={filteredItems}
                                onItemClick={(id) => {
                                    setSelectedItemId(id);
                                    setIsModalOpen(true);
                                }}
                            />
                        )}
                    </main>
                </div>
            </div>
            <ItemDetailModal
                itemId={selectedItemId}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedItemId(null);
                }}
                showActions={false}
            />
        </>
    );
}
