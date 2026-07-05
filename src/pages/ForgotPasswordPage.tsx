import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

export function ForgotPasswordPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            const res = await fetch('/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || 'Ошибка')
            setSent(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ошибка')
        } finally {
            setSubmitting(false)
        }
    }

    if (sent) {
        return (
            <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
                <h1 style={{ fontSize: 28 }}>Проверьте почту</h1>
                <p>Если такой email зарегистрирован, мы отправили на него ссылку для восстановления пароля.</p>
                <p style={{ marginTop: 15, textAlign: 'center' }}>
                    <Link to="/login">Вернуться ко входу</Link>
                </p>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
            <h1 style={{ fontSize: 28 }}>Восстановление пароля</h1>
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
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        width: '100%', padding: '10px', fontSize: 16, cursor: 'pointer',
                        backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 5
                    }}
                >
                    {submitting ? 'Отправка...' : 'Отправить'}
                </button>
            </form>
            <p style={{ marginTop: 15, textAlign: 'center' }}>
                <Link to="/login">Вернуться ко входу</Link>
            </p>
        </div>
    )
}
