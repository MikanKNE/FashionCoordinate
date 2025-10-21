import { useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function Login() {
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) setMessage("ログインメールの送信に失敗しました。")
        else setMessage("ログインリンクをメールに送信しました。")
    }

    return (
        <div>
            <h1>ログイン</h1>
            <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleLogin}>ログインリンクを送信</button>
            <p>{message}</p>
        </div>
    )
}