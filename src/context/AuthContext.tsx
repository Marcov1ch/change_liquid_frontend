/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { api, setTokens, clearTokens, getRefreshToken } from '../api/client'
import type { User } from '../types'

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (username: string, password: string) => Promise<void>
    register: (username: string, email: string, password: string) => Promise<void>
    logout: () => void
    updateEmail: (email: string) => Promise<void>
    changePassword: (old_password: string, new_password: string) => Promise<void>
    deleteAccount: () => Promise<void>
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children, queryClient }: { children: ReactNode; queryClient: QueryClient }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const logout = useCallback(() => {
        clearTokens()
        setUser(null)
        queryClient.clear()
    }, [queryClient])

    useEffect(() => {
        const handleForceLogout = () => logout()
        window.addEventListener('auth:logout', handleForceLogout)
        return () => window.removeEventListener('auth:logout', handleForceLogout)
    }, [logout])

    useEffect(() => {
        const init = async () => {
            const refreshToken = getRefreshToken()
            if (!refreshToken) {
                setLoading(false)
                return
            }
            try {
                const me = await api.getMe()
                setUser(me)
            } catch {
                logout()
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [logout])

    const login = async (username: string, password: string) => {
        const res = await api.login(username, password)
        setTokens(res.access_token, res.refresh_token)
        const me = await api.getMe()
        setUser(me)
    }

    const register = async (username: string, email: string, password: string) => {
        await api.register(username, email, password)
        await login(username, password)
    }

    const updateEmail = async (email: string) => {
        await api.updateEmail(email)
        const me = await api.getMe()
        setUser(me)
    }

    const changePassword = async (old_password: string, new_password: string) => {
        await api.changePassword(old_password, new_password)
    }

    const deleteAccount = async () => {
        await api.deleteAccount()
        clearTokens()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateEmail, changePassword, deleteAccount, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
