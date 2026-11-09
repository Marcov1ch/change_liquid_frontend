import type { Replacement } from '../types';
import { formatTireEventLabel, formatTireMoney } from '../utils/tireSets';

interface Props {
    events: Replacement[];
    protectedEventId?: number | null;
    onDelete: (event: Replacement) => void;
}

export function TireHistoryList({ events, protectedEventId, onDelete }: Props) {
    if (events.length === 0) return null;

    return (
        <div>
            <p className="text-label-lg text-surface-on mb-2">История шин</p>
            <div className="flex flex-col gap-2">
                {events.map(event => (
                    <div
                        key={event.id}
                        className="p-3 rounded-md3-sm bg-surface border border-outline-variant"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <p
                                className="text-label-lg text-surface-on m-0 min-w-0 truncate"
                                title={event.component_name}
                            >
                                {event.tire_event_type === 'purchase' ? '🧾' : '🛞'}{' '}
                                {formatTireEventLabel(event)} · {event.component_name}
                            </p>
                            <button
                                onClick={() => onDelete(event)}
                                disabled={event.id === protectedEventId}
                                title={event.id === protectedEventId
                                    ? 'Нельзя удалить установку текущего комплекта. Сначала переключитесь на другой комплект.'
                                    : undefined}
                                className="flex items-center justify-center w-8 h-8 rounded-md3-full text-error hover:bg-error-container transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label={event.id === protectedEventId
                                    ? 'Нельзя удалить установку текущего комплекта'
                                    : 'Удалить запись из истории шин'}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                                </svg>
                            </button>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-outline">
                            <span>📅 {event.replacement_date}</span>
                            <span>📍 {event.km_at_replacement.toLocaleString()} км</span>
                            {event.component_price != null && event.component_price > 0 && (
                                <span>🧾 {formatTireMoney(event.component_price)}</span>
                            )}
                            {event.work_price != null && event.work_price > 0 && (
                                <span>🔧 Работа: {formatTireMoney(event.work_price)}</span>
                            )}
                            {event.next_change_date && <span>📅 До: {event.next_change_date}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
