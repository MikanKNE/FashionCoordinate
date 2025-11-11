// frontend/src/components/DashboardCoordinationList.tsx
import { useEffect, useState } from "react";
import { getCoordinations } from "../api/coordinations";

export default function DashboardCoordinationList() {
    const [coordinations, setCoordinations] = useState<any[]>([]);

    useEffect(() => {
        getCoordinations().then((res) => {
            const list = Array.isArray(res) ? res : res.data
            setCoordinations(list.slice(0, 3))
        })
    }, [])

    return (
        <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">コーデ一覧</h2>
            <ul className="space-y-2">
                {coordinations.map((c) => (
                    <li key={c.id} className="border-b pb-1">
                        {c.name || c.coordination_name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
