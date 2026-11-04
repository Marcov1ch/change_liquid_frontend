import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'

type Status = 'loading' | 'success' | 'error'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error')
  const [message, setMessage] = useState(token ? '' : 'Отсутствует токен подтверждения.')
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true

    api.verifyEmail(token)
      .then(() => {
        setStatus('success')
        setMessage('Email успешно подтверждён.')
      })
      .catch((err: unknown) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Не удалось подтвердить email.')
      })
  }, [token])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-slide-up">
          <div className="md3-elevated px-8 py-10">
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
              <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-headline-sm text-surface-on mb-2">Подтверждаем email</h1>
            <p className="text-body-md text-outline m-0">Пожалуйста, подождите.</p>
          </div>
        </div>
      </div>
    )
  }

  const isSuccess = status === 'success'

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center animate-slide-up">
        <div className="md3-elevated px-8 py-10">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isSuccess ? 'bg-[#E6F7E6]' : 'bg-error-container'
          }`}>
            {isSuccess ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B5E1B" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BA1A1A" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
          </div>
          <h1 className="text-headline-sm text-surface-on mb-2">
            {isSuccess ? 'Email подтверждён' : 'Не удалось подтвердить email'}
          </h1>
          <p className="text-body-md text-outline mb-6">{message}</p>
          {isSuccess ? (
            <Link to="/" className="text-primary hover:underline underline-offset-2 text-label-lg">
              Перейти в приложение
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/profile" className="text-primary hover:underline underline-offset-2 text-label-lg">
                Открыть профиль
              </Link>
              <Link to="/login" className="text-outline hover:underline underline-offset-2 text-label-md">
                Войти в аккаунт
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
