import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirm) {
            setError('Пароли не совпадают')
            return
        }

        setSubmitting(true)
        try {
            await register(username, email, password)
            navigate('/', { replace: true })
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ошибка регистрации')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
            <h1>Регистрация</h1>
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
                    <label style={{ display: 'block', marginBottom: 5 }}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
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
                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5 }}>Подтверждение пароля</label>
                    <input
                        type="password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px 12px', fontSize: 16, boxSizing: 'border-box' }}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        width: '100%', padding: '10px', fontSize: 16, cursor: 'pointer',
                        backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 5
                    }}
                >
                    {submitting ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </form>
            <p style={{ marginTop: 15, textAlign: 'center' }}>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
        </div>
    )
}
