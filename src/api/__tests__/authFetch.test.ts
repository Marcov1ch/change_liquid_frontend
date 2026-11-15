import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const loadHttp = () => import('../http')

describe('authFetch', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        localStorage.clear()
        vi.resetModules()
        fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('sends bearer token from localStorage', async () => {
        const { setTokens, authFetch } = await loadHttp()
        setTokens('old-a', 'old-r')
        fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }))

        await authFetch('/api/v1/x')

        expect(fetchMock).toHaveBeenCalledWith('/api/v1/x', expect.objectContaining({
            headers: expect.objectContaining({ Authorization: 'Bearer old-a' }),
        }))
    })

    it('refreshes token on 401 and retries with new token', async () => {
        const { setTokens, authFetch, getAccessToken } = await loadHttp()
        setTokens('old-a', 'old-r')
        fetchMock
            .mockResolvedValueOnce(new Response('{}', { status: 401 }))
            .mockResolvedValueOnce(new Response(
                JSON.stringify({ access_token: 'new-a', refresh_token: 'new-r' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } },
            ))
            .mockResolvedValueOnce(new Response('{}', { status: 200 }))

        await authFetch('/api/v1/x')

        expect(fetchMock).toHaveBeenCalledTimes(3)
        expect(fetchMock).toHaveBeenNthCalledWith(2, '/auth/refresh', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ refresh_token: 'old-r' }),
        }))
        expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/v1/x', expect.objectContaining({
            headers: expect.objectContaining({ Authorization: 'Bearer new-a' }),
        }))
        expect(getAccessToken()).toBe('new-a')
    })

    it('clears tokens and emits auth:logout when refresh fails', async () => {
        const { setTokens, authFetch, getAccessToken, getRefreshToken } = await loadHttp()
        setTokens('old-a', 'old-r')
        const onLogout = vi.fn()
        window.addEventListener('auth:logout', onLogout)
        fetchMock
            .mockResolvedValueOnce(new Response('{}', { status: 401 }))
            .mockResolvedValueOnce(new Response('{}', { status: 401 }))

        await authFetch('/api/v1/x')

        expect(onLogout).toHaveBeenCalledTimes(1)
        expect(getAccessToken()).toBeNull()
        expect(getRefreshToken()).toBeNull()
        window.removeEventListener('auth:logout', onLogout)
    })
})
