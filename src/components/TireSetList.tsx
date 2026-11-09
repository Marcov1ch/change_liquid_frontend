import type { TireSet } from '../types';
import {
    formatKm,
    TIRE_SEASON_ICONS,
    TIRE_SEASON_LABELS,
} from '../utils/tireSets';

interface Props {
    tireSets: TireSet[];
    onEdit: (tireSet: TireSet) => void;
    onDelete: (tireSet: TireSet) => void;
}

export function TireSetList({ tireSets, onEdit, onDelete }: Props) {
    if (tireSets.length === 0) return null;

    return (
        <div>
            <p className="text-label-lg text-surface-on mb-2">Комплекты</p>
            <div className="flex flex-col gap-2">
                {tireSets.map(tireSet => (
                    <div
                        key={tireSet.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-md3-sm bg-surface border border-outline-variant"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <p
                                    className="text-label-lg text-surface-on m-0 truncate"
                                    title={tireSet.name}
                                >
                                    {TIRE_SEASON_ICONS[tireSet.season]} {tireSet.name}
                                </p>
                                {tireSet.is_installed && (
                                    <span className="md3-badge bg-primary-container text-primary-on-container shrink-0">
                                        установлены
                                    </span>
                                )}
                            </div>
                            <p className="text-body-sm text-outline m-0">
                                {TIRE_SEASON_LABELS[tireSet.season]} · всего {formatKm(tireSet.total_km)}
                                {tireSet.accumulated_km > 0
                                    && ` · прошлые сезоны ${formatKm(tireSet.accumulated_km)}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() => onEdit(tireSet)}
                                className="flex items-center justify-center w-8 h-8 rounded-md3-full text-surface-on-variant hover:bg-surface-variant transition-colors"
                                aria-label="Редактировать комплект"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => onDelete(tireSet)}
                                disabled={tireSet.is_installed}
                                className="flex items-center justify-center w-8 h-8 rounded-md3-full text-error hover:bg-error-container transition-colors disabled:opacity-40"
                                aria-label="Удалить комплект"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
