import { useEffect, useState } from "react";
import { getCoordinations } from "../api/coordinations";

export default function DashboardCoordinationList() {
    const [coordinations, setCoordinations] = useState<any[]>([]);

    useEffect(() => {
        getCoordinations()
            .then((res) => setCoordinations(res.data?.slice(0, 3) || []))
            .catch(() => setCoordinations([]));
    }, []);

    if (coordinations.length === 0) {
        return <div className="p-4">コーディネーションがありません</div>;
    }

    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">コーデ一覧</h2>
            <ul className="space-y-2">
                {coordinations.map((c) => (
                    <li key={c.coordination_id} className="border-b pb-1">
                        {c.name || c.coordination_name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
