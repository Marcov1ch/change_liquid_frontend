import { beforeEach, describe, expect, it } from 'vitest'

import { clearTracking, loadTracking, saveTracking } from '../gpsStorage'
import type { PersistedTracking } from '../gpsTracker'

const TRACKING: PersistedTracking = {
    vehicleId: 7,
    startTimestamp: 1_700_000_000_000,
    distanceKm: 12.5,
    lastPoint: { lat: 55.75, lng: 37.61 },
}

describe('gpsStorage', () => {
    beforeEach(async () => {
        localStorage.clear()
        sessionStorage.clear()
        await clearTracking()
    })

    it('saves and loads tracking', async () => {
        await saveTracking(TRACKING)

        expect(await loadTracking()).toEqual(TRACKING)
    })

    it('clears tracking', async () => {
        await saveTracking(TRACKING)
        await clearTracking()

        expect(await loadTracking()).toBeNull()
    })

    it('migrates legacy session storage', async () => {
        sessionStorage.setItem('gps_tracking', JSON.stringify(TRACKING))

        expect(await loadTracking()).toEqual(TRACKING)
        expect(sessionStorage.getItem('gps_tracking')).toBeNull()
    })

    it('ignores invalid stored data', async () => {
        sessionStorage.setItem('gps_tracking', 'not-json')

        expect(await loadTracking()).toBeNull()
    })
})
