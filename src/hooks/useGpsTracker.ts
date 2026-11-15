import { useState, useRef, useCallback, useEffect } from 'react';

import { MIN_ACCURACY_M, haversine, type GpsPoint } from '../utils/gpsTracker';
import { clearTracking, loadTracking, saveTracking } from '../utils/gpsStorage';
import {
    getCurrentGpsPosition,
    requestGpsPermission,
    watchGpsPosition,
    type GpsWatcher,
} from '../utils/gpsService';

export interface TrackingState {
    isTracking: boolean;
    vehicleId: number | null;
    elapsed: number;
    distanceKm: number;
}

const EMPTY_STATE: TrackingState = {
    isTracking: false,
    vehicleId: null,
    elapsed: 0,
    distanceKm: 0,
};

export function useGpsTracker(onError?: (message: string) => void) {
    const [state, setState] = useState<TrackingState>(EMPTY_STATE);

    const watchRef = useRef<GpsWatcher | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startRef = useRef<number>(0);
    const lastPointRef = useRef<GpsPoint | null>(null);
    const distanceRef = useRef(0);
    const stateRef = useRef(state);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        stateRef.current = state;
    });

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    const clearTimers = useCallback(async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (watchRef.current) {
            const watcher = watchRef.current;
            watchRef.current = null;
            try {
                await watcher.clear();
            } catch {
                // ignore watcher cleanup errors
            }
        }
        lastPointRef.current = null;
    }, []);

    const resetState = useCallback(async () => {
        await clearTimers();
        await clearTracking();
        stateRef.current = EMPTY_STATE;
        setState(EMPTY_STATE);
        distanceRef.current = 0;
    }, [clearTimers]);

    const stopTracking = useCallback(async (): Promise<TrackingState | null> => {
        await clearTimers();
        await clearTracking();
        const final = { ...stateRef.current };
        stateRef.current = EMPTY_STATE;
        setState(EMPTY_STATE);
        distanceRef.current = 0;
        return final.isTracking ? final : null;
    }, [clearTimers]);

    const persistPoint = useCallback((point: GpsPoint) => {
        const vehicleId = stateRef.current.vehicleId;
        if (vehicleId === null) return;
        void saveTracking({
            vehicleId,
            startTimestamp: startRef.current,
            distanceKm: distanceRef.current,
            lastPoint: point,
        }).catch(() => undefined);
    }, []);

    const handleError = useCallback((message: string) => {
        void resetState();
        onErrorRef.current?.(message);
    }, [resetState]);

    const setupWatch = useCallback(async (initialPoint?: GpsPoint | null) => {
        if (initialPoint) {
            lastPointRef.current = initialPoint;
        }

        try {
            watchRef.current = await watchGpsPosition(
                position => {
                    if (position.accuracy > MIN_ACCURACY_M) return;

                    const point = position.point;
                    if (lastPointRef.current) {
                        const delta = haversine(
                            lastPointRef.current.lat,
                            lastPointRef.current.lng,
                            point.lat,
                            point.lng,
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
            );
        } catch (error) {
            handleError(error instanceof Error ? error.message : 'Ошибка геолокации');
        }
    }, [persistPoint, handleError]);

    const startTracking = useCallback(async (vehicleId: number) => {
        if (stateRef.current.isTracking) {
            await stopTracking();
        }

        await requestGpsPermission();
        const position = await getCurrentGpsPosition();

        distanceRef.current = 0;
        startRef.current = Date.now();
        lastPointRef.current = position.point;

        const nextState: TrackingState = {
            isTracking: true,
            vehicleId,
            elapsed: 0,
            distanceKm: 0,
        };
        stateRef.current = nextState;
        setState(nextState);

        try {
            await saveTracking({
                vehicleId,
                startTimestamp: startRef.current,
                distanceKm: 0,
                lastPoint: position.point,
            });
        } catch {
            // tracking can continue even if persistence is unavailable
        }

        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
            setState(prev => ({ ...prev, elapsed }));
        }, 1000);

        await setupWatch(position.point);
    }, [setupWatch, stopTracking]);

    // Восстанавливаем поездку из Preferences после запуска приложения.
    useEffect(() => {
        let cancelled = false;

        const restore = async () => {
            const saved = await loadTracking();
            if (cancelled || !saved) return;

            startRef.current = saved.startTimestamp;
            distanceRef.current = saved.distanceKm;

            const restoredState: TrackingState = {
                isTracking: true,
                vehicleId: saved.vehicleId,
                elapsed: Math.floor((Date.now() - saved.startTimestamp) / 1000),
                distanceKm: saved.distanceKm,
            };
            stateRef.current = restoredState;
            setState(restoredState);

            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
                setState(prev => ({ ...prev, elapsed }));
            }, 1000);

            await setupWatch(saved.lastPoint);
        };

        void restore();

        return () => {
            cancelled = true;
            void clearTimers();
        };
    }, [clearTimers, setupWatch]);

    return {
        ...state,
        startTracking,
        stopTracking,
    };
}
