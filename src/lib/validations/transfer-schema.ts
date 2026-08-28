import type { useTranslations } from 'next-intl'
import { z as zod } from 'zod'

import { parseCurrencyToNumber } from '@/lib/masks'
import { isValidCpf } from '@/lib/validators/cpf'
import { MAX_MONEY_VALUE } from './limits'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type TransferErrorsTranslator = ReturnType<typeof useTranslations<'TransferForm.errors'>>

export function createTransferSchema(translateErrors: TransferErrorsTranslator) {
  return zod.object({
    // Accepts either an email or a CPF — kept as one free-text field
    // (no input mask) since the two formats look nothing alike.
    recipientIdentifier: zod
      .string()
      .min(1, { message: translateErrors('recipientRequired') })
      .transform((value) => (value.includes('@') ? value.trim() : value.replace(/\D/g, '')))
      .refine((value) => (value.includes('@') ? EMAIL_REGEX.test(value) : isValidCpf(value)), {
        message: translateErrors('recipientInvalid'),
      }),
    amount: zod
      .string()
      .min(1, { message: translateErrors('amountRequired') })
      .transform(parseCurrencyToNumber)
      .refine((value) => value > 0 && value <= MAX_MONEY_VALUE, {
        message: translateErrors('amountInvalid'),
      }),
  })
}

export type TransferSchema = ReturnType<typeof createTransferSchema>
export type TransferFormInput = zod.input<TransferSchema>
export type TransferFormOutput = zod.output<TransferSchema>
