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
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                <h1 className="text-headline-large text-center mb-6">Регистрация</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-label-large mb-1.5 text-md-on-surface">
                            Имя пользователя
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 text-body-large rounded-md-sm
                                       border border-md-outline bg-md-surface
                                       text-md-on-surface placeholder:text-md-outline
                                       transition-all duration-md-2
                                       focus:outline-none focus:ring-2 focus:ring-md-primary
                                       focus:border-md-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-label-large mb-1.5 text-md-on-surface">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 text-body-large rounded-md-sm
                                       border border-md-outline bg-md-surface
                                       text-md-on-surface placeholder:text-md-outline
                                       transition-all duration-md-2
                                       focus:outline-none focus:ring-2 focus:ring-md-primary
                                       focus:border-md-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-label-large mb-1.5 text-md-on-surface">
                            Пароль
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 text-body-large rounded-md-sm
                                       border border-md-outline bg-md-surface
                                       text-md-on-surface placeholder:text-md-outline
                                       transition-all duration-md-2
                                       focus:outline-none focus:ring-2 focus:ring-md-primary
                                       focus:border-md-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-label-large mb-1.5 text-md-on-surface">
                            Подтверждение пароля
                        </label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 text-body-large rounded-md-sm
                                       border border-md-outline bg-md-surface
                                       text-md-on-surface placeholder:text-md-outline
                                       transition-all duration-md-2
                                       focus:outline-none focus:ring-2 focus:ring-md-primary
                                       focus:border-md-primary"
                        />
                    </div>
                    {error && (
                        <p className="text-md-error text-body-medium bg-md-error-container/30
                                      px-3 py-2 rounded-md-sm">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 px-4 rounded-md-full text-label-large
                                   bg-md-primary text-md-on-primary
                                   transition-all duration-md-2
                                   hover:shadow-md-1 active:scale-[0.98]
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2"
                    >
                        {submitting && (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white
                                             rounded-md-full animate-spin" />
                        )}
                        {submitting ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p className="mt-5 text-center text-body-medium">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </p>
            </div>
        </div>
    )
}
