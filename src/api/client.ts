const API_BASE = '/api/v1'
const AUTH_BASE = '/auth'

const TOKEN_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

function getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY)
}

function setTokens(access: string, refresh: string): void {
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
}

function clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false

    if (isRefreshing && refreshPromise) {
        return refreshPromise
    }

    isRefreshing = true
    refreshPromise = (async () => {
        try {
            const res = await fetch(`${AUTH_BASE}/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            })
            if (!res.ok) {
                clearTokens()
                return false
            }
            const data = await res.json()
            setTokens(data.access_token, data.refresh_token)
            return true
        } catch {
            clearTokens()
            return false
        } finally {
            isRefreshing = false
            refreshPromise = null
        }
    })()

    return refreshPromise
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getAccessToken()
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    let res = await fetch(url, { ...options, headers })

    if (res.status === 401 && token) {
        const refreshed = await tryRefresh()
        if (refreshed) {
            const newToken = getAccessToken()
            headers['Authorization'] = `Bearer ${newToken}`
            res = await fetch(url, { ...options, headers })
        } else {
            window.dispatchEvent(new CustomEvent('auth:logout'))
        }
    }

    return res
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `Request failed with status ${res.status}`)
    }
    return res.json()
}

import type { Vehicle, Replacement, VehicleFormData, ComponentConfig } from '../types';

export const api = {
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
        }).then(res => handleResponse<{ id: number; username: string; email: string; is_active: boolean; created_at: string }>(res)),

    getMe: () =>
        authFetch(`${AUTH_BASE}/me`).then(res => handleResponse<{ id: number; username: string; email: string; is_active: boolean; created_at: string }>(res)),

    getAllVehicles: () =>
        authFetch(`${API_BASE}/vehicles?include_archived=true`).then(res => handleResponse<Vehicle[]>(res)),

    getVehicles: () =>
        authFetch(`${API_BASE}/vehicles`).then(res => handleResponse<Vehicle[]>(res)),

    getVehicle: (id: number) =>
        authFetch(`${API_BASE}/vehicles/${id}`).then(res => handleResponse<Vehicle>(res)),

    createVehicle: (data: VehicleFormData) =>
        authFetch(`${API_BASE}/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<Vehicle>(res)),

    updateVehicle: (vehicleId: number, data: Partial<VehicleFormData>) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<Vehicle>(res)),

    updateVehicleKm: (vehicleId: number, newKm: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/km`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_km: newKm }),
        }).then(res => handleResponse<Vehicle>(res)),

    deleteVehicle: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}`, { method: 'DELETE' }).then(res => handleResponse<{ detail: string }>(res)),

    hardDeleteVehicle: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/hard`, { method: 'DELETE' }).then(res => handleResponse<{ detail: string }>(res)),

    restoreVehicle: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/restore`, { method: 'PATCH' }).then(res => handleResponse<Vehicle>(res)),

    updateNotify: (vehicleId: number, data: Partial<Record<string, boolean>>) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/notify`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notify_flags: data }),
        }).then(res => handleResponse<Vehicle>(res)),

    getReplacements: (vehicleId: number) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/replacements`).then(res => handleResponse<Replacement[]>(res)),

    createReplacement: (vehicleId: number, data: Record<string, string | number | null>) =>
        authFetch(`${API_BASE}/vehicles/${vehicleId}/replacements/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ replacements: [data] }),
        }).then(res => handleResponse<Replacement>(res)),

    updateReplacement: (replacementId: number, data: Record<string, string | number | undefined>) =>
        authFetch(`${API_BASE}/replacements/${replacementId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => handleResponse<Replacement>(res)),

    deleteReplacement: (replacementId: number) =>
        authFetch(`${API_BASE}/replacements/${replacementId}`, { method: 'DELETE' }).then(res => handleResponse<{ detail: string }>(res)),

    getBrands: () =>
        authFetch(`${API_BASE}/enums/brands`).then(res => handleResponse<{ brands: { value: string; label: string }[] }>(res)),

    getModels: (brand: string) =>
        authFetch(`${API_BASE}/enums/models/${brand}`).then(res => handleResponse<{ models: { value: string; label: string }[] }>(res)),

    getComponents: () =>
        authFetch(`${API_BASE}/enums/components`).then(res => handleResponse<{ components: { value: string; label: string }[] }>(res)),

    getComponentConfigs: () =>
        authFetch(`${API_BASE}/enums/component-configs`).then(res => handleResponse<{ configs: ComponentConfig[] }>(res)),

    updateEmail: (email: string) =>
        authFetch(`${AUTH_BASE}/email`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        }).then(res => handleResponse<{ detail: string }>(res)),

    changePassword: (old_password: string, new_password: string) =>
        authFetch(`${AUTH_BASE}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ old_password, new_password }),
        }).then(res => handleResponse<{ detail: string }>(res)),

    deleteAccount: () =>
        authFetch(`${AUTH_BASE}/me`, { method: 'DELETE' })
            .then(res => handleResponse<{ detail: string }>(res)),

    forgotPassword: (email: string) =>
        fetch(`${AUTH_BASE}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        }).then(res => handleResponse<{ detail: string }>(res)),

    resetPassword: (token: string, new_password: string) =>
        fetch(`${AUTH_BASE}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, new_password }),
        }).then(res => handleResponse<{ detail: string }>(res)),
}

export { getAccessToken, getRefreshToken, setTokens, clearTokens }
