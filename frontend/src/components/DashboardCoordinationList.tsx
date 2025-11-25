// frontend/src/components/DashboardCoordinationList.tsx
import { useEffect, useState } from "react";
import { getCoordinations } from "../api/coordinations";

export default function DashboardCoordinationList() {
    const [coordinations, setCoordinations] = useState<any[]>([]);

    useEffect(() => {
        getCoordinations()
            .then((res) => {
                const list = Array.isArray(res) ? res : res.data;
                setCoordinations(list.slice(0, 3));
            })
            .catch((err) => console.error("コーディネーション取得エラー:", err));
    }, []);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-3">コーディネート一覧</h2>

            <div className="flex flex-col gap-4">
                {coordinations.map((c) => (
                    <div
                        key={c.id}
                        className="relative rounded-2xl shadow-md bg-white dark:bg-gray-800 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-lg p-3 flex flex-col items-start"
                    >
                        {/* コーディネート名（左詰め） */}
                        <h3 className="font-medium text-base mb-2">{c.name || c.coordination_name}</h3>

                        {/* アイテム画像（左詰め、最大3枚） */}
                        <div className="flex gap-2">
                            {c.items?.slice(0, 3).map((item: any) =>
                                item.image_url ? (
                                    <img
                                        key={item.item_id}
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-xl"
                                    />
                                ) : (
                                    <div
                                        key={item.item_id}
                                        className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs"
                                    >
                                        No Image
                                    </div>
                                )
                            )}
                        </div>

                        {/* お気に入り表示（任意） */}
                        {c.is_favorite && (
                            <p className="text-xs text-blue-500 mt-1">★ お気に入り</p>
                        )}
                    </div>
                ))}
            </div>

            {coordinations.length === 0 && (
                <p className="text-gray-500">コーディネートはまだ登録されていません</p>
            )}
        </div>
    );
}
