import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { ProfileDeleteAccountSection } from '../components/profile/ProfileDeleteAccountSection'
import { ProfileEmailSection } from '../components/profile/ProfileEmailSection'
import { ProfileHeader } from '../components/profile/ProfileHeader'
import { ProfilePasswordSection } from '../components/profile/ProfilePasswordSection'
import { ProfileUserCard } from '../components/profile/ProfileUserCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  buildResendCooldownKey,
  getRemainingSeconds,
  readResendCooldown,
  RESEND_COOLDOWN_SECONDS,
  startResendCooldown,
} from '../utils/resendCooldown'

export function ProfilePage() {
  const { user, updateEmail, resendVerification, changePassword, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const resendCooldownKey = user ? buildResendCooldownKey(user.id, user.email) : ''
  const [resendAvailableAt, setResendAvailableAt] = useState(
    () => resendCooldownKey ? readResendCooldown(resendCooldownKey) : 0,
  )
  const [clock, setClock] = useState(() => Date.now())
  const resendSecondsLeft = getRemainingSeconds(resendAvailableAt, clock)

  const [email, setEmail] = useState(user?.email || '')
  const [emailError, setEmailError] = useState('')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [resendSubmitting, setResendSubmitting] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    setResendAvailableAt(resendCooldownKey ? readResendCooldown(resendCooldownKey) : 0)
    setClock(Date.now())
  }, [resendCooldownKey])

  useEffect(() => {
    if (resendAvailableAt <= Date.now()) return

    const id = setInterval(() => {
      const current = Date.now()
      setClock(current)
      if (current >= resendAvailableAt) clearInterval(id)
    }, 1000)

    return () => clearInterval(id)
  }, [resendAvailableAt])

  const applyCooldown = (key: string, seconds: number = RESEND_COOLDOWN_SECONDS) => {
    if (!key) return
    setResendAvailableAt(startResendCooldown(key, seconds))
    setClock(Date.now())
  }

  const handleEmailSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setEmailError('')
    setEmailSuccess(false)
    setEmailSubmitting(true)
    try {
      await updateEmail(email)
      setEmailSuccess(true)
      setResendSuccess(false)
      if (user) {
        applyCooldown(buildResendCooldownKey(user.id, email))
      }
      toast.success('Email обновлён. Проверьте почту.')
    } catch (err: unknown) {
      setEmailError(err instanceof Error ? err.message : 'Не удалось обновить email')
    } finally {
      setEmailSubmitting(false)
    }
  }

  const handleResendVerification = async () => {
    setResendSubmitting(true)
    setResendSuccess(false)
    try {
      await resendVerification()
      setResendSuccess(true)
      applyCooldown(resendCooldownKey)
      toast.success('Письмо с подтверждением отправлено')
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 429) {
        applyCooldown(resendCooldownKey, err.retryAfter ?? RESEND_COOLDOWN_SECONDS)
      }
      toast.error(err instanceof Error ? err.message : 'Не удалось отправить письмо')
    } finally {
      setResendSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают')
      return
    }

    setPasswordSubmitting(true)
    try {
      await changePassword(oldPassword, newPassword)
      setPasswordSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Пароль изменён')
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Не удалось изменить пароль')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Удалить аккаунт? Все данные будут удалены безвозвратно.')) return
    try {
      await deleteAccount()
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Не удалось удалить аккаунт')
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <ProfileHeader onBack={() => navigate('/')} />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <ProfileUserCard user={user} />

          <ProfileEmailSection
            user={user}
            email={email}
            emailError={emailError}
            emailSubmitting={emailSubmitting}
            emailSuccess={emailSuccess}
            resendSubmitting={resendSubmitting}
            resendSuccess={resendSuccess}
            resendSecondsLeft={resendSecondsLeft}
            onEmailChange={setEmail}
            onSubmit={handleEmailSubmit}
            onResend={handleResendVerification}
          />

          <ProfilePasswordSection
            oldPassword={oldPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            passwordError={passwordError}
            passwordSubmitting={passwordSubmitting}
            passwordSuccess={passwordSuccess}
            onOldPasswordChange={setOldPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handlePasswordSubmit}
          />

          <ProfileDeleteAccountSection onDelete={handleDeleteAccount} />
        </div>
      </main>
    </div>
  )
}
