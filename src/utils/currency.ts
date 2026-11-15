import type { CurrencyCode } from '../types'

export const CURRENCIES: CurrencyCode[] = ['RUB', 'BYN', 'USD', 'EUR']

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    RUB: '₽',
    BYN: 'Br',
    USD: '$',
    EUR: '€',
}

export function formatMoney(value: number | null | undefined, currency: CurrencyCode): string {
    if (value == null) return '—'
    const amount = new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value)
    return `${amount} ${CURRENCY_SYMBOLS[currency]}`
}

export function currencySymbol(currency: CurrencyCode): string {
    return CURRENCY_SYMBOLS[currency]
}

export function roundMoney(value: number): number {
    return Math.round(value * 100) / 100
}
