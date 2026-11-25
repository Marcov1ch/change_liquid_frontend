import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { replacementsApi } from '../replacements'

describe('replacementsApi.createReplacement', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        localStorage.clear()
        fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('sends the input currency at the bulk request level', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }),
        )

        await replacementsApi.createReplacement(
            1,
            { component_type: 'engine_oil' },
            'EUR',
        )

        const body = JSON.parse(fetchMock.mock.calls[0][1].body)
        expect(body).toEqual({
            replacements: [{ component_type: 'engine_oil' }],
            currency: 'EUR',
        })
    })

    it('omits the input currency when it is not provided', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }),
        )

        await replacementsApi.createReplacement(1, { component_type: 'engine_oil' })

        const body = JSON.parse(fetchMock.mock.calls[0][1].body)
        expect(body).toEqual({
            replacements: [{ component_type: 'engine_oil' }],
        })
    })
})
