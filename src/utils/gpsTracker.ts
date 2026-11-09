const EARTH_RADIUS_KM = 6371
const STORAGE_KEY = 'gps_tracking'

export const MIN_ACCURACY_M = 100

export interface GpsPoint {
    lat: number
    lng: number
}

export interface PersistedTracking {
    vehicleId: number
    startTimestamp: number
    distanceKm: number
    lastPoint: GpsPoint | null
}

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function saveTracking(data: PersistedTracking): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadTracking(): PersistedTracking | null {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        return JSON.parse(raw)
    } catch {
        return null
    }
}

export function clearTracking(): void {
    sessionStorage.removeItem(STORAGE_KEY)
}

export function gpsErrorMessage(code: number): string {
    switch (code) {
        case 1:
            return 'Геолокация отключена. Включите её в настройках браузера'
        case 2:
            return 'GPS-сигнал недоступен'
        case 3:
            return 'Время ожидания GPS истекло. Попробуйте снова'
        default:
            return 'Ошибка геолокации'
    }
}
