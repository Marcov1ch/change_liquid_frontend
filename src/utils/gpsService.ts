import { Capacitor } from '@capacitor/core'
import { Geolocation, type Position } from '@capacitor/geolocation'

import { gpsErrorMessage, type GpsPoint } from './gpsTracker'

export interface GpsPosition {
    point: GpsPoint
    accuracy: number
}

export interface GpsWatcher {
    clear: () => Promise<void>
}

const isNative = Capacitor.isNativePlatform()

function toPosition(position: Position): GpsPosition {
    return {
        point: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        },
        accuracy: position.coords.accuracy,
    }
}

export function gpsServiceErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = Number((error as { code: unknown }).code)
        if (Number.isFinite(code)) return gpsErrorMessage(code)
    }

    const message = error instanceof Error ? error.message : String(error ?? '')
    const normalized = message.toLowerCase()

    if (normalized.includes('denied') || normalized.includes('permission')) {
        return 'Разрешите доступ к геолокации в настройках телефона'
    }
    if (normalized.includes('disabled') || normalized.includes('location services')) {
        return 'Геолокация отключена. Включите её в настройках телефона'
    }
    return message || 'Ошибка геолокации'
}

export async function requestGpsPermission(): Promise<void> {
    if (!isNative) return

    try {
        const status = await Geolocation.requestPermissions()
        if (status.location !== 'granted' && status.coarseLocation !== 'granted') {
            throw new Error('Разрешите доступ к геолокации в настройках телефона')
        }
    } catch (error) {
        throw new Error(gpsServiceErrorMessage(error), { cause: error })
    }
}

export async function getCurrentGpsPosition(): Promise<GpsPosition> {
    if (isNative) {
        try {
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 15000,
            })
            return toPosition(position)
        } catch (error) {
            throw new Error(gpsServiceErrorMessage(error), { cause: error })
        }
    }

    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Геолокация не поддерживается вашим браузером'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            position => resolve({
                point: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                },
                accuracy: position.coords.accuracy,
            }),
            error => reject(new Error(gpsErrorMessage(error.code))),
            { enableHighAccuracy: true, timeout: 15000 },
        )
    })
}

export async function watchGpsPosition(
    onPosition: (position: GpsPosition) => void,
    onError: (message: string) => void,
): Promise<GpsWatcher> {
    if (isNative) {
        const id = await Geolocation.watchPosition(
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000,
                interval: 5000,
                minimumUpdateInterval: 5000,
            },
            (position, error) => {
                if (error || !position) {
                    onError(gpsServiceErrorMessage(error))
                    return
                }
                onPosition(toPosition(position))
            },
        )

        return {
            clear: () => Geolocation.clearWatch({ id }),
        }
    }

    if (!navigator.geolocation) {
        throw new Error('Геолокация не поддерживается вашим браузером')
    }

    const id = navigator.geolocation.watchPosition(
        position => onPosition({
            point: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            },
            accuracy: position.coords.accuracy,
        }),
        error => onError(gpsErrorMessage(error.code)),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )

    return {
        clear: async () => navigator.geolocation.clearWatch(id),
    }
}
