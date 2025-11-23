// frontend/src/pages/CoordinationListPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Card from "../components/ui/Card";
import CoordinationDetailModal from "../components/CoordinationDetailModal";
import { getCoordinations } from "../api/coordinations";

export default function CoordinationListPage() {
    const [coordinations, setCoordinations] = useState<any[]>([]);
    const [selectedCoordination, setSelectedCoordination] = useState<any | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            const result = await getCoordinations();
            // 必ず配列だけを state に入れる
            setCoordinations(result.data || []);
        };
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
            <Header />

            <div className="max-w-3xl mx-auto p-4">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => navigate("/coordination/new")}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700"
                    >
                        新規作成
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coordinations.map((c) => (
                        <Card
                            key={c.coordination_id} // ← 修正
                            className="cursor-pointer hover:shadow-lg transition"
                            onClick={() => setSelectedCoordination(c)}
                        >
                            <h2 className="text-lg font-semibold mb-1">
                                {c.name || "無題コーディネーション"}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                作成日: {new Date(c.created_at).toLocaleDateString()}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>

            {selectedCoordination && (
                <CoordinationDetailModal
                    coordination={selectedCoordination}
                    onClose={() => setSelectedCoordination(null)}
                />
            )}
        </div>
    );
}
