import { extractErrorMessage } from '../utils/apiError'

export const API_BASE = '/api/v1'
export const AUTH_BASE = '/auth'

const TOKEN_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export function getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(access: string, refresh: string): void {
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens(): void {
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

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
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

export class ApiError extends Error {
    status: number
    retryAfter: number | null

    constructor(message: string, status: number, retryAfter: number | null) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.retryAfter = retryAfter
    }
}

function parseRetryAfter(value: string | null): number | null {
    if (!value) return null
    const seconds = Number(value)
    return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null
}

export async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new ApiError(
            extractErrorMessage(body.detail, res.status),
            res.status,
            parseRetryAfter(res.headers.get('Retry-After')),
        )
    }
    return res.json()
}

export interface ActionResponse {
    status: string
    message: string
}

export interface DetailResponse {
    detail: string
}
