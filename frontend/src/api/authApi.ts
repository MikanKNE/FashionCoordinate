// frontend/src/api/authApi.ts
import { supabase } from '../lib/supabaseClient'

// ===========================
// 保護されたAPIデータ取得（ログインユーザーのみ）
// ===========================
export const fetchProtectedData = async () => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
        throw new Error('ログインが必要です')
    }

    const res = await fetch('http://127.0.0.1:8000/api/protected/', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        throw new Error('APIアクセスに失敗しました')
    }

    return res.json()
}
