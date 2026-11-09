import type { Replacement, Vehicle } from '../types';

interface GroupableReplacement {
    id: number;
    component_type: string;
    km_at_replacement: number;
    replacement_date: string;
}

export function groupReplacements<T extends GroupableReplacement>(
    replacements: T[],
): Record<string, T[]> {
    const grouped = replacements.reduce<Record<string, T[]>>((acc, replacement) => {
        const type = replacement.component_type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(replacement);
        return acc;
    }, {});

    Object.values(grouped).forEach(items => {
        items.sort((a, b) => {
            if (b.km_at_replacement !== a.km_at_replacement) {
                return b.km_at_replacement - a.km_at_replacement;
            }
            const dateDiff = new Date(b.replacement_date).getTime() - new Date(a.replacement_date).getTime();
            if (dateDiff !== 0) return dateDiff;
            return (b.id || 0) - (a.id || 0);
        });
    });

    return grouped;
}

export function getKmProgress(vehicle: Vehicle, type: string): number {
    const interval = vehicle.intervals[type];
    const remaining = vehicle.km_remaining[type];
    if (!interval || remaining === null || remaining === undefined) return 0;
    const used = interval - remaining;
    return Math.min(100, Math.max(0, (used / interval) * 100));
}

export function getDateProgress(items: Replacement[] | undefined): number {
    const latest = items?.[0];
    if (!latest?.next_change_date || !latest?.replacement_date || latest.days_remaining == null) {
        return 0;
    }
    const start = new Date(latest.replacement_date).getTime();
    const end = new Date(latest.next_change_date).getTime();
    const totalMs = end - start;
    if (totalMs <= 0) return 100;
    const totalDays = Math.round(totalMs / 86400000);
    const elapsedDays = totalDays - latest.days_remaining;
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
}
