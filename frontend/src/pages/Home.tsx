// src/pages/Home.tsx
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import ItemList from "../components/ItemList"
import Header from "../components/Header"

export default function Home() {
    const [items, setItems] = useState<any[]>([])

    useEffect(() => {
        const fetchItems = async () => {
            const { data, error } = await supabase.from("items").select("*")
            if (error) console.error(error)
            else setItems(data)
        }
        fetchItems()
    }, [])

    return (
        <>
            <Header />
            <h1>アイテム一覧</h1>
            <ItemList items={items} />
        </>
    )
}