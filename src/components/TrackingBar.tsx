import type { TrackingState } from '../hooks/useGpsTracker';

interface Props {
    tracking: TrackingState;
    onStop: () => void;
}

function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

export function TrackingBar({ tracking, onStop }: Props) {
    if (!tracking.isTracking) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-on shadow-md3-3 animate-slide-up">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-label-lg font-medium">Поездка</span>
                    </div>
                    <div className="text-title-lg font-mono tabular-nums">
                        {formatTime(tracking.elapsed)}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-title-lg font-mono tabular-nums">
                        {tracking.distanceKm < 1
                            ? `${Math.round(tracking.distanceKm * 1000)} м`
                            : `${tracking.distanceKm.toFixed(2)} км`
                        }
                    </span>
                    <button
                        onClick={onStop}
                        className="md3-btn bg-white text-primary !py-2 !px-5"
                    >
                        Стоп
                    </button>
                </div>
            </div>
        </div>
    );
}
