import { describe, expect, it } from 'vitest'

import { createAddressSchema } from './address-schema'

const translateErrors = ((key: string) => key) as unknown as Parameters<
  typeof createAddressSchema
>[0]

const schema = createAddressSchema(translateErrors)

function buildPayload(overrides: Partial<Record<string, string>> = {}) {
  return {
    zipCode: '01310-100',
    street: 'Avenida Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    ...overrides,
  }
}

describe('createAddressSchema', () => {
  it('accepts a valid payload and strips the CEP mask', () => {
    const result = schema.safeParse(buildPayload())

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.zipCode).toBe('01310100')
    }
  })

  it('accepts a payload without the optional complement', () => {
    const result = schema.safeParse(buildPayload())

    expect(result.success).toBe(true)
  })

  it('rejects a zip code without the 00000-000 mask', () => {
    const result = schema.safeParse(buildPayload({ zipCode: '01310100' }))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('zipCodeInvalid')
  })

  it('rejects a state that is not two uppercase letters', () => {
    const result = schema.safeParse(buildPayload({ state: 'sp' }))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('stateInvalid')
  })

  it('rejects an empty street', () => {
    const result = schema.safeParse(buildPayload({ street: '' }))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('streetRequired')
  })
})
