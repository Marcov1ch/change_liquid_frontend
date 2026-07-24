import { useState, useRef, useCallback, useEffect } from 'react';

const EARTH_RADIUS_KM = 6371;
const MIN_ACCURACY_M = 100;

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

export interface TrackingState {
    isTracking: boolean;
    vehicleId: number | null;
    elapsed: number;
    distanceKm: number;
}

export function useGpsTracker() {
    const [state, setState] = useState<TrackingState>({
        isTracking: false,
        vehicleId: null,
        elapsed: 0,
        distanceKm: 0,
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

    const stopTracking = useCallback((): TrackingState | null => {
        clearTimers();
        const final = { ...stateRef.current };
        setState(prev => ({ ...prev, isTracking: false }));
        distanceRef.current = 0;
        return final.isTracking ? final : null;
    }, [clearTimers]);

    useEffect(() => {
        return () => clearTimers();
    }, [clearTimers]);

    const startTracking = useCallback((vehicleId: number) => {
        if (stateRef.current.isTracking) {
            stopTracking();
        }

        if (!navigator.geolocation) {
            throw new Error('Геолокация не поддерживается вашим браузером');
        }

        distanceRef.current = 0;
        startRef.current = Date.now();

        setState({ isTracking: true, vehicleId, elapsed: 0, distanceKm: 0 });

        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
            setState(prev => ({ ...prev, elapsed }));
        }, 1000);

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
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );
    }, [stopTracking]);

    return {
        ...state,
        startTracking,
        stopTracking,
    };
}
