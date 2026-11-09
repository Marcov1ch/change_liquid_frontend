import type { Replacement } from '../types';
import { getDateWarningDays, isDateBasedComponent } from './replacementTypes';

export function getReplacementStatusLabel(replacement: Replacement): string | null {
    const isDateBased = isDateBasedComponent(replacement.component_type);
    const warningDays = getDateWarningDays(replacement.component_type);
    const daysRemaining = replacement.days_remaining;

    if (isDateBased) {
        if (daysRemaining == null) return null;
        if (daysRemaining < 0) return `Просрочено на ${-daysRemaining} дн.`;
        if (daysRemaining <= warningDays) return `Скоро замена: осталось ${daysRemaining} дн.`;
        return null;
    }

    if (replacement.status === 'replaced') return 'Заменено';
    const kmRemaining = replacement.km_remaining;
    if (kmRemaining == null) return null;
    if (replacement.status === 'overdue') {
        return `Просрочено на ${Math.abs(kmRemaining).toLocaleString()} км`;
    }
    if (replacement.status === 'critical' || replacement.status === 'warning') {
        return `Осталось ${kmRemaining.toLocaleString()} км`;
    }
    return null;
}

export function getReplacementDateReminder(replacement: Replacement): string | null {
    if (isDateBasedComponent(replacement.component_type)) return null;
    if (!replacement.next_change_date || replacement.days_remaining == null) return null;

    const warningDays = getDateWarningDays(replacement.component_type);
    if (replacement.days_remaining < 0) {
        return `⏳ Просрочено по дате на ${-replacement.days_remaining} дн.`;
    }
    if (replacement.days_remaining <= warningDays) {
        return `⏳ Замена по дате через ${replacement.days_remaining} дн.`;
    }
    return null;
}
