export const REPLACEMENT_TYPE_LABELS: Record<string, string> = {
    tire_change: 'Шины',
    insurance: 'Страховка',
};

const DATE_BASED_TYPES = new Set(['tire_change', 'insurance']);

export function isDateBasedComponent(type: string): boolean {
    return DATE_BASED_TYPES.has(type);
}
