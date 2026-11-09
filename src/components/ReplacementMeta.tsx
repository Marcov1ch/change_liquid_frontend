import type { Replacement } from '../types';

interface Props {
    replacement: Replacement;
    isDateOnly: boolean;
    isTire: boolean;
    isParking: boolean;
    kmTraveled: number;
    warningDays: number;
}

export function ReplacementMeta({
    replacement,
    isDateOnly,
    isTire,
    isParking,
    kmTraveled,
    warningDays,
}: Props) {
    const warningClass = replacement.days_remaining != null
        && replacement.days_remaining <= warningDays
        ? 'text-error font-semibold'
        : '';

    return (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-outline">
            <span>📅 {replacement.replacement_date}</span>
            {isDateOnly ? (
                <>
                    {replacement.component_price != null && replacement.component_price > 0 && (
                        <span>
                            🧾 {isParking ? 'Аренда' : 'Страховка'}:{' '}
                            {replacement.component_price.toLocaleString()} ₽
                        </span>
                    )}
                    {replacement.next_change_date && (
                        <span>📅 До: {replacement.next_change_date}</span>
                    )}
                    {replacement.days_remaining != null && (
                        <span className={warningClass}>
                            ⏳ {replacement.days_remaining} дн.
                        </span>
                    )}
                </>
            ) : (
                <>
                    <span>📍 {replacement.km_at_replacement.toLocaleString()} км</span>
                    <span>🛣 Пройдено: {kmTraveled.toLocaleString()} км</span>
                    {replacement.component_price != null && replacement.component_price > 0 && (
                        <span>
                            🧾 {isTire ? 'Шины' : 'Цена'}:{' '}
                            {replacement.component_price.toLocaleString()} ₽
                        </span>
                    )}
                    {replacement.work_price != null && replacement.work_price > 0 && (
                        <span>🔧 Работы: {replacement.work_price.toLocaleString()} ₽</span>
                    )}
                    {replacement.next_replacement_km != null && !isTire && (
                        <span>⏱ Следующая: {replacement.next_replacement_km.toLocaleString()} км</span>
                    )}
                    {replacement.next_change_date && (
                        <span>📅 До: {replacement.next_change_date}</span>
                    )}
                    {isTire && replacement.days_remaining != null && (
                        <span className={warningClass}>
                            ⏳ {replacement.days_remaining} дн.
                        </span>
                    )}
                </>
            )}
        </div>
    );
}
