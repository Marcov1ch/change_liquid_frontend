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

    const displayKm = Math.floor(tracking.distanceKm * 10) / 10;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-primary text-primary-on rounded-2xl shadow-xl px-8 py-6 min-w-[300px] flex flex-col items-center gap-5">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-label-lg font-medium">Поездка</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <span className="text-title-lg font-mono tabular-nums">
                        {formatTime(tracking.elapsed)}
                    </span>
                    <span className="text-title-md font-mono tabular-nums">
                        {displayKm < 0.1
                            ? '0 м'
                            : `${displayKm.toFixed(1)} км`
                        }
                    </span>
                </div>

                <button
                    onClick={onStop}
                    className="md3-btn bg-white text-primary !py-2 !px-8"
                >
                    Стоп
                </button>
            </div>
        </div>
    );
}
