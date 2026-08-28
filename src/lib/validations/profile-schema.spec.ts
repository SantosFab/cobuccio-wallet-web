import { describe, expect, it } from 'vitest'

import { createProfileSchema } from './profile-schema'

const translateErrors = ((key: string) => key) as unknown as Parameters<
  typeof createProfileSchema
>[0]

const schema = createProfileSchema(translateErrors)

function buildPayload(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    email: 'ana@example.com',
    phone: '(11) 98765-4321',
    monthlyIncome: 'R$ 3.500,00',
    address: {
      zipCode: '01310-100',
      street: 'Avenida Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
    ...overrides,
  }
}

describe('createProfileSchema', () => {
  it('accepts a fully valid payload', () => {
    const result = schema.safeParse(buildPayload())

    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = schema.safeParse(buildPayload({ email: 'not-an-email' }))

    expect(result.success).toBe(false)
  })

  it('rejects a phone that is not a masked mobile number', () => {
    const result = schema.safeParse(buildPayload({ phone: '11987654321' }))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('phoneInvalid')
  })

  it('rejects a monthly income of zero', () => {
    const result = schema.safeParse(
      buildPayload({ monthlyIncome: 'R$ 0,00' }),
    )

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('monthlyIncomeInvalid')
  })

  it('rejects an invalid nested address', () => {
    const result = schema.safeParse(
      buildPayload({
        address: {
          ...(buildPayload().address as object),
          zipCode: '01310100', // missing the 00000-000 mask
        },
      }),
    )

    expect(result.success).toBe(false)
    expect(
      result.error?.issues.some((issue) => issue.path.includes('zipCode')),
    ).toBe(true)
  })
})
