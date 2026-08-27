'use client'

import { useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from '@/i18n/navigation'
import { BRAZILIAN_STATES } from '@/lib/brazilian-states'
import { maskCep, maskCpf, maskCurrency, maskPhone } from '@/lib/masks'
import { toast } from '@/lib/toast-store'
import {
  createSignupSchema,
  type SignupFormInput,
  type SignupFormOutput,
} from '@/lib/validations/signup-schema'
import { CepNotFoundError, lookupAddressByCep } from '@/services/cep-service'
import { signup, SignupServiceError } from '@/services/signup-service'

type AddressLookupStatus = 'idle' | 'loading' | 'not-found' | 'error'

export function SignupForm() {
  const translate = useTranslations('SignupForm')
  const translateErrors = useTranslations('SignupForm.errors')
  const translateSharedErrors = useTranslations('FormErrors')
  const translateStates = useTranslations('States')
  const { login } = useAuth()
  const router = useRouter()

  const [addressLookupStatus, setAddressLookupStatus] = useState<AddressLookupStatus>('idle')
  const latestZipCodeLookupRef = useRef('')

  const signupSchema = useMemo(
    () => createSignupSchema(translateErrors, translateSharedErrors),
    [translateErrors, translateSharedErrors],
  )

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInput, unknown, SignupFormOutput>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      cpf: '',
      phone: '',
      monthlyIncome: '',
      password: '',
      confirmPassword: '',
      address: {
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
      },
    },
  })

  async function onSubmit(data: SignupFormOutput) {
    try {
      await signup(data)
    } catch (error) {
      if (error instanceof SignupServiceError) {
        if (error.code === 'emailAlreadyRegistered') {
          setError('email', { message: translateSharedErrors('emailAlreadyRegistered') })
        } else {
          setError('cpf', { message: translateErrors('cpfAlreadyRegistered') })
        }
        return
      }

      toast.error(translate('genericError'))
      return
    }

    try {
      // The account already exists at this point — a failure here only
      // means the automatic login didn't work, not that signup failed.
      await login({ email: data.email, password: data.password })
      router.push('/dashboard')
    } catch {
      router.push('/login')
    }
  }

  async function handleZipCodeChange(maskedZipCode: string) {
    const zipCodeDigits = maskedZipCode.replace(/\D/g, '')

    if (zipCodeDigits.length !== 8) {
      setAddressLookupStatus('idle')
      return
    }

    latestZipCodeLookupRef.current = zipCodeDigits
    setAddressLookupStatus('loading')

    try {
      const address = await lookupAddressByCep(zipCodeDigits)

      if (latestZipCodeLookupRef.current !== zipCodeDigits) return

      setValue('address.street', address.street, { shouldValidate: true })
      setValue('address.neighborhood', address.neighborhood, { shouldValidate: true })
      setValue('address.city', address.city, { shouldValidate: true })
      setValue('address.state', address.state, { shouldValidate: true })
      setAddressLookupStatus('idle')
    } catch (error) {
      if (latestZipCodeLookupRef.current !== zipCodeDigits) return

      setAddressLookupStatus(error instanceof CepNotFoundError ? 'not-found' : 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <legend className="border-l-2 border-gold pl-2 text-base font-semibold">
          {translate('legends.personalData')}
        </legend>

        <FormField label={translate('fields.name')} htmlFor="name" error={errors.name?.message}>
          <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
        </FormField>

        <FormField label={translate('fields.email')} htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" aria-invalid={!!errors.email} {...register('email')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={translate('fields.cpf')} htmlFor="cpf" error={errors.cpf?.message}>
            <Input
              id="cpf"
              inputMode="numeric"
              placeholder={translate('placeholders.cpf')}
              aria-invalid={!!errors.cpf}
              {...register('cpf', {
                onChange: (event) => {
                  // Mutating event.target.value here would only fix what's
                  // on screen — RHF already captured the raw value into its
                  // internal state before this callback runs, so setValue
                  // is what actually corrects the value used for validation.
                  // shouldValidate is required too: RHF compares the value it
                  // captured for this event against the current one before
                  // applying a validation result, and since we just changed
                  // it ourselves, that guard silently drops the result —
                  // shouldValidate runs a fresh, independent validation pass.
                  setValue('cpf', maskCpf(event.target.value), { shouldValidate: true })
                },
              })}
            />
          </FormField>

          <FormField label={translate('fields.phone')} htmlFor="phone" error={errors.phone?.message}>
            <Input
              id="phone"
              inputMode="numeric"
              placeholder={translate('placeholders.phone')}
              aria-invalid={!!errors.phone}
              {...register('phone', {
                onChange: (event) => {
                  setValue('phone', maskPhone(event.target.value), { shouldValidate: true })
                },
              })}
            />
          </FormField>
        </div>

        <FormField
          label={translate('fields.monthlyIncome')}
          htmlFor="monthlyIncome"
          error={errors.monthlyIncome?.message}
        >
          <Input
            id="monthlyIncome"
            inputMode="numeric"
            placeholder={translate('placeholders.monthlyIncome')}
            aria-invalid={!!errors.monthlyIncome}
            {...register('monthlyIncome', {
              onChange: (event) => {
                setValue('monthlyIncome', maskCurrency(event.target.value), { shouldValidate: true })
              },
            })}
          />
        </FormField>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="border-l-2 border-gold pl-2 text-base font-semibold">
          {translate('legends.address')}
        </legend>

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <FormField
            label={translate('fields.zipCode')}
            htmlFor="address.zipCode"
            error={errors.address?.zipCode?.message}
          >
            <Input
              id="address.zipCode"
              inputMode="numeric"
              placeholder={translate('placeholders.zipCode')}
              aria-invalid={!!errors.address?.zipCode}
              {...register('address.zipCode', {
                onChange: (event) => {
                  const maskedZipCode = maskCep(event.target.value)
                  setValue('address.zipCode', maskedZipCode, { shouldValidate: true })
                  handleZipCodeChange(maskedZipCode)
                },
              })}
            />
            {addressLookupStatus === 'loading' && (
              <p className="text-sm text-neutral-500">{translate('addressLookup.loading')}</p>
            )}
            {addressLookupStatus === 'not-found' && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {translate('addressLookup.notFound')}
              </p>
            )}
            {addressLookupStatus === 'error' && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {translate('addressLookup.error')}
              </p>
            )}
          </FormField>

          <FormField
            label={translate('fields.state')}
            htmlFor="address.state"
            error={errors.address?.state?.message}
          >
            <Select
              id="address.state"
              aria-invalid={!!errors.address?.state}
              {...register('address.state')}
            >
              <option value="">{translate('fields.statePlaceholder')}</option>
              {BRAZILIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {translateStates(state)}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-[3fr_1fr]">
          <FormField
            label={translate('fields.street')}
            htmlFor="address.street"
            error={errors.address?.street?.message}
          >
            <Input
              id="address.street"
              aria-invalid={!!errors.address?.street}
              {...register('address.street')}
            />
          </FormField>

          <FormField
            label={translate('fields.number')}
            htmlFor="address.number"
            error={errors.address?.number?.message}
          >
            <Input
              id="address.number"
              aria-invalid={!!errors.address?.number}
              {...register('address.number')}
            />
          </FormField>
        </div>

        <FormField
          label={translate('fields.complement')}
          htmlFor="address.complement"
          error={errors.address?.complement?.message}
        >
          <Input
            id="address.complement"
            aria-invalid={!!errors.address?.complement}
            {...register('address.complement')}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={translate('fields.neighborhood')}
            htmlFor="address.neighborhood"
            error={errors.address?.neighborhood?.message}
          >
            <Input
              id="address.neighborhood"
              aria-invalid={!!errors.address?.neighborhood}
              {...register('address.neighborhood')}
            />
          </FormField>

          <FormField
            label={translate('fields.city')}
            htmlFor="address.city"
            error={errors.address?.city?.message}
          >
            <Input
              id="address.city"
              aria-invalid={!!errors.address?.city}
              {...register('address.city')}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="border-l-2 border-gold pl-2 text-base font-semibold">
          {translate('legends.security')}
        </legend>

        <FormField
          label={translate('fields.password')}
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            aria-invalid={!!errors.password}
            {...register('password', {
              onChange: () => {
                // Fixing the password itself won't auto re-validate
                // confirmPassword's cross-field "match" check on its own,
                // since RHF only revalidates a field on change once that
                // same field already has an error.
                trigger('confirmPassword')
              },
            })}
          />
        </FormField>

        <FormField
          label={translate('fields.confirmPassword')}
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </FormField>
      </fieldset>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? translate('submit.submitting') : translate('submit.idle')}
      </Button>
    </form>
  )
}
