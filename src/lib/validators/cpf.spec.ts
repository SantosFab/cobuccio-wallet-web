import { describe, expect, it } from 'vitest'

import { isValidCpf } from './cpf'

describe('isValidCpf', () => {
  it('accepts a real CPF with correct check digits', () => {
    expect(isValidCpf('52998224725')).toBe(true)
  })

  it('accepts the same CPF formatted with dots and a dash', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
  })

  it('rejects a CPF with a wrong check digit', () => {
    expect(isValidCpf('52998224726')).toBe(false)
  })

  it('rejects all-repeated-digit sequences, which pass the checksum but are never real', () => {
    expect(isValidCpf('11111111111')).toBe(false)
    expect(isValidCpf('00000000000')).toBe(false)
  })

  it('rejects a value with the wrong number of digits', () => {
    expect(isValidCpf('529982247')).toBe(false)
    expect(isValidCpf('529982247255')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isValidCpf('')).toBe(false)
  })
})
