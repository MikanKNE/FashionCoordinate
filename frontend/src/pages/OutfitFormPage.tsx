// pages/OutfitFormPage.tsx
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Header from "../components/Header"

export default function OutfitFormPage() {
    const [searchParams] = useSearchParams()
    const date = searchParams.get('date')
    const navigate = useNavigate()

    const [items, setItems] = useState<any[]>([])
    const [coordinations, setCoordinations] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<number | null>(null)
    const [selectedCoordination, setSelectedCoordination] = useState<number | null>(null)

    useEffect(() => {
        // アイテムとコーディネートを取得
        async function fetchData() {
            const { data: itemsData } = await supabase.from('items').select('*')
            const { data: coordData } = await supabase.from('coordinations').select('*')
            setItems(itemsData || [])
            setCoordinations(coordData || [])
        }
        fetchData()
    }, [])

    const handleSave = async () => {
        if (!date) return

        const { error } = await supabase.from('usage_history').upsert([
            {
                item_id: selectedItem,
                used_date: date,
                weather: null, // 後でAPI連携
                temperature: null
            }
        ])

        if (error) {
            console.error(error)
            alert('保存に失敗しました')
        } else {
            alert('服装を登録しました')
            navigate('/dashboard')
        }
    }

    return (
        <>
            <Header />
            <div className="p-6">
                <h1 className="text-xl font-bold mb-4">服装登録</h1>

                <h2 className="font-semibold mb-2">アイテム一覧</h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {items.map(item => (
                        <div
                            key={item.item_id}
                            onClick={() => setSelectedItem(item.item_id)}
                            className={`border rounded-lg p-2 cursor-pointer ${selectedItem === item.item_id ? 'border-blue-500' : ''}`}
                        >
                            <img src={item.image_url} alt={item.name} className="w-full h-24 object-cover rounded" />
                            <p className="text-sm text-center mt-1">{item.name}</p>
                        </div>
                    ))}
                </div>

                <h2 className="font-semibold mb-2">コーデ一覧</h2>
                <div className="grid grid-cols-3 gap-3">
                    {coordinations.map(coord => (
                        <div
                            key={coord.coordination_id}
                            onClick={() => setSelectedCoordination(coord.coordination_id)}
                            className={`border rounded-lg p-2 cursor-pointer ${selectedCoordination === coord.coordination_id ? 'border-blue-500' : ''}`}
                        >
                            <p className="text-sm text-center">{coord.name}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={() => navigate(-1)}
                    >
                        戻る
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={handleSave}
                    >
                        保存
                    </button>
                </div>
            </div>
        </>
    )
}
