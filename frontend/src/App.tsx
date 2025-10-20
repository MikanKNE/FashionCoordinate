import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient'
import CoordinationEditor from "./components/CoordinationEditor";

function App() {
  // Supabase データ取得用
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('items').select('*')
      if (error) console.log(error)
      else setItems(data)
    }
    fetchItems()
  }, [])

  return (
    <div>
      <h1>FashionCoordinate</h1>
      <CoordinationEditor coordinationId={1} />
    </div>
  )
}

export default App