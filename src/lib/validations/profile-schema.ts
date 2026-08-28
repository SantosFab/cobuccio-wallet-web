import { z as zod } from 'zod'

import { parseCurrencyToNumber } from '@/lib/masks'
import { isValidPhone } from '@/lib/validators/phone'
import { createAddressSchema } from './address-schema'
import { MAX_MONEY_VALUE } from './limits'
import type { SharedErrorsTranslator } from './shared-errors'

export function createProfileSchema(translateErrors: SharedErrorsTranslator) {
  return zod.object({
    email: zod.email({ message: translateErrors('emailInvalid') }),
    phone: zod
      .string()
      .refine(isValidPhone, { message: translateErrors('phoneInvalid') })
      .transform((value) => value.replace(/\D/g, '')),
    monthlyIncome: zod
      .string()
      .min(1, { message: translateErrors('monthlyIncomeRequired') })
      .transform(parseCurrencyToNumber)
      .refine((value) => value > 0 && value <= MAX_MONEY_VALUE, {
        message: translateErrors('monthlyIncomeInvalid'),
      }),
    address: createAddressSchema(translateErrors),
  })
}

export type ProfileSchema = ReturnType<typeof createProfileSchema>
export type ProfileFormInput = zod.input<ProfileSchema>
export type ProfileFormOutput = zod.output<ProfileSchema>
