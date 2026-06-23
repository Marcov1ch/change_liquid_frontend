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
            alert('Email updated')
        } catch (err: unknown) {
            setEmailError(err instanceof Error ? err.message : 'Failed to update email')
        } finally {
            setEmailSubmitting(false)
        }
    }

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setPasswordError('')

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }

        setPasswordSubmitting(true)
        try {
            await changePassword(oldPassword, newPassword)
            alert('Password changed')
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

    const inputStyle = { width: '100%', padding: '8px 12px', fontSize: 16, boxSizing: 'border-box' } as const
    const buttonStyle = { width: '100%', padding: '10px', fontSize: 16, cursor: 'pointer', color: 'white', border: 'none', borderRadius: 5 } as const

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 20 }}>
            <h1>Profile</h1>

            <div style={{ marginBottom: 30 }}>
                <h2>Email</h2>
                <form onSubmit={handleEmailSubmit}>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
                    <button
                        type="submit"
                        disabled={emailSubmitting}
                        style={{ ...buttonStyle, backgroundColor: '#007bff' }}
                    >
                        {emailSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </form>
            </div>

            <div style={{ marginBottom: 30 }}>
                <h2>Change password</h2>
                <form onSubmit={handlePasswordSubmit}>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>Current password</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>New password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>Confirm new password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
                    <button
                        type="submit"
                        disabled={passwordSubmitting}
                        style={{ ...buttonStyle, backgroundColor: '#007bff' }}
                    >
                        {passwordSubmitting ? 'Changing...' : 'Change password'}
                    </button>
                </form>
            </div>

            <div>
                <h2>Delete account</h2>
                <button
                    onClick={handleDeleteAccount}
                    style={{ ...buttonStyle, backgroundColor: '#dc3545' }}
                >
                    Delete account
                </button>
            </div>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ ...buttonStyle, backgroundColor: '#6c757d', maxWidth: 200 }}
                >
                    Back to home
                </button>
            </div>
        </div>
    )
}
