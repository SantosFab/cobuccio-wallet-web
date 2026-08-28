import { describe, expect, it } from 'vitest'

import { getInitials } from './get-initials'

describe('getInitials', () => {
  it('takes the first letter of the first name and the last letter of the last surname', () => {
    expect(getInitials('Fabricio dos Santos')).toBe('FS')
  })

  it('is not the same as taking the first letter of the first two words', () => {
    // A regression test for the actual bug reported: "fd" (first letters
    // of "Fabricio" and "dos") instead of "FS".
    expect(getInitials('Fabricio dos Santos')).not.toBe('FD')
  })

  it('returns a single letter for a single-word name', () => {
    expect(getInitials('Madonna')).toBe('M')
  })

  it('returns an empty string for an empty name', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials('   ')).toBe('')
  })

  it('collapses repeated whitespace between words', () => {
    expect(getInitials('Beatriz   Nunes')).toBe('BS')
  })

  it('always returns uppercase letters, regardless of input casing', () => {
    expect(getInitials('beatriz nunes')).toBe('BS')
  })

  it('trims leading and trailing whitespace', () => {
    expect(getInitials('  Beatriz Nunes  ')).toBe('BS')
  })
})
