import { describe, expect, it } from 'vitest'
import { currencySymbol, formatMoney, roundMoney } from '../currency'

function normalize(value: string): string {
    return value.replace(/\u00a0/g, ' ')
}

describe('formatMoney', () => {
    it('returns dash for null', () => {
        expect(formatMoney(null, 'RUB')).toBe('—')
    })

    it('formats rubles with fractional part', () => {
        expect(normalize(formatMoney(1234.5, 'RUB'))).toBe('1 234,5 ₽')
    })

    it('formats foreign currencies', () => {
        expect(normalize(formatMoney(12.34, 'USD'))).toBe('12,34 $')
        expect(normalize(formatMoney(12.34, 'EUR'))).toBe('12,34 €')
        expect(normalize(formatMoney(12.34, 'BYN'))).toContain('Br')
    })
})

describe('currency helpers', () => {
    it('returns symbols', () => {
        expect(currencySymbol('RUB')).toBe('₽')
        expect(currencySymbol('USD')).toBe('$')
        expect(currencySymbol('EUR')).toBe('€')
    })

    it('rounds to two decimals', () => {
        expect(roundMoney(12.345)).toBe(12.35)
        expect(roundMoney(12.344)).toBe(12.34)
    })
})
