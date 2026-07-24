import { useState, useRef, useCallback, useEffect } from 'react';

const EARTH_RADIUS_KM = 6371;
const MIN_ACCURACY_M = 100;
const STORAGE_KEY = 'gps_tracking';

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface GpsPoint {
    lat: number;
    lng: number;
}

interface PersistedTracking {
    vehicleId: number;
    startTimestamp: number;
    distanceKm: number;
    lastPoint: GpsPoint | null;
}

export interface TrackingState {
    isTracking: boolean;
    vehicleId: number | null;
    elapsed: number;
    distanceKm: number;
}

function saveTracking(data: PersistedTracking) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadTracking(): PersistedTracking | null {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function clearTracking() {
    sessionStorage.removeItem(STORAGE_KEY);
}

function gpsErrorMessage(code: number): string {
    switch (code) {
        case 1: return 'Геолокация отключена. Включите её в настройках браузера';
        case 2: return 'GPS-сигнал недоступен';
        case 3: return 'Время ожидания GPS истекло. Попробуйте снова';
        default: return 'Ошибка геолокации';
    }
}

export function useGpsTracker(onError?: (message: string) => void) {
    const [state, setState] = useState<TrackingState>(() => {
        const saved = loadTracking();
        if (saved) {
            return {
                isTracking: true,
                vehicleId: saved.vehicleId,
                elapsed: Math.floor((Date.now() - saved.startTimestamp) / 1000),
                distanceKm: saved.distanceKm,
            };
        }
        return { isTracking: false, vehicleId: null, elapsed: 0, distanceKm: 0 };
    });

    const watchIdRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startRef = useRef<number>(0);
    const lastPointRef = useRef<GpsPoint | null>(null);
    const distanceRef = useRef(0);
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    });

    const clearTimers = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        lastPointRef.current = null;
    }, []);

    const resetState = useCallback(() => {
        clearTimers();
        clearTracking();
        setState({ isTracking: false, vehicleId: null, elapsed: 0, distanceKm: 0 });
        distanceRef.current = 0;
    }, [clearTimers]);

    const stopTracking = useCallback((): TrackingState | null => {
        clearTimers();
        clearTracking();
        const final = { ...stateRef.current };
        setState(prev => ({ ...prev, isTracking: false }));
        distanceRef.current = 0;
        return final.isTracking ? final : null;
    }, [clearTimers]);

    const persistPoint = useCallback((point: GpsPoint) => {
        saveTracking({
            vehicleId: stateRef.current.vehicleId!,
            startTimestamp: startRef.current,
            distanceKm: distanceRef.current,
            lastPoint: point,
        });
    }, []);

    const handleError = useCallback((error: GeolocationPositionError) => {
        const message = gpsErrorMessage(error.code);
        resetState();
        onError?.(message);
    }, [resetState, onError]);

    const requestPosition = useCallback((): Promise<void> => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                () => resolve(),
                (error) => reject(error),
                { enableHighAccuracy: true, timeout: 15000 }
            );
        });
    }, []);

    const setupWatch = useCallback((initialPoint?: GpsPoint | null) => {
        if (!navigator.geolocation) {
            throw new Error('Геолокация не поддерживается вашим браузером');
        }

        if (initialPoint) {
            lastPointRef.current = initialPoint;
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const point: GpsPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                if (pos.coords.accuracy > MIN_ACCURACY_M) return;

                if (lastPointRef.current) {
                    const delta = haversine(
                        lastPointRef.current.lat, lastPointRef.current.lng,
                        point.lat, point.lng
                    );
                    if (delta < 5) {
                        distanceRef.current += delta;
                        setState(prev => ({ ...prev, distanceKm: distanceRef.current }));
                    }
                }
                lastPointRef.current = point;
                persistPoint(point);
            },
            handleError,
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );
    }, [persistPoint, handleError]);

    const startTracking = useCallback(async (vehicleId: number) => {
        if (stateRef.current.isTracking) {
            stopTracking();
        }

        if (!navigator.geolocation) {
            throw new Error('Геолокация не поддерживается вашим браузером');
        }

        await requestPosition();

        distanceRef.current = 0;
        startRef.current = Date.now();

        saveTracking({ vehicleId, startTimestamp: startRef.current, distanceKm: 0, lastPoint: null });
        setState({ isTracking: true, vehicleId, elapsed: 0, distanceKm: 0 });

        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
            setState(prev => ({ ...prev, elapsed }));
        }, 1000);

        setupWatch();
    }, [stopTracking, setupWatch, requestPosition]);

    // Восстанавливаем трекинг из sessionStorage при загрузке страницы (один раз)
    useEffect(() => {
        const saved = loadTracking();
        if (saved && state.isTracking && watchIdRef.current === null) {
            startRef.current = saved.startTimestamp;
            distanceRef.current = saved.distanceKm;

            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
                setState(prev => ({ ...prev, elapsed }));
            }, 1000);

            setupWatch(saved.lastPoint);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => clearTimers();
    }, [clearTimers]);

    return {
        ...state,
        startTracking,
        stopTracking,
    };
}
