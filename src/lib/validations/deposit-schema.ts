import type { useTranslations } from 'next-intl'
import { z as zod } from 'zod'

import { parseCurrencyToNumber } from '@/lib/masks'
import { MAX_MONEY_VALUE } from './limits'

// Simulated payment gateway, not a real one — mirrors the backend's
// isValidTestCard() so the form can reject an invalid card before ever
// hitting the API. The only "accepted" card is Stripe's classic test
// number, 4242 4242 4242 4242.
const TEST_CARD_NUMBER = '4242424242424242'

function isFutureExpiry(expiry: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry)
  if (!match) return false

  const [, monthPart, yearPart] = match
  const month = Number(monthPart)
  if (month < 1 || month > 12) return false

  const expiresAt = new Date(2000 + Number(yearPart), month, 1)
  return expiresAt > new Date()
}

type DepositErrorsTranslator = ReturnType<typeof useTranslations<'DepositForm.errors'>>

export function createDepositSchema(translateErrors: DepositErrorsTranslator) {
  return zod.object({
    amount: zod
      .string()
      .min(1, { message: translateErrors('amountRequired') })
      .transform(parseCurrencyToNumber)
      .refine((value) => value > 0 && value <= MAX_MONEY_VALUE, {
        message: translateErrors('amountInvalid'),
      }),
    cardNumber: zod
      .string()
      .min(1, { message: translateErrors('cardNumberRequired') })
      .refine((value) => value.replace(/\D/g, '') === TEST_CARD_NUMBER, {
        message: translateErrors('cardNumberInvalid'),
      }),
    cardCvv: zod
      .string()
      .min(1, { message: translateErrors('cardCvvRequired') })
      .refine((value) => /^\d{3}$/.test(value), { message: translateErrors('cardCvvInvalid') }),
    cardExpiry: zod
      .string()
      .min(1, { message: translateErrors('cardExpiryRequired') })
      .refine((value) => isFutureExpiry(value), { message: translateErrors('cardExpiryInvalid') }),
  })
}

export type DepositSchema = ReturnType<typeof createDepositSchema>
export type DepositFormInput = zod.input<DepositSchema>
export type DepositFormOutput = zod.output<DepositSchema>
