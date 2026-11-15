import { describe, expect, it } from 'vitest'

import { gpsErrorMessage, haversine } from '../gpsTracker'

describe('haversine', () => {
    it('returns zero for the same point', () => {
        expect(haversine(55.75, 37.61, 55.75, 37.61)).toBe(0)
    })

    it('calculates one degree of latitude', () => {
        expect(haversine(0, 0, 1, 0)).toBeCloseTo(111.19, 1)
    })
})

describe('gpsErrorMessage', () => {
    it('maps permission denied', () => {
        expect(gpsErrorMessage(1)).toContain('Геолокация отключена')
    })

    it('maps unavailable signal', () => {
        expect(gpsErrorMessage(2)).toBe('GPS-сигнал недоступен')
    })

    it('maps timeout', () => {
        expect(gpsErrorMessage(3)).toContain('Время ожидания')
    })

    it('returns fallback for unknown code', () => {
        expect(gpsErrorMessage(99)).toBe('Ошибка геолокации')
    })
})
