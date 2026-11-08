import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { PublicReplacement } from '../types';
import { getDateWarningDays, isDateBasedComponent, isDateOnlyComponent, REPLACEMENT_TYPE_LABELS } from '../utils/replacementTypes';
import { calcTotalCost } from '../utils/publicTotals';

const statusStyles: Record<string, { bg: string; text: string; border: string; icon: string; label: string }> = {
    good: { bg: 'bg-[#E6F7E6]', text: 'text-[#1B5E1B]', border: 'border-l-[#28A745]', icon: '🟢', label: 'В порядке' },
    warning: { bg: 'bg-[#FFF8E1]', text: 'text-[#7A6100]', border: 'border-l-[#FFC107]', icon: '🟡', label: 'Скоро замена' },
    critical: { bg: 'bg-[#FFF0E6]', text: 'text-[#7A2D00]', border: 'border-l-[#E06900]', icon: '🟠', label: 'Требует внимания' },
    overdue: { bg: 'bg-error-container', text: 'text-error-on-container', border: 'border-l-error', icon: '🔴', label: 'Просрочено' },
    replaced: { bg: 'bg-[#F5F5F5]', text: 'text-outline', border: 'border-l-outline-variant', icon: '📌', label: 'Заменено' },
    unknown: { bg: 'bg-surface-variant/50', text: 'text-surface-on-variant', border: 'border-l-outline', icon: '⚪', label: 'Нет данных' },
};

function formatMoney(value: number | null): string {
    return value == null ? '—' : `${value.toLocaleString()} ₽`;
}

function replacementNote(replacement: PublicReplacement): string | null {
    if (isDateBasedComponent(replacement.component_type)) {
        if (replacement.days_remaining == null) return null;
        if (replacement.days_remaining < 0) return `Просрочено на ${-replacement.days_remaining} дн.`;
        const warningDays = getDateWarningDays(replacement.component_type);
        if (replacement.days_remaining <= warningDays) {
            const action = isDateOnlyComponent(replacement.component_type) ? 'Окончание срока' : 'Замена';
            return `${action} через ${replacement.days_remaining} дн.`;
        }
        return null;
    }
    if (replacement.status === 'replaced' || replacement.km_remaining == null) return null;
    if (replacement.status === 'overdue') {
        return `Просрочено на ${Math.abs(replacement.km_remaining).toLocaleString()} км`;
    }
    return `Осталось ${replacement.km_remaining.toLocaleString()} км`;
}

