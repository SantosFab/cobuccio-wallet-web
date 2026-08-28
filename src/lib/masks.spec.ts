import { describe, expect, it } from 'vitest'

import {
  formatCurrency,
  maskCardExpiry,
  maskCardNumber,
  maskCep,
  maskCpf,
  maskCurrency,
  maskPhone,
  parseCurrencyToNumber,
} from './masks'

describe('maskCpf', () => {
  it('formats digits as 000.000.000-00', () => {
    expect(maskCpf('52998224725')).toBe('529.982.247-25')
  })

  it('formats a partial CPF as the user types', () => {
    expect(maskCpf('529')).toBe('529')
    expect(maskCpf('5299822')).toBe('529.982.2')
  })

  it('strips non-digit characters and ignores anything past 11 digits', () => {
    expect(maskCpf('529.982.247-25999')).toBe('529.982.247-25')
  })
})

describe('maskPhone', () => {
  it('formats digits as (00) 00000-0000', () => {
    expect(maskPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('formats a partial number as the user types', () => {
    expect(maskPhone('119')).toBe('(11) 9')
  })
})

describe('maskCep', () => {
  it('formats digits as 00000-000', () => {
    expect(maskCep('01310100')).toBe('01310-100')
  })
})

describe('maskCardExpiry', () => {
  it('formats digits as MM/YY', () => {
    expect(maskCardExpiry('1230')).toBe('12/30')
  })

  it('ignores anything past 4 digits', () => {
    expect(maskCardExpiry('123099')).toBe('12/30')
  })
})

describe('maskCardNumber', () => {
  it('groups digits in blocks of 4', () => {
    expect(maskCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
  })

  it('ignores anything past 16 digits', () => {
    expect(maskCardNumber('42424242424242429999')).toBe(
      '4242 4242 4242 4242',
    )
  })
})

describe('maskCurrency', () => {
  it('treats the digits as cents and formats as BRL', () => {
    expect(maskCurrency('10050')).toBe('R$ 100,50')
  })

  it('returns an empty string when there are no digits', () => {
    expect(maskCurrency('')).toBe('')
    expect(maskCurrency('abc')).toBe('')
  })
})

describe('parseCurrencyToNumber', () => {
  it('converts a masked currency string back into a plain number', () => {
    expect(parseCurrencyToNumber('R$ 100,50')).toBe(100.5)
  })

  it('returns 0 when there are no digits', () => {
    expect(parseCurrencyToNumber('')).toBe(0)
  })
})

describe('formatCurrency', () => {
  it('formats a decimal string as BRL', () => {
    expect(formatCurrency('1234.56')).toBe('R$ 1.234,56')
  })
})
