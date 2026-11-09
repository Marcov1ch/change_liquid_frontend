export interface ReplacementStatusStyle {
    bg: string;
    text: string;
    border: string;
    icon: string;
    label: string;
}

export const REPLACEMENT_STATUS_STYLES: Record<string, ReplacementStatusStyle> = {
    good: {
        bg: 'bg-[#E6F7E6]',
        text: 'text-[#1B5E1B]',
        border: 'border-l-[#28A745]',
        icon: '🟢',
        label: 'В порядке',
    },
    warning: {
        bg: 'bg-[#FFF8E1]',
        text: 'text-[#7A6100]',
        border: 'border-l-[#FFC107]',
        icon: '🟡',
        label: 'Скоро замена',
    },
    critical: {
        bg: 'bg-[#FFF0E6]',
        text: 'text-[#7A2D00]',
        border: 'border-l-[#E06900]',
        icon: '🟠',
        label: 'Требует внимания',
    },
    overdue: {
        bg: 'bg-error-container',
        text: 'text-error-on-container',
        border: 'border-l-error',
        icon: '🔴',
        label: 'Просрочено',
    },
    replaced: {
        bg: 'bg-[#F5F5F5]',
        text: 'text-outline',
        border: 'border-l-outline-variant',
        icon: '📌',
        label: 'Заменено',
    },
    unknown: {
        bg: 'bg-surface-variant/50',
        text: 'text-surface-on-variant',
        border: 'border-l-outline',
        icon: '⚪',
        label: 'Нет данных',
    },
};

export function getReplacementStatusStyle(status: string | null | undefined): ReplacementStatusStyle {
    return REPLACEMENT_STATUS_STYLES[status ?? 'unknown'] ?? REPLACEMENT_STATUS_STYLES.unknown;
}
