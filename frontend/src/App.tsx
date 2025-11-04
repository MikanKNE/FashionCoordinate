import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import AppRoutes from './routes/AppRoutes'

function App() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return <AppRoutes />
}

export default App
