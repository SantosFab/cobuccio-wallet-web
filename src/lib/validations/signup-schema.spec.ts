import { describe, expect, it } from 'vitest'

import { createSignupSchema } from './signup-schema'

const translateErrors = ((key: string) => key) as unknown as Parameters<
  typeof createSignupSchema
>[0]
const translateSharedErrors = ((key: string) =>
  key) as unknown as Parameters<typeof createSignupSchema>[1]

const schema = createSignupSchema(translateErrors, translateSharedErrors)

function buildPayload(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    name: 'Ana Silva',
    email: 'ana@example.com',
    cpf: '529.982.247-25',
    phone: '(11) 98765-4321',
    address: {
      zipCode: '01310-100',
      street: 'Avenida Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
    monthlyIncome: 'R$ 3.500,00',
    password: 'Senha123',
    confirmPassword: 'Senha123',
    ...overrides,
  }
}

describe('createSignupSchema', () => {
  it('accepts a fully valid payload', () => {
    const result = schema.safeParse(buildPayload())

    expect(result.success).toBe(true)
  })

  it('rejects a name shorter than 3 characters', () => {
    const result = schema.safeParse(buildPayload({ name: 'Al' }))

    expect(result.success).toBe(false)
  })

  it('rejects an invalid CPF', () => {
    const result = schema.safeParse(buildPayload({ cpf: '11111111111' }))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('cpfInvalid')
  })

  it('rejects a password without an uppercase letter, lowercase letter or number', () => {
    const result = schema.safeParse(
      buildPayload({ password: 'lowercase', confirmPassword: 'lowercase' }),
    )

    expect(result.success).toBe(false)
  })

  it('rejects when the confirmation does not match the password, attaching the error to confirmPassword', () => {
    const result = schema.safeParse(
      buildPayload({ confirmPassword: 'Different123' }),
    )

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword'])
      expect(result.error.issues[0]?.message).toBe('passwordsDoNotMatch')
    }
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
