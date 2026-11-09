import type { User } from '../types'
import { AUTH_BASE, authFetch, handleResponse, type DetailResponse } from './http'

export const authApi = {
    login: (username: string, password: string) =>
        fetch(`${AUTH_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username, password }),
        }).then(res => handleResponse<{ access_token: string; refresh_token: string; token_type: string }>(res)),

    register: (username: string, email: string, password: string) =>
        fetch(`${AUTH_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        }).then(res => handleResponse<User>(res)),

    getMe: () =>
        authFetch(`${AUTH_BASE}/me`).then(res => handleResponse<User>(res)),

    updateEmail: (email: string) =>
        authFetch(`${AUTH_BASE}/email`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        }).then(res => handleResponse<User>(res)),

    verifyEmail: (token: string) =>
        fetch(`${AUTH_BASE}/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        }).then(res => handleResponse<DetailResponse>(res)),

    resendVerification: () =>
        authFetch(`${AUTH_BASE}/resend-verification`, {
            method: 'POST',
        }).then(res => handleResponse<DetailResponse>(res)),

    changePassword: (old_password: string, new_password: string) =>
        authFetch(`${AUTH_BASE}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ old_password, new_password }),
        }).then(res => handleResponse<DetailResponse>(res)),

    deleteAccount: () =>
        authFetch(`${AUTH_BASE}/me`, { method: 'DELETE' })
            .then(res => handleResponse<DetailResponse>(res)),

    forgotPassword: (username: string, email: string) =>
        fetch(`${AUTH_BASE}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email }),
        }).then(res => handleResponse<DetailResponse>(res)),

    resetPassword: (token: string, newPassword: string) =>
        fetch(`${AUTH_BASE}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, new_password: newPassword }),
        }).then(res => handleResponse<DetailResponse>(res)),
}
