import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import oilCanister from '../assets/photo_2026-07-07_14-57-35.png'

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
        }}>
            <div style={{
                position: 'relative',
                width: 424,
                height: 702,
                backgroundImage: `url(${oilCanister})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '12%',
                    bottom: '12%',
                    left: '10%',
                    right: '10%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}>
                    <h1>Вход</h1>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5 }}>Имя пользователя</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                style={{ width: 'calc(100% - 32px)', padding: '8px 12px', fontSize: 16, boxSizing: 'border-box', margin: '0 16px' }}
                            />
                        </div>
                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5 }}>Пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{ width: 'calc(100% - 32px)', padding: '8px 12px', fontSize: 16, boxSizing: 'border-box', margin: '0 16px' }}
                            />
                        </div>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                width: 'calc(100% - 32px)', margin: '0 16px', padding: '10px', fontSize: 16, cursor: 'pointer',
                                backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 5
                            }}
                        >
                            {submitting ? 'Вход...' : 'Войти'}
                        </button>
                    </form>
                    <p style={{ marginTop: 10, textAlign: 'center' }}>
                        <Link to="/forgot-password">Забыли пароль?</Link>
                    </p>
                    <p style={{ marginTop: 10, textAlign: 'center' }}>
                        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
