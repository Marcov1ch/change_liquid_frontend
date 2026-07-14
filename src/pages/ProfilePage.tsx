import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProfilePage() {
  const { user, updateEmail, changePassword, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState(user?.email || '')
  const [emailError, setEmailError] = useState('')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setEmailSuccess(false)
    setEmailSubmitting(true)
    try {
      await updateEmail(email)
      setEmailSuccess(true)
    } catch (err: unknown) {
      setEmailError(err instanceof Error ? err.message : 'Failed to update email')
    } finally {
      setEmailSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordSubmitting(true)
    try {
      await changePassword(oldPassword, newPassword)
      setPasswordSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? Your account and all data will be deactivated.')) return
    try {
      await deleteAccount()
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete account')
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant shadow-md3-1">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-md3-full text-surface-on-variant hover:bg-surface-variant transition-colors"
            aria-label="Назад"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 className="text-title-md text-surface-on m-0">Профиль</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* User info */}
          <div className="md3-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-headline-md text-primary shrink-0">
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-title-md text-surface-on">{user?.username}</p>
                <p className="text-body-md text-outline">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="md3-card p-6">
            <h2 className="text-title-md text-surface-on mb-4">Email</h2>
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="md3-field"
              />
              {emailError && <p className="text-body-sm text-error" role="alert">{emailError}</p>}
              {emailSuccess && <p className="text-body-sm text-[#1B5E1B]" role="status">Email updated</p>}
              <button
                type="submit"
                disabled={emailSubmitting}
                className="md3-btn-primary self-start"
              >
                {emailSubmitting ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>

          {/* Password */}
          <div className="md3-card p-6">
            <h2 className="text-title-md text-surface-on mb-4">Change password</h2>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="old-password" className="block text-label-lg text-surface-on mb-1">Current password</label>
                <input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                  className="md3-field"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-label-lg text-surface-on mb-1">New password</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="md3-field"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-label-lg text-surface-on mb-1">Confirm new password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="md3-field"
                />
              </div>
              {passwordError && <p className="text-body-sm text-error" role="alert">{passwordError}</p>}
              {passwordSuccess && <p className="text-body-sm text-[#1B5E1B]" role="status">Password changed</p>}
              <button
                type="submit"
                disabled={passwordSubmitting}
                className="md3-btn-primary self-start"
              >
                {passwordSubmitting ? 'Changing...' : 'Change password'}
              </button>
            </form>
          </div>

          {/* Delete account */}
          <div className="md3-card p-6 border-l-4 border-l-error">
            <h2 className="text-title-md text-error mb-2">Delete account</h2>
            <p className="text-body-md text-outline mb-4">This action cannot be undone.</p>
            <button
              onClick={handleDeleteAccount}
              className="md3-btn-danger"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete account
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
