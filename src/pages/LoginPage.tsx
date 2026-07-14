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
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="md3-elevated px-8 py-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h1 className="text-headline-sm text-surface-on m-0">Вход</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="username" className="block text-label-lg text-surface-on mb-1">Имя пользователя</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="md3-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-label-lg text-surface-on mb-1">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
                  Вход...
                </span>
              ) : 'Войти'}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-body-md">
            <Link to="/forgot-password" className="text-primary hover:underline underline-offset-2">Забыли пароль?</Link>
            <span className="text-outline">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-primary hover:underline underline-offset-2">Зарегистрироваться</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
