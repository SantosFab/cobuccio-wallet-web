'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from '@/i18n/navigation'
import { toast } from '@/lib/toast-store'
import {
  createLoginSchema,
  type LoginFormInput,
  type LoginFormOutput,
} from '@/lib/validations/login-schema'
import { LoginServiceError } from '@/services/login-service'

export function LoginForm() {
  const translate = useTranslations('LoginForm')
  const translateErrors = useTranslations('LoginForm.errors')
  const translateSharedErrors = useTranslations('FormErrors')
  const { login } = useAuth()
  const router = useRouter()

  const loginSchema = useMemo(
    () => createLoginSchema(translateErrors, translateSharedErrors),
    [translateErrors, translateSharedErrors],
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInput, unknown, LoginFormOutput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginFormOutput) {
    try {
      await login(data)
      router.push('/dashboard')
    } catch (error) {
      const message =
        error instanceof LoginServiceError
          ? translateErrors(error.code)
          : translate('genericError')

      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FormField label={translate('fields.email')} htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" aria-invalid={!!errors.email} {...register('email')} />
      </FormField>

      <FormField
        label={translate('fields.password')}
        htmlFor="password"
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? translate('submit.submitting') : translate('submit.idle')}
      </Button>
    </form>
  )
}
