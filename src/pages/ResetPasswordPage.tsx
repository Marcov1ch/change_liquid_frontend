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
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-8 px-4">
                <div className="w-full max-w-md text-center">
                    <h1 className="text-headline-medium mb-4">Недействительная ссылка</h1>
                    <p className="text-body-large text-md-on-surface-variant mb-4">
                        Отсутствует токен восстановления. Перейдите по ссылке из письма.
                    </p>
                    <Link to="/forgot-password">Запросить новое письмо</Link>
                </div>
            </div>
        )
    }

    if (done) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-8 px-4">
                <div className="w-full max-w-md text-center">
                    <h1 className="text-headline-medium mb-4">Пароль изменён</h1>
                    <p className="text-body-large text-md-on-surface-variant mb-4">
                        Теперь вы можете войти с новым паролем.
                    </p>
                    <Link to="/login">Войти</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                <h1 className="text-headline-medium text-center mb-6">Новый пароль</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-label-large mb-1.5 text-md-on-surface">
                            Новый пароль
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
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
                            Подтвердите пароль
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
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
                        {submitting ? 'Сохранение...' : 'Сохранить пароль'}
                    </button>
                </form>
            </div>
        </div>
    )
}
