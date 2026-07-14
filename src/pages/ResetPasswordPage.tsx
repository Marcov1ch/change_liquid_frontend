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
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-slide-up">
          <div className="md3-elevated px-8 py-10">
            <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BA1A1A" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h1 className="text-headline-sm text-surface-on mb-2">Недействительная ссылка</h1>
            <p className="text-body-md text-outline mb-6">Отсутствует токен восстановления. Перейдите по ссылке из письма.</p>
            <Link to="/forgot-password" className="text-primary hover:underline underline-offset-2 text-label-lg">Запросить новое письмо</Link>
          </div>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-slide-up">
          <div className="md3-elevated px-8 py-10">
            <div className="w-14 h-14 rounded-full bg-[#E6F7E6] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B5E1B" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-headline-sm text-surface-on mb-2">Пароль изменён</h1>
            <p className="text-body-md text-outline mb-6">Теперь вы можете войти с новым паролем.</p>
            <Link to="/login" className="text-primary hover:underline underline-offset-2 text-label-lg">Войти</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="md3-elevated px-8 py-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-headline-sm text-surface-on m-0">Новый пароль</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="rp-password" className="block text-label-lg text-surface-on mb-1">Новый пароль</label>
              <input
                id="rp-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="md3-field"
              />
            </div>
            <div>
              <label htmlFor="rp-confirm" className="block text-label-lg text-surface-on mb-1">Подтвердите пароль</label>
              <input
                id="rp-confirm"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="md3-field"
              />
            </div>

            {error && (
              <div className="p-3 rounded-md3-sm bg-error-container text-error text-body-sm" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="md3-btn-primary w-full mt-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Сохранение...
                </span>
              ) : 'Сохранить пароль'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
