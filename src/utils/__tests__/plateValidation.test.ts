import { describe, it, expect } from 'vitest'
import { validatePlateNumber } from '../plateValidation'

describe('validatePlateNumber', () => {
  describe('valid plates', () => {
    it('accepts RF format: А123АА178', () => {
      expect(validatePlateNumber('А123АА178')).toBeNull()
    })

    it('accepts BY format: 1234АВ7', () => {
      expect(validatePlateNumber('1234АВ7')).toBeNull()
    })

    it('accepts European format: AB-123-CD', () => {
      expect(validatePlateNumber('AB-123-CD')).toBeNull()
    })

    it('accepts plates with spaces', () => {
      expect(validatePlateNumber('AB 123 CD')).toBeNull()
    })

    it('accepts exactly 15 characters', () => {
      expect(validatePlateNumber('A'.repeat(15))).toBeNull()
    })

    it('trims surrounding spaces', () => {
      expect(validatePlateNumber('  AB-123-CD  ')).toBeNull()
    })
  })

  describe('invalid plates', () => {
    it('rejects empty string', () => {
      expect(validatePlateNumber('')).not.toBeNull()
    })

    it('rejects spaces only', () => {
      expect(validatePlateNumber('   ')).not.toBeNull()
    })

    it('rejects more than 15 characters', () => {
      expect(validatePlateNumber('A'.repeat(16))).not.toBeNull()
    })

    it('rejects control characters', () => {
      expect(validatePlateNumber('AB\tCD')).not.toBeNull()
    })
  })
})
