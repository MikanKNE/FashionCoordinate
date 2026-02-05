// frontend/src/pages/Login.tsx
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            console.log('Logged in:', data)
            navigate('/dashboard') // ログイン後にホームへ
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Card>
                <h1 className="text-2xl mb-4">ログイン</h1>
                <form onSubmit={handleLogin} className="flex flex-col w-80 space-y-3">
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
                    <Button
                        type="submit"
                        className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        ログイン
                    </Button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <p className="text-sm text-center mt-2">
                        アカウントをお持ちでない方は{' '}
                        <Link to="/signup" className="text-blue-500 hover:underline">
                            新規登録はこちら
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    )
}

export default Login
