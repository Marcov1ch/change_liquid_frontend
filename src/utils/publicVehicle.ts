import type { PublicReplacement } from '../types';
import { getDateWarningDays, isDateBasedComponent, isDateOnlyComponent } from './replacementTypes';

export function formatPublicMoney(value: number | null): string {
    return value == null ? '—' : `${value.toLocaleString()} ₽`;
}

export function getPublicReplacementNote(replacement: PublicReplacement): string | null {
    if (isDateBasedComponent(replacement.component_type)) {
        if (replacement.days_remaining == null) return null;
        if (replacement.days_remaining < 0) {
            return `Просрочено на ${-replacement.days_remaining} дн.`;
        }
        const warningDays = getDateWarningDays(replacement.component_type);
        if (replacement.days_remaining <= warningDays) {
            const action = isDateOnlyComponent(replacement.component_type)
                ? 'Окончание срока'
                : 'Замена';
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
