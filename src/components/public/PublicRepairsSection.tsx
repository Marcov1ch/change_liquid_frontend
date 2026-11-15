import { useCurrency } from '../../context/CurrencyContext';
import type { PublicRepair } from '../../types';

interface Props {
    repairs: PublicRepair[];
    componentNames: Record<string, string>;
}

export function PublicRepairsSection({ repairs, componentNames }: Props) {
    const { formatMoney } = useCurrency();
    return (
        <div className="md3-card p-6">
            <h2 className="text-title-md text-surface-on mb-4">Ремонт или обслуживание</h2>

            {repairs.length === 0 ? (
                <p className="text-body-md text-outline">Ремонтов пока нет.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {repairs.map(repair => (
                        <div
                            key={repair.id}
                            className="p-3 rounded-md3-sm bg-surface border border-outline-variant"
                        >
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <span className="text-label-lg text-surface-on">
                                    📅 {repair.repair_date}
                                </span>
                                <span className="text-title-sm text-surface-on">
                                    {formatMoney(repair.work_cost + repair.parts_cost)}
                                </span>
                            </div>
                            <p className="text-body-sm text-outline m-0 mt-1">
                                📍 {repair.km_at_repair.toLocaleString()} км
                            </p>
                            <p className="text-body-sm text-outline m-0">
                                🔧 Работы: {formatMoney(repair.work_cost)} · 🧾 Запчасти:{' '}
                                {formatMoney(repair.parts_cost)}
                            </p>
                            {repair.description && (
                                <p className="text-body-md text-surface-on m-0 mt-2 whitespace-pre-line">
                                    {repair.description}
                                </p>
                            )}
                            {repair.component_types.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {repair.component_types.map(type => (
                                        <span
                                            key={type}
                                            className="md3-badge bg-surface-variant text-surface-on-variant"
                                        >
                                            {componentNames[type] ?? type}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
