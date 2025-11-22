// frontend/src/components/OutfitModal.tsx
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { getUsageByDate } from '../api/usage_history'

export default function OutfitModal({
    date,
    onClose,
}: {
    date: Date
    onClose: () => void
}) {
    const navigate = useNavigate()
    const modalRef = useRef<HTMLDivElement>(null)
    const [items, setItems] = useState<any[]>([]) // その日の服装アイテム

    const today = new Date();
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const isFuture = selectedDate > today;

    // 編集ページ遷移
    const handleEdit = () => {
        const localDateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
        navigate(`/outfit-form?date=${localDateStr}`)
    }

    // 背景クリックで閉じる
    const handleClickOutside = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose()
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // その日の服装を取得
    useEffect(() => {
        const fetchItems = async () => {
            const localDateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`

            const res = await getUsageByDate(localDateStr)
            if (res.status === 'success') {
                // items配列をまとめる
                const allItems = res.data.map((u: any) => u.items).flat()
                setItems(allItems)
            }
        }
        fetchItems()
    }, [date])

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg w-96 max-h-[80vh] overflow-y-auto"
            >
                {/* ✕ ボタン */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                    aria-label="閉じる"
                >
                    ×
                </button>

                <h2 className="text-lg font-bold mb-4">
                    {date.toLocaleDateString()} の服装
                </h2>

                {/* 服装アイテム表示 */}
                {items.length === 0 ? (
                    <p className="text-gray-600">この日は登録がありません</p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {items.map(item => (
                            <div key={item.item_id} className="border rounded p-1">
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-20 object-cover rounded"
                                />
                                <p className="text-sm text-center mt-1">{item.name}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end mt-6 gap-2">
                    {!isFuture && (
                        <button
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-blue-600"
                            onClick={handleEdit}
                        >
                            {items.length > 0 ? "編集" : "登録"}
                        </button>
                    )}
                </div>

            </div>
        </div>
    )
}
