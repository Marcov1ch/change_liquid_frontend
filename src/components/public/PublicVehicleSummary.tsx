import type { PublicVehicle } from '../../types';
import { formatPublicMoney } from '../../utils/publicVehicle';
import { getReplacementStatusStyle } from '../../utils/statusStyles';

interface Props {
    vehicle: PublicVehicle;
    replacementsCount: number;
    fuelRecordsCount: number;
    repairsCount: number;
    otherExpensesCount: number;
    totalCost: number;
}

export function PublicVehicleSummary({
    vehicle,
    replacementsCount,
    fuelRecordsCount,
    repairsCount,
    otherExpensesCount,
    totalCost,
}: Props) {
    const statusStyle = getReplacementStatusStyle(vehicle.vehicle_status);

    return (
        <div className={`md3-card p-6 border-l-4 ${statusStyle.border}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h2 className="text-headline-sm text-surface-on m-0">
                        {vehicle.brand} {vehicle.model}
                    </h2>
                    <p className="text-body-md text-outline mt-1">
                        {vehicle.plate_number} · {vehicle.year}
                    </p>
                </div>
                <span className={`md3-badge ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.icon} {statusStyle.label}
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
                <SummaryItem label="Пробег" value={`${vehicle.current_km.toLocaleString()} км`} />
                <SummaryItem label="Замен" value={String(replacementsCount)} />
                <SummaryItem label="Заправок" value={String(fuelRecordsCount)} />
                <SummaryItem label="Ремонтов" value={String(repairsCount)} />
                <SummaryItem label="Прочих трат" value={String(otherExpensesCount)} />
                <SummaryItem label="Общие расходы" value={formatPublicMoney(totalCost)} />
            </div>
        </div>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-surface-variant/40 rounded-md3-sm p-3">
            <p className="text-body-sm text-outline m-0">{label}</p>
            <p className="text-title-md text-surface-on m-0">{value}</p>
        </div>
    );
}
