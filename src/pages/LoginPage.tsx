import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await login(username, password)
            navigate('/', { replace: true })
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ошибка входа')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
        }}>
            <div style={{
                width: 380,
                padding: '40px 32px',
                backgroundColor: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Вход</h1>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>Имя пользователя</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px 12px', fontSize: 16, boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px 12px', fontSize: 16, boxSizing: 'border-box' }}
                        />
                    </div>
                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            width: '100%', padding: '10px', fontSize: 16, cursor: 'pointer',
                            backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 5
                        }}
                    >
                        {submitting ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                <p style={{ marginTop: 12, textAlign: 'center' }}>
                    <Link to="/forgot-password">Забыли пароль?</Link>
                </p>
                <p style={{ marginTop: 8, textAlign: 'center' }}>
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    )
}
