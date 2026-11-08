export const MAX_PLATE_LENGTH = 15;

export function validatePlateNumber(value: string): string | null {
    const normalized = value.trim();

    if (normalized === '') {
        return 'Введите госномер';
    }

    if ([...normalized].some(ch => ch.charCodeAt(0) < 32)) {
        return 'Госномер не может содержать управляющие символы';
    }

    if (normalized.length > MAX_PLATE_LENGTH) {
        return `Госномер не может быть длиннее ${MAX_PLATE_LENGTH} символов`;
    }

    return null;
}
