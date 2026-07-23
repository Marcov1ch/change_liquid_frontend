const ALLOWED_LETTERS = 'АВЕІКМНОРСТУХ';

const RF_PATTERN = new RegExp(`^[${ALLOWED_LETTERS}]\\d{3}[${ALLOWED_LETTERS}]{2}\\d{2,3}$`);
const BY_CURRENT_PATTERN = new RegExp(`^\\d{4}[${ALLOWED_LETTERS}]{2}\\d$`);
const BY_OLD_PATTERN = new RegExp(`^\\d{4}[${ALLOWED_LETTERS}]{2}$`);

export function validatePlateNumber(value: string): string | null {
    const cleaned = value.replace(/\s/g, '').replace(/-/g, '').toUpperCase();

    if (cleaned === '') return null;

    if (RF_PATTERN.test(cleaned) || BY_CURRENT_PATTERN.test(cleaned) || BY_OLD_PATTERN.test(cleaned)) {
        return null;
    }

    return 'Некорректный формат госномера. Допустимые форматы: А123АА178 (РФ) или 1234AB7 (РБ)';
}
