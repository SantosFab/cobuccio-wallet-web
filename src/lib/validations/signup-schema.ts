import type { useTranslations } from 'next-intl'
import { z as zod } from 'zod'

import { parseCurrencyToNumber } from '@/lib/masks'
import { isValidCpf } from '@/lib/validators/cpf'
import { isValidPhone } from '@/lib/validators/phone'

const CEP_REGEX = /^\d{5}-\d{3}$/
const UF_REGEX = /^[A-Z]{2}$/
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

type SignupErrorsTranslator = ReturnType<typeof useTranslations<'SignupForm.errors'>>

export function createSignupSchema(translateErrors: SignupErrorsTranslator) {
  const addressSchema = zod.object({
    zipCode: zod
      .string()
      .regex(CEP_REGEX, { message: translateErrors('zipCodeInvalid') })
      .transform((value) => value.replace(/\D/g, '')),
    street: zod.string().min(1, { message: translateErrors('streetRequired') }),
    number: zod.string().min(1, { message: translateErrors('numberRequired') }),
    complement: zod.string().optional(),
    neighborhood: zod.string().min(1, { message: translateErrors('neighborhoodRequired') }),
    city: zod.string().min(1, { message: translateErrors('cityRequired') }),
    state: zod.string().regex(UF_REGEX, { message: translateErrors('stateInvalid') }),
  })

  return zod
    .object({
      name: zod.string().min(3, { message: translateErrors('nameRequired') }),
      email: zod.email({ message: translateErrors('emailInvalid') }),
      cpf: zod
        .string()
        .refine(isValidCpf, { message: translateErrors('cpfInvalid') })
        .transform((value) => value.replace(/\D/g, '')),
      phone: zod
        .string()
        .refine(isValidPhone, { message: translateErrors('phoneInvalid') })
        .transform((value) => value.replace(/\D/g, '')),
      address: addressSchema,
      monthlyIncome: zod
        .string()
        .min(1, { message: translateErrors('monthlyIncomeRequired') })
        .transform(parseCurrencyToNumber)
        .refine((value) => value > 0, {
          message: translateErrors('monthlyIncomeInvalid'),
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
