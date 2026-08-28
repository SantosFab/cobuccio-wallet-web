import { describe, expect, it } from 'vitest'

import { isValidPhone } from './phone'

describe('isValidPhone', () => {
  it('accepts a masked mobile number (DDD + 9 digits, starting with 9)', () => {
    expect(isValidPhone('(11) 98765-4321')).toBe(true)
  })

  it('rejects a landline number (no leading 9 after the DDD)', () => {
    expect(isValidPhone('(11) 3765-4321')).toBe(false)
  })

  it('rejects an unmasked string, even with the right digits', () => {
    expect(isValidPhone('11987654321')).toBe(false)
  })

  it('rejects a number with too few digits', () => {
    expect(isValidPhone('(11) 9876-432')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isValidPhone('')).toBe(false)
  })
})
