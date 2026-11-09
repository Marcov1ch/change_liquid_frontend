import type { TireSet } from '../types';
import {
    formatKm,
    getTireStatusMeta,
    TIRE_SEASON_ICONS,
    TIRE_SEASON_LABELS,
    tireStatusNote,
} from '../utils/tireSets';

interface Props {
    current: TireSet | null;
}

export function TireSetCurrentCard({ current }: Props) {
    if (!current) {
        return (
            <div className="p-4 rounded-md3-md bg-surface-variant/60 text-surface-on-variant">
                <p className="text-body-md m-0">Сейчас ни один комплект не отмечен как установленный.</p>
            </div>
        );
    }

    const status = getTireStatusMeta(current.status);

    return (
        <>
            <div className="p-4 rounded-md3-md bg-primary-container text-primary-on-container">
                <p className="text-body-sm m-0 opacity-80">Сейчас установлены</p>
                <div className="flex items-center justify-between gap-3 flex-wrap mt-1">
                    <h3 className="text-title-md m-0">
                        {TIRE_SEASON_ICONS[current.season]} {current.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`md3-badge ${status.bgClass} ${status.textClass}`}>
                            {status.icon} {status.label}
                        </span>
                        <span className="md3-badge bg-surface text-surface-on">
                            {formatKm(current.total_km)}
                        </span>
                    </div>
                </div>
                <p className="text-body-sm m-0 mt-1 opacity-80">
                    {TIRE_SEASON_LABELS[current.season]}
                    {current.installed_date ? ` · установлены ${current.installed_date}` : ''}
                </p>
                {current.next_change_date && (
                    <p className="text-body-sm m-0 mt-1 opacity-80">
                        📅 Следующая смена: {current.next_change_date}
                    </p>
                )}
                {current.status && (
                    <p className="text-body-sm m-0 mt-1 opacity-80">
                        {tireStatusNote(current.status, current.days_remaining)}
                    </p>
                )}
            </div>

            {!current.next_change_date && (
                <div className="p-3 rounded-md3-sm bg-surface-variant/50 text-surface-on-variant">
                    <p className="text-body-sm m-0">
                        ⚪ Дата следующей смены не задана. Укажите её в редактировании комплекта,
                        чтобы получать напоминания и видеть статус.
                    </p>
                </div>
            )}
        </>
    );
}
