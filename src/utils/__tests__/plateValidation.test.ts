import { describe, it, expect } from 'vitest'
import { validatePlateNumber } from '../plateValidation'

describe('validatePlateNumber', () => {
  describe('valid plates', () => {
    it('accepts RF format: А123АА178', () => {
      expect(validatePlateNumber('А123АА178')).toBeNull()
    })

    it('accepts RF format with 2-digit region: А123АА78', () => {
      expect(validatePlateNumber('А123АА78')).toBeNull()
    })

    it('accepts BY current format: 1234AB7', () => {
      expect(validatePlateNumber('1234АВ7')).toBeNull()
    })

    it('accepts BY old format: 1234AB', () => {
      expect(validatePlateNumber('1234АВ')).toBeNull()
    })

    it('accepts empty string', () => {
      expect(validatePlateNumber('')).toBeNull()
    })

    it('normalizes lowercase to uppercase', () => {
      expect(validatePlateNumber('а123аа178')).toBeNull()
    })

    it('strips spaces', () => {
      expect(validatePlateNumber('А 123 АА 178')).toBeNull()
    })

    it('strips dashes', () => {
      expect(validatePlateNumber('А-123-АА-178')).toBeNull()
    })
  })

  describe('invalid plates', () => {
    it('rejects too short', () => {
      expect(validatePlateNumber('А12')).not.toBeNull()
    })

    it('rejects too long', () => {
      expect(validatePlateNumber('А123АБ1234')).not.toBeNull()
    })

    it('rejects digits only', () => {
      expect(validatePlateNumber('1234567')).not.toBeNull()
    })

    it('rejects letters only', () => {
      expect(validatePlateNumber('АБВГДЕ')).not.toBeNull()
    })

    it('rejects non-Cyrillic letters', () => {
      expect(validatePlateNumber('A123BC178')).not.toBeNull()
    })

    it('rejects invalid BY format (5 digits)', () => {
      expect(validatePlateNumber('12345АВ7')).not.toBeNull()
    })
  })
})
