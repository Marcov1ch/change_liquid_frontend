import type { PublicTireSet } from '../../types';
import {
    formatKm,
    formatTireMoney,
    getTireStatusMeta,
    TIRE_SEASON_ICONS,
    TIRE_SEASON_LABELS,
} from '../../utils/tireSets';

interface Props {
    tireSets: PublicTireSet[];
}

export function PublicTireSetsSection({ tireSets }: Props) {
    if (tireSets.length === 0) return null;

    return (
        <div className="md3-card p-6">
            <h2 className="text-title-md text-surface-on mb-4">Шины</h2>
            <div className="flex flex-col gap-2">
                {tireSets.map(tireSet => {
                    const status = tireSet.status ? getTireStatusMeta(tireSet.status) : null;

                    return (
                        <div
                            key={tireSet.id}
                            className="p-3 rounded-md3-sm bg-surface border border-outline-variant"
                        >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-label-lg text-surface-on">
                                    {TIRE_SEASON_ICONS[tireSet.season]} {tireSet.name}
                                    {tireSet.is_installed && (
                                        <span className="ml-2 md3-badge bg-primary-container text-primary-on-container">
                                            установлены
                                        </span>
                                    )}
                                    {tireSet.is_installed && status && (
                                        <span className={`ml-2 md3-badge ${status.bgClass} ${status.textClass}`}>
                                            {status.icon} {status.label}
                                        </span>
                                    )}
                                </span>
                                <span className="text-title-sm text-surface-on">
                                    {formatKm(tireSet.total_km)}
                                </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-outline">
                                <span>{TIRE_SEASON_LABELS[tireSet.season]}</span>
                                {tireSet.installed_date && (
                                    <span>📅 Установлены: {tireSet.installed_date}</span>
                                )}
                                {tireSet.next_change_date && (
                                    <span>📅 Следующая смена: {tireSet.next_change_date}</span>
                                )}
                                {tireSet.purchase_price != null && (
                                    <span>
                                        🧾 Покупка: {formatTireMoney(tireSet.purchase_price)}
                                        {tireSet.purchase_date ? ` · ${tireSet.purchase_date}` : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
