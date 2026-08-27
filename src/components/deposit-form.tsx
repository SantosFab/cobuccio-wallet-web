'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { maskCardExpiry, maskCardNumber, maskCurrency } from '@/lib/masks'
import {
  createDepositSchema,
  type DepositFormInput,
  type DepositFormOutput,
} from '@/lib/validations/deposit-schema'
import { deposit, WalletServiceError } from '@/services/wallet-service'

type SubmitState = { status: 'idle' } | { status: 'error'; message: string }

// Convenience only for local development — pre-fills Stripe's test card so
// there's nothing to type while testing the deposit flow. Never filled in
// production, where the field must come empty like any real form.
const CARD_DEFAULT_VALUES: Pick<DepositFormInput, 'cardNumber' | 'cardCvv' | 'cardExpiry'> =
  process.env.NODE_ENV === 'development'
    ? { cardNumber: '4242 4242 4242 4242', cardCvv: '123', cardExpiry: '12/30' }
    : { cardNumber: '', cardCvv: '', cardExpiry: '' }

export function DepositForm({ onSuccess }: { onSuccess: () => void }) {
  const translate = useTranslations('DepositForm')
  const translateErrors = useTranslations('DepositForm.errors')

  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })

  const depositSchema = useMemo(() => createDepositSchema(translateErrors), [translateErrors])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepositFormInput, unknown, DepositFormOutput>({
    resolver: zodResolver(depositSchema),
    mode: 'onTouched',
    defaultValues: { amount: '', ...CARD_DEFAULT_VALUES },
  })

  async function onSubmit(data: DepositFormOutput) {
    setSubmitState({ status: 'idle' })

    try {
      await deposit(data.amount, {
        cardNumber: data.cardNumber,
        cardCvv: data.cardCvv,
        cardExpiry: data.cardExpiry,
      })
      reset()
      onSuccess()
    } catch (error) {
      const message =
        error instanceof WalletServiceError
          ? translateErrors(error.code)
          : translate('genericError')

      setSubmitState({ status: 'error', message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField label={translate('fields.amount')} htmlFor="deposit-amount" error={errors.amount?.message}>
        <Input
          id="deposit-amount"
          inputMode="numeric"
          placeholder={translate('placeholders.amount')}
          aria-invalid={!!errors.amount}
          {...register('amount', {
            onChange: (event) => {
              setValue('amount', maskCurrency(event.target.value), { shouldValidate: true })
            },
          })}
        />
      </FormField>

      <FormField label={translate('fields.cardNumber')} htmlFor="deposit-card-number" error={errors.cardNumber?.message}>
        <Input
          id="deposit-card-number"
          inputMode="numeric"
          maxLength={19}
          placeholder={translate('placeholders.cardNumber')}
          aria-invalid={!!errors.cardNumber}
          {...register('cardNumber', {
            onChange: (event) => {
              setValue('cardNumber', maskCardNumber(event.target.value), { shouldValidate: true })
            },
          })}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={translate('fields.cardCvv')} htmlFor="deposit-card-cvv" error={errors.cardCvv?.message}>
          <Input
            id="deposit-card-cvv"
            inputMode="numeric"
            maxLength={3}
            placeholder={translate('placeholders.cardCvv')}
            aria-invalid={!!errors.cardCvv}
            {...register('cardCvv')}
          />
        </FormField>

        <FormField
          label={translate('fields.cardExpiry')}
          htmlFor="deposit-card-expiry"
          error={errors.cardExpiry?.message}
        >
          <Input
            id="deposit-card-expiry"
            inputMode="numeric"
            placeholder={translate('placeholders.cardExpiry')}
            aria-invalid={!!errors.cardExpiry}
            {...register('cardExpiry', {
              onChange: (event) => {
                setValue('cardExpiry', maskCardExpiry(event.target.value), { shouldValidate: true })
              },
            })}
          />
        </FormField>
      </div>

      {submitState.status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">{submitState.message}</p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? translate('submit.submitting') : translate('submit.idle')}
      </Button>
    </form>
  )
}
