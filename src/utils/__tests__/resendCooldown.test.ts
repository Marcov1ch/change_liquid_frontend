import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildResendCooldownKey,
  getRemainingSeconds,
  readResendCooldown,
  startResendCooldown,
} from '../resendCooldown'

const KEY = 'email-verification-resend:1:user@example.com'

describe('resendCooldown', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('builds a key scoped to user and email', () => {
    expect(buildResendCooldownKey(1, 'user@example.com')).toBe(KEY)
  })

  it('stores and reads an active cooldown', () => {
    const until = startResendCooldown(KEY, 60, 1000)

    expect(until).toBe(61000)
    expect(readResendCooldown(KEY, 1000)).toBe(61000)
  })

  it('removes an expired cooldown', () => {
    startResendCooldown(KEY, 60, 1000)

    expect(readResendCooldown(KEY, 61001)).toBe(0)
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('ignores malformed stored values', () => {
    localStorage.setItem(KEY, 'not-a-number')

    expect(readResendCooldown(KEY, 1000)).toBe(0)
  })

  it('returns zero when cooldown is over', () => {
    expect(getRemainingSeconds(1000, 5000)).toBe(0)
  })

  it('rounds remaining time up to whole seconds', () => {
    expect(getRemainingSeconds(1100, 1000)).toBe(1)
    expect(getRemainingSeconds(1500, 1000)).toBe(1)
    expect(getRemainingSeconds(2000, 1000)).toBe(1)
    expect(getRemainingSeconds(2001, 1000)).toBe(2)
  })
})
