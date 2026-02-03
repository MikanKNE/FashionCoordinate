// frontend/src/api/authApi.ts
import { supabase } from '../lib/supabaseClient'
import { API_BASE } from './index'

// ===========================
// 保護されたAPIデータ取得（ログインユーザーのみ）
// ===========================
export const fetchProtectedData = async () => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    console.log("API_BASE:", API_BASE)


    if (!token) {
        throw new Error('ログインが必要です')
    }

    const res = await fetch(`${API_BASE}/api/protected/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        throw new Error('APIアクセスに失敗しました')
    }

    return res.json()
}

