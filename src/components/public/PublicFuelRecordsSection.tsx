import type { PublicFuelRecord } from '../../types';
import { formatPublicMoney } from '../../utils/publicVehicle';

interface Props {
    records: PublicFuelRecord[];
}

export function PublicFuelRecordsSection({ records }: Props) {
    return (
        <div className="md3-card p-6">
            <h2 className="text-title-md text-surface-on mb-4">Заправки</h2>

            {records.length === 0 ? (
                <p className="text-body-md text-outline">Заправок пока нет.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {records.map(record => (
                        <div
                            key={record.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-md3-sm bg-surface border border-outline-variant flex-wrap"
                        >
                            <div className="min-w-0">
                                <p className="text-label-lg text-surface-on m-0">
                                    📅 {record.fuel_date}
                                </p>
                                <p className="text-body-sm text-outline m-0">
                                    📍 {record.km_at_fuel.toLocaleString()} км · ⛽{' '}
                                    {record.liters.toLocaleString(undefined, { maximumFractionDigits: 3 })} л
                                </p>
                                <p className="text-body-sm text-outline m-0">
                                    📊 Расход:{' '}
                                    {record.consumption_l_per_100km == null
                                        ? '—'
                                        : `${record.consumption_l_per_100km.toLocaleString(undefined, { maximumFractionDigits: 2 })} л/100 км`}
                                </p>
                            </div>
                            <span className="text-title-sm text-surface-on shrink-0">
                                {formatPublicMoney(record.total_cost)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
