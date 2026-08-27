'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { maskCurrency } from '@/lib/masks'
import { toast } from '@/lib/toast-store'
import {
  createTransferSchema,
  type TransferFormInput,
  type TransferFormOutput,
} from '@/lib/validations/transfer-schema'
import { transfer, WalletServiceError } from '@/services/wallet-service'

export function TransferForm({ onSuccess }: { onSuccess: () => void }) {
  const translate = useTranslations('TransferForm')
  const translateErrors = useTranslations('TransferForm.errors')

  const transferSchema = useMemo(() => createTransferSchema(translateErrors), [translateErrors])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormInput, unknown, TransferFormOutput>({
    resolver: zodResolver(transferSchema),
    mode: 'onTouched',
    defaultValues: { recipientIdentifier: '', amount: '' },
  })

  async function onSubmit(data: TransferFormOutput) {
    try {
      await transfer(data.recipientIdentifier, data.amount)
      reset()
      onSuccess()
    } catch (error) {
      const message =
        error instanceof WalletServiceError
          ? translateErrors(error.code)
          : translate('genericError')

      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        label={translate('fields.recipientIdentifier')}
        htmlFor="transfer-recipient-identifier"
        error={errors.recipientIdentifier?.message}
      >
        <Input
          id="transfer-recipient-identifier"
          placeholder={translate('placeholders.recipientIdentifier')}
          aria-invalid={!!errors.recipientIdentifier}
          {...register('recipientIdentifier')}
        />
      </FormField>

      <FormField label={translate('fields.amount')} htmlFor="transfer-amount" error={errors.amount?.message}>
        <Input
          id="transfer-amount"
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? translate('submit.submitting') : translate('submit.idle')}
      </Button>
    </form>
  )
}
