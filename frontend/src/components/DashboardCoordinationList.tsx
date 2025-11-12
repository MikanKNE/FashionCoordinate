// frontend/src/components/DashboardCoordinationList.tsx
import { useEffect, useState } from "react";

export default function DashboardCoordinationList() {
    const [coordinations, setCoordinations] = useState<any[]>([]);

    useEffect(() => {
        import("../api/coordinations").then(({ getCoordinations }) => {
            getCoordinations().then((res) => {
                const list = Array.isArray(res) ? res : res.data
                setCoordinations(list.slice(0, 3))
            })
        })
    }, [])

    return (
        <div>
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
