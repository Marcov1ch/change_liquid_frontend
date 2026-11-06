export const REPLACEMENT_TYPE_LABELS: Record<string, string> = {
    tire_change: 'Шины',
    insurance: 'Страховка',
    parking_monthly: 'Аренда машиноместа',
};

const DATE_BASED_TYPES = new Set(['tire_change', 'insurance', 'parking_monthly']);
const DATE_ONLY_TYPES = new Set(['insurance', 'parking_monthly']);

export function isDateBasedComponent(type: string): boolean {
    return DATE_BASED_TYPES.has(type);
}

export function isDateOnlyComponent(type: string): boolean {
    return DATE_ONLY_TYPES.has(type);
}

export function getDateWarningDays(type: string): number {
    return type === 'parking_monthly' ? 1 : 5;
}
