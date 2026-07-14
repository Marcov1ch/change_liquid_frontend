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
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="md3-elevated px-8 py-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <h1 className="text-headline-sm text-surface-on m-0">Регистрация</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="reg-username" className="block text-label-lg text-surface-on mb-1">Имя пользователя</label>
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="md3-field"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-label-lg text-surface-on mb-1">Email</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="md3-field"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-label-lg text-surface-on mb-1">Пароль</label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="md3-field"
              />
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-label-lg text-surface-on mb-1">Подтверждение пароля</label>
              <input
                id="reg-confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
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
                  Регистрация...
                </span>
              ) : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="mt-6 text-center text-body-md text-outline">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-primary hover:underline underline-offset-2">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
