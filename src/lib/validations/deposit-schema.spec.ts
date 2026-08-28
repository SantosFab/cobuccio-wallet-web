import { describe, expect, it } from 'vitest'

import { createDepositSchema } from './deposit-schema'

// A stand-in for next-intl's translate function — returns the key itself,
// so assertions can check "which key fired" instead of a real message.
// Cast via the schema factory's own parameter type instead of importing
// next-intl's `useTranslations` generic, so this stays in sync with
// whatever shape the schema actually expects.
const translateErrors = ((key: string) => key) as unknown as Parameters<
  typeof createDepositSchema
>[0]

const schema = createDepositSchema(translateErrors)

function buildPayload(overrides: Partial<Record<string, string>> = {}) {
  return {
    amount: 'R$ 100,50',
    cardNumber: '4242 4242 4242 4242',
    cardCvv: '123',
    cardExpiry: '12/30',
    ...overrides,
  }
}

describe('createDepositSchema', () => {
  it('accepts a valid payload and parses the amount into a plain number', () => {
    const result = schema.safeParse(buildPayload())

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.amount).toBe(100.5)
    }
  })

  it('rejects an amount of zero', () => {
    const result = schema.safeParse(
      buildPayload({ amount: 'R$ 0,00' }),
    )

    expect(result.success).toBe(false)
  })

  it('rejects a card number other than the test card', () => {
    const result = schema.safeParse(
      buildPayload({ cardNumber: '1111 1111 1111 1111' }),
    )

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('cardNumberInvalid')
  })

  it('rejects a CVV that is not exactly 3 digits', () => {
    const result = schema.safeParse(buildPayload({ cardCvv: '12' }))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('cardCvvInvalid')
  })

  it('rejects an expired card', () => {
    const result = schema.safeParse(buildPayload({ cardExpiry: '01/20' }))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('cardExpiryInvalid')
  })

  it('accepts a card expiring at the end of the printed month', () => {
    const farFuture = String((new Date().getFullYear() + 5) % 100).padStart(
      2,
      '0',
    )
    const result = schema.safeParse(
      buildPayload({ cardExpiry: `12/${farFuture}` }),
    )

    expect(result.success).toBe(true)
  })

  it('rejects an empty amount with the "required" message, not "invalid"', () => {
    const result = schema.safeParse(buildPayload({ amount: '' }))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('amountRequired')
  })
})
