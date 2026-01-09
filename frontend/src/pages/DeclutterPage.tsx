// src/pages/DeclutterPage.tsx
import { useEffect, useState } from "react";
import {
    getDeclutterCandidates,
    type DeclutterItem,
} from "../api";

import { DeclutterCandidateCard } from "../components/DeclutterCandidateCard";
import Header from "../components/Header";

export default function DeclutterPage() {
    const [items, setItems] = useState<DeclutterItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDeclutterCandidates()
            .then(setItems)
            .finally(() => setLoading(false));
    }, []);

    const handleActionComplete = (itemId: number) => {
        setItems(prev =>
            prev.filter(item => item.item_id !== itemId)
        );
    };

    if (loading) {
        return <p>読み込み中...</p>;
    }

    return (
        <>
            <Header />

            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">断捨離の提案</h1>

                {items.length === 0 ? (
                    <p className="text-gray-500">
                        断捨離候補はありません
                    </p>
                ) : (
                    items.map(item => (
                        <DeclutterCandidateCard
                            key={item.item_id}
                            item={item}
                            onActionComplete={handleActionComplete}
                        />
                    ))
                )}
            </div>
        </>
    );
}
