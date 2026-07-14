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
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-slide-up">
          <div className="md3-elevated px-8 py-10">
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h1 className="text-headline-sm text-surface-on mb-2">Проверьте почту</h1>
            <p className="text-body-md text-outline mb-6">
              Если такой email зарегистрирован, мы отправили на него ссылку для восстановления пароля.
            </p>
            <Link to="/login" className="text-primary hover:underline underline-offset-2 text-label-lg">Вернуться ко входу</Link>
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
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><circle cx="12" cy="16" r="0.5" fill="#1A6DFF" />
              </svg>
            </div>
            <h1 className="text-headline-sm text-surface-on m-0">Восстановление пароля</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="fp-username" className="block text-label-lg text-surface-on mb-1">Имя пользователя</label>
              <input
                id="fp-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="md3-field"
              />
            </div>
            <div>
              <label htmlFor="fp-email" className="block text-label-lg text-surface-on mb-1">Email</label>
              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
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
                  Отправка...
                </span>
              ) : 'Отправить'}
            </button>
          </form>

          <p className="mt-6 text-center text-body-md">
            <Link to="/login" className="text-primary hover:underline underline-offset-2">Вернуться ко входу</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
