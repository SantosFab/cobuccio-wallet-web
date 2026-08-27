import type { useTranslations } from 'next-intl'
import { z as zod } from 'zod'

import { parseCurrencyToNumber } from '@/lib/masks'
import { isValidCpf } from '@/lib/validators/cpf'
import { isValidPhone } from '@/lib/validators/phone'
import { createAddressSchema } from './address-schema'
import type { SharedErrorsTranslator } from './shared-errors'

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

type SignupErrorsTranslator = ReturnType<typeof useTranslations<'SignupForm.errors'>>

export function createSignupSchema(
  translateErrors: SignupErrorsTranslator,
  translateSharedErrors: SharedErrorsTranslator,
) {
  const addressSchema = createAddressSchema(translateSharedErrors)

  return zod
    .object({
      name: zod.string().min(3, { message: translateErrors('nameRequired') }),
      email: zod.email({ message: translateSharedErrors('emailInvalid') }),
      cpf: zod
        .string()
        .refine(isValidCpf, { message: translateErrors('cpfInvalid') })
        .transform((value) => value.replace(/\D/g, '')),
      phone: zod
        .string()
        .refine(isValidPhone, { message: translateSharedErrors('phoneInvalid') })
        .transform((value) => value.replace(/\D/g, '')),
      address: addressSchema,
      monthlyIncome: zod
        .string()
        .min(1, { message: translateSharedErrors('monthlyIncomeRequired') })
        .transform(parseCurrencyToNumber)
        .refine((value) => value > 0, {
          message: translateSharedErrors('monthlyIncomeInvalid'),
        }),
      password: zod
        .string()
        .min(8, { message: translateErrors('passwordTooShort') })
        .regex(STRONG_PASSWORD_REGEX, {
          message: translateErrors('passwordWeak'),
        }),
      confirmPassword: zod.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: translateErrors('passwordsDoNotMatch'),
      path: ['confirmPassword'],
    })
}

export type SignupSchema = ReturnType<typeof createSignupSchema>
export type SignupFormInput = zod.input<SignupSchema>
export type SignupFormOutput = zod.output<SignupSchema>
