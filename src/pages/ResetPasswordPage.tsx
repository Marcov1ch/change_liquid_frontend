import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [done, setDone] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Пароли не совпадают')
            return
        }
        if (password.length < 6) {
            setError('Пароль должен быть не менее 6 символов')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || 'Ошибка')
            setDone(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ошибка')
        } finally {
            setSubmitting(false)
        }
    }

    if (!token) {
        return (
            <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
                <h1>Недействительная ссылка</h1>
                <p>Отсутствует токен восстановления. Перейдите по ссылке из письма.</p>
                <p style={{ marginTop: 15, textAlign: 'center' }}>
                    <Link to="/forgot-password">Запросить новое письмо</Link>
                </p>
            </div>
        )
    }

    if (done) {
        return (
            <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
                <h1>Пароль изменён</h1>
                <p>Теперь вы можете войти с новым паролем.</p>
                <p style={{ marginTop: 15, textAlign: 'center' }}>
                    <Link to="/login">Войти</Link>
                </p>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
            <h1>Новый пароль</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5 }}>Новый пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{ width: '100%', padding: '8px 12px', fontSize: 16, boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5 }}>Подтвердите пароль</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
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
                    {submitting ? 'Сохранение...' : 'Сохранить пароль'}
                </button>
            </form>
        </div>
    )
}
