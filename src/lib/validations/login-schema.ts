import type { useTranslations } from 'next-intl'
import { z as zod } from 'zod'

import type { SharedErrorsTranslator } from './shared-errors'

type LoginErrorsTranslator = ReturnType<typeof useTranslations<'LoginForm.errors'>>

export function createLoginSchema(
  translateErrors: LoginErrorsTranslator,
  translateSharedErrors: SharedErrorsTranslator,
) {
  return zod.object({
    email: zod.email({ message: translateSharedErrors('emailInvalid') }),
    // No strength/complexity rule here — that's a signup-time rule. Login
    // just needs to know the field wasn't left empty.
    password: zod.string().min(1, { message: translateErrors('passwordRequired') }),
  })
}

export type LoginSchema = ReturnType<typeof createLoginSchema>
export type LoginFormInput = zod.input<LoginSchema>
export type LoginFormOutput = zod.output<LoginSchema>
