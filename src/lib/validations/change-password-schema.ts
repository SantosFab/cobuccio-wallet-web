import type { useTranslations } from 'next-intl'
import { z as zod } from 'zod'

import { STRONG_PASSWORD_REGEX } from './password'

type ChangePasswordErrorsTranslator = ReturnType<typeof useTranslations<'ChangePasswordForm.errors'>>

export function createChangePasswordSchema(translateErrors: ChangePasswordErrorsTranslator) {
  return zod
    .object({
      currentPassword: zod
        .string()
        .min(1, { message: translateErrors('currentPasswordRequired') }),
      newPassword: zod
        .string()
        .min(8, { message: translateErrors('passwordTooShort') })
        .regex(STRONG_PASSWORD_REGEX, { message: translateErrors('passwordWeak') }),
      confirmNewPassword: zod.string(),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: translateErrors('passwordsDoNotMatch'),
      path: ['confirmNewPassword'],
    })
}

export type ChangePasswordSchema = ReturnType<typeof createChangePasswordSchema>
export type ChangePasswordFormInput = zod.input<ChangePasswordSchema>
export type ChangePasswordFormOutput = zod.output<ChangePasswordSchema>
