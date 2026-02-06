// frontend/src/pages/SignUpForm.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Card from '../components/ui/Card';

const SignUpForm = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setMessage(null)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            console.log('User registered:', data)
            setMessage('確認メールを送信しました。メールを確認してください。')
            // 確認メールのリンクをクリックした後にログイン可能になります
            // navigate('/login') // メール確認不要ならここで自動遷移も可
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Card>
                <h1 className="text-2xl mb-4">新規登録</h1>
                <form onSubmit={handleSignUp} className="flex flex-col w-80 space-y-3">
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border p-2 rounded"
                    />
                    <input
                        type="password"
                        placeholder="パスワード"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 rounded"
                    />
                    <button
                        type="submit"
                        className="bg-green-500 text-white py-2 rounded hover:bg-green-600 cursor-pointer"
                    >
                        登録
                    </button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {message && <p className="text-green-600 text-sm">{message}</p>}

                    <p className="text-sm text-center mt-2">
                        すでにアカウントをお持ちの方は{' '}
                        <Link to="/" className="text-blue-500 hover:underline">
                            ログイン
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    )
}

export default SignUpForm