export function PublicVehiclePage() {
    const { token } = useParams<{ token: string }>();

    const { data: configsData } = useQuery({
        queryKey: ['enums', 'component-configs-public'],
        queryFn: api.getPublicComponentConfigs,
        staleTime: Infinity,
    });

    const { data: vehicle, isLoading, error } = useQuery({
        queryKey: ['public-vehicle', token],
        queryFn: () => api.getPublicVehicle(token!),
        enabled: !!token,
        retry: false,
    });

    const componentNames = useMemo(() => {
        const names: Record<string, string> = {};
        configsData?.configs.forEach(config => { names[config.key] = config.name; });
        Object.assign(names, REPLACEMENT_TYPE_LABELS);
        return names;
    }, [configsData]);

    const grouped = useMemo(() => {
        const result: Record<string, PublicReplacement[]> = {};
        vehicle?.replacements.forEach(replacement => {
            if (!result[replacement.component_type]) result[replacement.component_type] = [];
            result[replacement.component_type].push(replacement);
        });
        Object.values(result).forEach(items => {
            items.sort((a, b) => {
                if (b.km_at_replacement !== a.km_at_replacement) return b.km_at_replacement - a.km_at_replacement;
                return new Date(b.replacement_date).getTime() - new Date(a.replacement_date).getTime();
            });
        });
        return result;
    }, [vehicle]);

    const otherExpenses = vehicle?.other_expenses ?? [];

    const totalCost = useMemo(() => {
        return vehicle ? calcTotalCost(vehicle.replacements, vehicle.other_expenses ?? []) : 0;
    }, [vehicle]);

    const vehicleStyle = statusStyles[vehicle?.vehicle_status ?? 'unknown'] ?? statusStyles.unknown;

    return (
        <div className="min-h-screen bg-surface">
            <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-outline-variant shadow-md3-1">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                    <div>
                        <h1 className="text-title-md text-surface-on m-0">ChangeLiquid</h1>
                        <p className="text-body-sm text-outline m-0">История обслуживания автомобиля</p>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {isLoading && (
                    <div className="md3-card p-8 text-center text-outline">Загрузка...</div>
                )}

                {error && (
                    <div className="md3-card p-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
                        <h2 className="text-title-md text-surface-on mb-2">Ссылка недоступна</h2>
                        <p className="text-body-md text-outline">
                            {error instanceof Error ? error.message : 'Ссылка не найдена или отключена'}
                        </p>
                    </div>
                )}

                {vehicle && (
                    <div className="flex flex-col gap-5 animate-slide-up">
                        <div className={`md3-card p-6 border-l-4 ${vehicleStyle.border}`}>
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                    <h2 className="text-headline-sm text-surface-on m-0">
                                        {vehicle.brand} {vehicle.model}
                                    </h2>
                                    <p className="text-body-md text-outline mt-1">
                                        {vehicle.plate_number} · {vehicle.year}
                                    </p>
                                </div>
                                <span className={`md3-badge ${vehicleStyle.bg} ${vehicleStyle.text}`}>
                                    {vehicleStyle.icon} {vehicleStyle.label}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                                <div className="bg-surface-variant/40 rounded-md3-sm p-3">
                                    <p className="text-body-sm text-outline m-0">Пробег</p>
                                    <p className="text-title-md text-surface-on m-0">{vehicle.current_km.toLocaleString()} км</p>
                                </div>
                                <div className="bg-surface-variant/40 rounded-md3-sm p-3">
                                    <p className="text-body-sm text-outline m-0">Замен</p>
                                    <p className="text-title-md text-surface-on m-0">{vehicle.replacements.length}</p>
                                </div>
                                <div className="bg-surface-variant/40 rounded-md3-sm p-3">
                                    <p className="text-body-sm text-outline m-0">Прочих трат</p>
                                    <p className="text-title-md text-surface-on m-0">{otherExpenses.length}</p>
                                </div>
                                <div className="bg-surface-variant/40 rounded-md3-sm p-3">
                                    <p className="text-body-sm text-outline m-0">Общие расходы</p>
                                    <p className="text-title-md text-surface-on m-0">{formatMoney(totalCost)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="md3-card p-6">
                            <h2 className="text-title-md text-surface-on mb-4">История замен</h2>

                            {vehicle.replacements.length === 0 ? (
                                <p className="text-body-md text-outline">Замены пока не добавлены.</p>
                            ) : (
                                <div className="flex flex-col gap-5">
                                    {Object.entries(grouped).map(([type, items]) => (
                                        <div key={type}>
                                            <h3 className="text-label-lg text-surface-on mb-2">
                                                {componentNames[type] ?? type}
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                {items.map((replacement, index) => {
                                                    const style = statusStyles[replacement.status ?? 'unknown'] ?? statusStyles.unknown;
                                                    const note = replacementNote(replacement);
                                                    const isDateOnly = isDateOnlyComponent(replacement.component_type);
                                                    const isParking = replacement.component_type === 'parking_monthly';
                                                    return (
                                                        <div
                                                            key={replacement.id}
                                                            className={`p-3 rounded-md3-sm border-l-4 ${style.border} bg-surface`}
                                                        >
                                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                <span className="text-label-lg text-surface-on">
                                                                    {index === 0 && <span className="mr-1">{style.icon}</span>}
                                                                    {replacement.component_name}
                                                                </span>
                                                                {index === 0 && (
                                                                    <span className="md3-badge bg-primary-container text-primary-on-container">
                                                                        последняя
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-outline">
                                                                <span>📅 {replacement.replacement_date}</span>
                                                                {isDateOnly ? (
                                                                    <>
                                                                        <span>🧾 {isParking ? 'Аренда' : 'Страховка'}: {formatMoney(replacement.component_price)}</span>
                                                                        {replacement.next_change_date && (
                                                                            <span>📅 До: {replacement.next_change_date}</span>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span>📍 {replacement.km_at_replacement.toLocaleString()} км</span>
                                                                        {replacement.component_type === 'tire_change' && replacement.km_traveled != null && (
                                                                            <span>🛣 Пройдено: {replacement.km_traveled.toLocaleString()} км</span>
                                                                        )}
                                                                        <span>🧾 {formatMoney(replacement.component_price)}</span>
                                                                        <span>🔧 {formatMoney(replacement.work_price)}</span>
                                                                        {replacement.next_change_date && (
                                                                            <span>📅 До: {replacement.next_change_date}</span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                            {note && (
                                                                <p className={`text-body-sm mt-1 m-0 ${style.text}`}>{note}</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="md3-card p-6">
                            <h2 className="text-title-md text-surface-on mb-4">Прочие траты</h2>

                            {otherExpenses.length === 0 ? (
                                <p className="text-body-md text-outline">Прочих трат пока нет.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {otherExpenses.map((expense) => (
                                        <div
                                            key={expense.id}
                                            className="flex items-center justify-between gap-3 p-3 rounded-md3-sm bg-surface border border-outline-variant"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-label-lg text-surface-on m-0 truncate">{expense.name}</p>
                                                <p className="text-body-sm text-outline m-0">📅 {expense.expense_date}</p>
                                            </div>
                                            <span className="text-title-sm text-surface-on shrink-0">
                                                {formatMoney(expense.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="md3-card p-6 text-center border-l-4 border-l-primary">
                            <h2 className="text-title-md text-surface-on mb-2">Ведите историю своего авто</h2>
                            <p className="text-body-md text-outline mb-4">
                                Регистрируйтесь в ChangeLiquid, чтобы вовремя узнавать о заменах
                                и хранить всю историю обслуживания в одном месте.
                            </p>
                            <a href={vehicle.register_url} className="md3-btn-primary inline-flex">
                                Зарегистрироваться
                            </a>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
