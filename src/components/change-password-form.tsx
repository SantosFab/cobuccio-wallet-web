'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createChangePasswordSchema,
  type ChangePasswordFormInput,
  type ChangePasswordFormOutput,
} from '@/lib/validations/change-password-schema'
import { changeMyPassword, UsersServiceError } from '@/services/users-service'

type SubmitState = { status: 'idle' } | { status: 'error'; message: string } | { status: 'success' }

export function ChangePasswordForm() {
  const translate = useTranslations('ChangePasswordForm')
  const translateErrors = useTranslations('ChangePasswordForm.errors')

  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })

  const changePasswordSchema = useMemo(
    () => createChangePasswordSchema(translateErrors),
    [translateErrors],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormInput, unknown, ChangePasswordFormOutput>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  })

  async function onSubmit(data: ChangePasswordFormOutput) {
    setSubmitState({ status: 'idle' })

    try {
      await changeMyPassword(data)
      reset()
      setSubmitState({ status: 'success' })
    } catch (error) {
      const message =
        error instanceof UsersServiceError && error.code === 'invalidCurrentPassword'
          ? translateErrors('invalidCurrentPassword')
          : translate('genericError')
      setSubmitState({ status: 'error', message })
    }
  }

  return (
    <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {translate('title')}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField
          label={translate('fields.currentPassword')}
          htmlFor="currentPassword"
          error={errors.currentPassword?.message}
        >
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.currentPassword}
            {...register('currentPassword')}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={translate('fields.newPassword')}
            htmlFor="newPassword"
            error={errors.newPassword?.message}
          >
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.newPassword}
              {...register('newPassword')}
            />
          </FormField>

          <FormField
            label={translate('fields.confirmNewPassword')}
            htmlFor="confirmNewPassword"
            error={errors.confirmNewPassword?.message}
          >
            <Input
              id="confirmNewPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmNewPassword}
              {...register('confirmNewPassword')}
            />
          </FormField>
        </div>

        {submitState.status === 'error' && (
          <p className="text-sm text-red-600 dark:text-red-400">{submitState.message}</p>
        )}
        {submitState.status === 'success' && (
          <p className="text-sm text-green-600 dark:text-green-400">{translate('success')}</p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? translate('submit.submitting') : translate('submit.idle')}
        </Button>
      </form>
    </div>
  )
}
