import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProfilePage() {
    const { user, updateEmail, changePassword, deleteAccount } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState(user?.email || '')
    const [emailError, setEmailError] = useState('')
    const [emailSubmitting, setEmailSubmitting] = useState(false)

    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordSubmitting, setPasswordSubmitting] = useState(false)

    const handleEmailSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setEmailError('')
        setEmailSubmitting(true)
        try {
            await updateEmail(email)
            alert('Email обновлён')
        } catch (err: unknown) {
            setEmailError(err instanceof Error ? err.message : 'Не удалось обновить email')
        } finally {
            setEmailSubmitting(false)
        }
    }

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setPasswordError('')

        if (newPassword !== confirmPassword) {
            setPasswordError('Пароли не совпадают')
            return
        }

        setPasswordSubmitting(true)
        try {
            await changePassword(oldPassword, newPassword)
            alert('Пароль изменён')
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: unknown) {
            setPasswordError(err instanceof Error ? err.message : 'Не удалось изменить пароль')
        } finally {
            setPasswordSubmitting(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!confirm('Вы уверены? Ваш аккаунт и все данные будут деактивированы.')) return
        try {
            await deleteAccount()
            navigate('/login', { replace: true })
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Не удалось удалить аккаунт')
        }
    }

    const inputClass = "w-full px-3 py-2.5 text-body-large rounded-md-sm border border-md-outline bg-md-surface text-md-on-surface transition-all duration-md-2 focus:outline-none focus:ring-2 focus:ring-md-primary focus:border-md-primary";

    return (
        <div className="max-w-lg mx-auto space-y-8">
            <h1 className="text-headline-medium">Профиль</h1>

            <section className="md-card space-y-4">
                <h2 className="text-title-medium">Email</h2>
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div>
                        <label className="block text-label-large mb-1 text-md-on-surface">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>
                    {emailError && <p className="text-md-error text-body-medium">{emailError}</p>}
                    <button
                        type="submit"
                        disabled={emailSubmitting}
                        className="w-full py-2.5 px-4 rounded-md-full text-label-large
                                   bg-md-primary text-md-on-primary
                                   transition-all duration-md-2 hover:shadow-md-1
                                   active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2"
                    >
                        {emailSubmitting && (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white
                                             rounded-md-full animate-spin" />
                        )}
                        {emailSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </form>
            </section>

            <section className="md-card space-y-4">
                <h2 className="text-title-medium">Сменить пароль</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                    <div>
                        <label className="block text-label-large mb-1 text-md-on-surface">Текущий пароль</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-label-large mb-1 text-md-on-surface">Новый пароль</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-label-large mb-1 text-md-on-surface">Подтвердите пароль</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>
                    {passwordError && <p className="text-md-error text-body-medium">{passwordError}</p>}
                    <button
                        type="submit"
                        disabled={passwordSubmitting}
                        className="w-full py-2.5 px-4 rounded-md-full text-label-large
                                   bg-md-primary text-md-on-primary
                                   transition-all duration-md-2 hover:shadow-md-1
                                   active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2"
                    >
                        {passwordSubmitting && (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white
                                             rounded-md-full animate-spin" />
                        )}
                        {passwordSubmitting ? 'Смена...' : 'Сменить пароль'}
                    </button>
                </form>
            </section>

            <section className="md-card space-y-4">
                <h2 className="text-title-medium">Удалить аккаунт</h2>
                <button
                    onClick={handleDeleteAccount}
                    className="w-full py-2.5 px-4 rounded-md-full text-label-large
                               bg-md-error text-md-on-error
                               transition-all duration-md-2 hover:shadow-md-1
                               active:scale-[0.98]"
                >
                    Удалить аккаунт
                </button>
            </section>
        </div>
    )
}
