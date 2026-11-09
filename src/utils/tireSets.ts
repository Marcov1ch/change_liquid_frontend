import type { Replacement, TireSeason, TireSet } from '../types';

export const TIRE_SEASON_LABELS: Record<TireSeason, string> = {
    summer: 'Лето',
    winter: 'Зима',
    all_season: 'Всесезон',
};

export const TIRE_SEASON_ICONS: Record<TireSeason, string> = {
    summer: '☀️',
    winter: '❄️',
    all_season: '🌤️',
};

export interface TireStatusMeta {
    label: string;
    icon: string;
    dotClass: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
}

export const TIRE_STATUS_META: Record<string, TireStatusMeta> = {
    good: {
        label: 'В порядке',
        icon: '🟢',
        dotClass: 'bg-[#28A745]',
        bgClass: 'bg-[#E6F7E6]',
        textClass: 'text-[#1B5E1B]',
        borderClass: 'border-l-[#28A745]',
    },
    warning: {
        label: 'Скоро замена',
        icon: '🟡',
        dotClass: 'bg-[#FFC107]',
        bgClass: 'bg-[#FFF8E1]',
        textClass: 'text-[#7A6100]',
        borderClass: 'border-l-[#FFC107]',
    },
    critical: {
        label: 'Требует внимания',
        icon: '🟠',
        dotClass: 'bg-[#E06900]',
        bgClass: 'bg-[#FFF0E6]',
        textClass: 'text-[#7A2D00]',
        borderClass: 'border-l-[#E06900]',
    },
    overdue: {
        label: 'Замена просрочена',
        icon: '🔴',
        dotClass: 'bg-error',
        bgClass: 'bg-error-container',
        textClass: 'text-error-on-container',
        borderClass: 'border-l-error',
    },
    unknown: {
        label: 'Нет данных',
        icon: '⚪',
        dotClass: 'bg-outline',
        bgClass: 'bg-surface-variant/50',
        textClass: 'text-surface-on-variant',
        borderClass: 'border-l-outline',
    },
};

export function getTireStatusMeta(status: string | null | undefined): TireStatusMeta {
    return TIRE_STATUS_META[status ?? 'unknown'] ?? TIRE_STATUS_META.unknown;
}

export function tireStatusNote(
    status: string | null | undefined,
    daysRemaining: number | null | undefined,
): string {
    if (status === 'overdue' && daysRemaining != null) {
        return `Просрочено на ${Math.abs(daysRemaining)} дн.`;
    }
    if (status === 'warning' && daysRemaining != null) {
        return daysRemaining === 0 ? 'Замена сегодня' : `Замена через ${daysRemaining} дн.`;
    }
    if (status === 'good' && daysRemaining != null) {
        return `До замены ${daysRemaining} дн.`;
    }
    if (!status || status === 'unknown') {
        return 'Дата следующей смены не задана';
    }
    return '';
}

export function formatKm(value: number): string {
    return `${value.toLocaleString()} км`;
}

export function formatTireMoney(value: number | null): string {
    return value == null ? '—' : `${value.toLocaleString()} ₽`;
}

export function isTireChange(replacement: Replacement): boolean {
    return replacement.component_type === 'tire_change';
}

export function formatTireEventLabel(replacement: Replacement): string {
    if (replacement.tire_event_type === 'purchase') return 'Покупка';
    if (replacement.tire_event_type === 'install') return 'Установка';
    return 'Замена';
}

export function getCurrentTireInstallId(
    events: Replacement[],
    current: TireSet | null,
): number | null {
    if (!current) return null;

    const installs = events.filter(
        event => event.tire_event_type === 'install' && event.tire_set_id === current.id,
    );
    if (installs.length === 0) return null;

    return installs.reduce((best, item) => {
        if (item.km_at_replacement > best.km_at_replacement) return item;
        if (item.km_at_replacement === best.km_at_replacement && item.id > best.id) return item;
        return best;
    }).id;
}

export function sortTireEvents(events: Replacement[]): Replacement[] {
    return [...events].sort((a, b) => {
        const dateDiff = new Date(b.replacement_date).getTime() - new Date(a.replacement_date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.id - a.id;
    });
}
