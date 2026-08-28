import { describe, expect, it } from 'vitest'

import { createTransferSchema } from './transfer-schema'

const translateErrors = ((key: string) => key) as unknown as Parameters<
  typeof createTransferSchema
>[0]

const schema = createTransferSchema(translateErrors)

function buildPayload(overrides: Partial<Record<string, string>> = {}) {
  return {
    recipientIdentifier: 'ana@example.com',
    amount: 'R$ 50,00',
    ...overrides,
  }
}

describe('createTransferSchema', () => {
  it('accepts an email as the recipient identifier', () => {
    const result = schema.safeParse(buildPayload())

    expect(result.success).toBe(true)
  })

  it('accepts a valid CPF (formatted or not) as the recipient identifier', () => {
    const formatted = schema.safeParse(
      buildPayload({ recipientIdentifier: '529.982.247-25' }),
    )
    const digitsOnly = schema.safeParse(
      buildPayload({ recipientIdentifier: '52998224725' }),
    )

    expect(formatted.success).toBe(true)
    expect(digitsOnly.success).toBe(true)
  })

  it('rejects an invalid CPF as the recipient identifier', () => {
    const result = schema.safeParse(
      buildPayload({ recipientIdentifier: '11111111111' }),
    )

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('recipientInvalid')
  })

  it('rejects a malformed email as the recipient identifier', () => {
    const result = schema.safeParse(
      buildPayload({ recipientIdentifier: 'not-an-email@' }),
    )

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('recipientInvalid')
  })

  it('rejects an empty recipient identifier', () => {
    const result = schema.safeParse(
      buildPayload({ recipientIdentifier: '' }),
    )

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('recipientRequired')
  })

  it('rejects a non-positive amount', () => {
    const result = schema.safeParse(buildPayload({ amount: 'R$ 0,00' }))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('amountInvalid')
  })

  it('parses the amount into a plain number', () => {
    const result = schema.safeParse(buildPayload({ amount: 'R$ 1.234,56' }))

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.amount).toBe(1234.56)
    }
  })
})
