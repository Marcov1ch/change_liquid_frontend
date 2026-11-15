import { Preferences } from '@capacitor/preferences'

import type { PersistedTracking } from './gpsTracker'

const STORAGE_KEY = 'gps_tracking'

function parseTracking(raw: string | null): PersistedTracking | null {
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw) as PersistedTracking
        if (
            typeof parsed.vehicleId !== 'number'
            || typeof parsed.startTimestamp !== 'number'
            || typeof parsed.distanceKm !== 'number'
        ) {
            return null
        }
        return parsed
    } catch {
        return null
    }
}

export async function saveTracking(data: PersistedTracking): Promise<void> {
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(data) })
}

export async function loadTracking(): Promise<PersistedTracking | null> {
    try {
        const { value } = await Preferences.get({ key: STORAGE_KEY })
        const parsed = parseTracking(value)
        if (parsed) return parsed
    } catch {
        // fall through to legacy storage
    }

    try {
        const legacy = parseTracking(sessionStorage.getItem(STORAGE_KEY))
        if (legacy) {
            await saveTracking(legacy)
            sessionStorage.removeItem(STORAGE_KEY)
            return legacy
        }
    } catch {
        // ignore storage access errors
    }

    return null
}

export async function clearTracking(): Promise<void> {
    try {
        await Preferences.remove({ key: STORAGE_KEY })
    } catch {
        // ignore storage access errors
    }
    try {
        sessionStorage.removeItem(STORAGE_KEY)
    } catch {
        // ignore storage access errors
    }
}
