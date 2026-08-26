'use client'

import { useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormField } from '@/components/form-field'
import { BRAZILIAN_STATES } from '@/lib/brazilian-states'
import { maskCep, maskCpf, maskCurrency, maskPhone } from '@/lib/masks'
import {
  createSignupSchema,
  type SignupFormInput,
  type SignupFormOutput,
} from '@/lib/validations/signup-schema'
import { CepNotFoundError, lookupAddressByCep } from '@/services/cep-service'
import { signup, SignupServiceError } from '@/services/signup-service'

const inputClassName =
  'rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100'

type SubmitState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

type AddressLookupStatus = 'idle' | 'loading' | 'not-found' | 'error'

export function SignupForm() {
  const translate = useTranslations('SignupForm')
  const translateErrors = useTranslations('SignupForm.errors')
  const translateStates = useTranslations('States')

  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })
  const [addressLookupStatus, setAddressLookupStatus] = useState<AddressLookupStatus>('idle')
  const latestZipCodeLookupRef = useRef('')

  const signupSchema = useMemo(() => createSignupSchema(translateErrors), [translateErrors])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInput, unknown, SignupFormOutput>({
    resolver: zodResolver(signupSchema),
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
    setSubmitState({ status: 'idle' })

    try {
      await signup(data)
      setSubmitState({ status: 'success' })
    } catch (error) {
      const message =
        error instanceof SignupServiceError
          ? translateErrors(error.code)
          : translate('genericError')

      setSubmitState({ status: 'error', message })
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

  if (submitState.status === 'success') {
    return (
      <div className="rounded-md border border-green-600/30 bg-green-600/10 p-6 text-center">
        <h2 className="text-lg font-semibold">{translate('success.title')}</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {translate('success.description')}
        </p>
      </div>
    )
  }

  // Registered outside `register(...)`'s onChange option so this event
  // handler is a plain JSX prop instead of a closure passed into a
  // render-time function call — the ref read inside `handleZipCodeChange`
  // then happens only when the event actually fires, not during render.
  const zipCodeField = register('address.zipCode')

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <legend className="text-base font-semibold">{translate('legends.personalData')}</legend>

        <FormField label={translate('fields.name')} htmlFor="name" error={errors.name?.message}>
          <input id="name" className={inputClassName} {...register('name')} />
        </FormField>

        <FormField label={translate('fields.email')} htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            className={inputClassName}
            {...register('email')}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={translate('fields.cpf')} htmlFor="cpf" error={errors.cpf?.message}>
            <input
              id="cpf"
              inputMode="numeric"
              placeholder={translate('placeholders.cpf')}
              className={inputClassName}
              {...register('cpf', {
                onChange: (event) => {
                  event.target.value = maskCpf(event.target.value)
                },
              })}
            />
          </FormField>

          <FormField label={translate('fields.phone')} htmlFor="phone" error={errors.phone?.message}>
            <input
              id="phone"
              inputMode="numeric"
              placeholder={translate('placeholders.phone')}
              className={inputClassName}
              {...register('phone', {
                onChange: (event) => {
                  event.target.value = maskPhone(event.target.value)
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
          <input
            id="monthlyIncome"
            inputMode="numeric"
            placeholder={translate('placeholders.monthlyIncome')}
            className={inputClassName}
            {...register('monthlyIncome', {
              onChange: (event) => {
                event.target.value = maskCurrency(event.target.value)
              },
            })}
          />
        </FormField>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-base font-semibold">{translate('legends.address')}</legend>

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <FormField
            label={translate('fields.zipCode')}
            htmlFor="address.zipCode"
            error={errors.address?.zipCode?.message}
          >
            <input
              id="address.zipCode"
              inputMode="numeric"
              placeholder={translate('placeholders.zipCode')}
              className={inputClassName}
              {...zipCodeField}
              onChange={(event) => {
                event.target.value = maskCep(event.target.value)
                zipCodeField.onChange(event)
                handleZipCodeChange(event.target.value)
              }}
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
            <select
              id="address.state"
              className={inputClassName}
              {...register('address.state')}
            >
              <option value="">{translate('fields.statePlaceholder')}</option>
              {BRAZILIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {translateStates(state)}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-[3fr_1fr]">
          <FormField
            label={translate('fields.street')}
            htmlFor="address.street"
            error={errors.address?.street?.message}
          >
            <input
              id="address.street"
              className={inputClassName}
              {...register('address.street')}
            />
          </FormField>

          <FormField
            label={translate('fields.number')}
            htmlFor="address.number"
            error={errors.address?.number?.message}
          >
            <input
              id="address.number"
              className={inputClassName}
              {...register('address.number')}
            />
          </FormField>
        </div>

        <FormField
          label={translate('fields.complement')}
          htmlFor="address.complement"
          error={errors.address?.complement?.message}
        >
          <input
            id="address.complement"
            className={inputClassName}
            {...register('address.complement')}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={translate('fields.neighborhood')}
            htmlFor="address.neighborhood"
            error={errors.address?.neighborhood?.message}
          >
            <input
              id="address.neighborhood"
              className={inputClassName}
              {...register('address.neighborhood')}
            />
          </FormField>

          <FormField
            label={translate('fields.city')}
            htmlFor="address.city"
            error={errors.address?.city?.message}
          >
            <input
              id="address.city"
              className={inputClassName}
              {...register('address.city')}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-base font-semibold">{translate('legends.security')}</legend>

        <FormField
          label={translate('fields.password')}
          htmlFor="password"
          error={errors.password?.message}
        >
          <input
            id="password"
            type="password"
            className={inputClassName}
            {...register('password')}
          />
        </FormField>

        <FormField
          label={translate('fields.confirmPassword')}
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <input
            id="confirmPassword"
            type="password"
            className={inputClassName}
            {...register('confirmPassword')}
          />
        </FormField>
      </fieldset>

      {submitState.status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">{submitState.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {isSubmitting ? translate('submit.submitting') : translate('submit.idle')}
      </button>
    </form>
  )
}
