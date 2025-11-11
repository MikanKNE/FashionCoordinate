// frontend/src/components/OutfitModal.tsx
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function OutfitModal({
    date,
    onClose,
}: {
    date: Date
    onClose: () => void
}) {
    const navigate = useNavigate()
    const modalRef = useRef<HTMLDivElement>(null)

    const handleEdit = () => {
        navigate(`/outfit-form?date=${date.toISOString().split('T')[0]}`)
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

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="relative bg-white p-6 rounded-2xl shadow-lg w-96"
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

                {/* TODO: Supabase/Django APIで服装データを取得して表示 */}
                <p className="text-gray-600">登録された服装があればここに表示</p>

                <div className="flex justify-end mt-6 gap-2">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-blue-600"
                        onClick={handleEdit}
                    >
                        登録・編集
                    </button>
                </div>
            </div>
        </div>
    )
}
