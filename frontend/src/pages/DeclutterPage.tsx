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

    if (loading) {
        return <p>読み込み中...</p>;
    }

    if (items.length === 0) {
        return <p className="text-gray-500">断捨離候補はありません</p>;
    }

    return (
        <>
            <Header />
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">断捨離の提案</h1>

                {items.map(item => (
                    <DeclutterCandidateCard
                        key={item.item_id}
                        item={item}
                    />
                ))}
            </div>
        </>
    );
}
