'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormField } from '@/components/form-field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { BRAZILIAN_STATES } from '@/lib/brazilian-states'
import { getInitials } from '@/lib/get-initials'
import { formatCurrency, maskCep, maskCpf, maskCurrency, maskPhone } from '@/lib/masks'
import { toast } from '@/lib/toast-store'
import {
  createProfileSchema,
  type ProfileFormInput,
  type ProfileFormOutput,
} from '@/lib/validations/profile-schema'
import {
  getAvatarSrc,
  getMyProfile,
  removeMyAvatar,
  updateMyProfile,
  uploadMyAvatar,
  UsersServiceError,
  type UserProfile,
} from '@/services/users-service'

// Mirrors the backend's Multer config (Uploads.allowedAvatarMimeTypes /
// maxAvatarSizeBytes) so an invalid file is rejected before ever hitting
// the API — same principle already used for the deposit test card.
const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024

type LoadState = { status: 'loading' } | { status: 'loaded' } | { status: 'error' }
type AvatarActionState = 'idle' | 'uploading' | 'removing'

// name/cpf are shown but never submitted — the API has no way to change
// them, so they don't belong in the editable react-hook-form state.
interface ReadOnlyInfo {
  name: string
  cpf: string
}

// Shared by the initial load and by a successful save — both need to set
// react-hook-form's values (and dirty-comparison baseline) to the same
// masked shape the inputs actually display.
function toFormValues(profile: UserProfile): ProfileFormInput {
  return {
    email: profile.email,
    phone: maskPhone(profile.phone),
    monthlyIncome: formatCurrency(profile.monthlyIncome),
    address: {
      zipCode: maskCep(profile.address.zipCode),
      street: profile.address.street,
      number: profile.address.number,
      complement: profile.address.complement ?? '',
      neighborhood: profile.address.neighborhood,
      city: profile.address.city,
      state: profile.address.state,
    },
  }
}

export function ProfileForm() {
  const translate = useTranslations('ProfileForm')
  const translateErrors = useTranslations('FormErrors')
  const translateStates = useTranslations('States')
  const { state, updateUser } = useAuth()

  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [avatarActionState, setAvatarActionState] = useState<AvatarActionState>('idle')
  const [readOnlyInfo, setReadOnlyInfo] = useState<ReadOnlyInfo | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileSchema = useMemo(() => createProfileSchema(translateErrors), [translateErrors])

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      phone: '',
      monthlyIncome: '',
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

  useEffect(() => {
    let cancelled = false

    getMyProfile()
      .then((profile) => {
        if (cancelled) return

        setReadOnlyInfo({ name: profile.name, cpf: profile.cpf })
        reset(toFormValues(profile))
        setLoadState({ status: 'loaded' })
      })
      .catch(() => {
        if (cancelled) return
        setLoadState({ status: 'error' })
        toast.error(translate('genericError'))
      })

    return () => {
      cancelled = true
    }
  }, [reset, translate])

  async function onSubmit(data: ProfileFormOutput) {
    try {
      const updated = await updateMyProfile({
        email: data.email,
        phone: data.phone,
        monthlyIncome: data.monthlyIncome,
        address: data.address,
      })
      updateUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatarUrl: updated.avatarUrl,
      })
      // Establishes the just-saved values as the new dirty-comparison
      // baseline — without this, the button would stay enabled after a
      // successful save, since react-hook-form has no way to know these
      // values are no longer a pending change. Uses the masked shape
      // (like the initial load), not the raw zod output `data` — the
      // inputs display masked values, not the transformed ones.
      reset(toFormValues(updated))
      toast.success(translate('success'))
    } catch (error) {
      if (error instanceof UsersServiceError && error.code === 'emailAlreadyRegistered') {
        setError('email', { message: translateErrors('emailAlreadyRegistered') })
        return
      }
      toast.error(translate('genericError'))
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset so picking the exact same file again still fires onChange.
    event.target.value = ''
    if (!file) return

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
      toast.error(translate('avatar.unsupportedFileType'))
      return
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error(translate('avatar.fileTooLarge'))
      return
    }

    setAvatarActionState('uploading')

    try {
      const updated = await uploadMyAvatar(file)
      updateUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatarUrl: updated.avatarUrl,
      })
    } catch (error) {
      const message =
        error instanceof UsersServiceError && error.code === 'unsupportedFileType'
          ? translate('avatar.unsupportedFileType')
          : translate('avatar.error')
      toast.error(message)
    } finally {
      setAvatarActionState('idle')
    }
  }

  async function handleAvatarRemove() {
    setAvatarActionState('removing')

    try {
      const updated = await removeMyAvatar()
      updateUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatarUrl: updated.avatarUrl,
      })
    } catch {
      toast.error(translate('avatar.removeError'))
    } finally {
      setAvatarActionState('idle')
    }
  }

  const initials = getInitials(state.status === 'authenticated' ? state.user.name : '')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={state.status === 'authenticated' ? getAvatarSrc(state.user.avatarUrl) : undefined}
            alt=""
          />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={avatarActionState === 'uploading' || avatarActionState === 'removing'}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarActionState === 'uploading'
                ? translate('avatar.uploading')
                : translate('avatar.upload')}
            </Button>
            {state.status === 'authenticated' && state.user.avatarUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={avatarActionState === 'uploading' || avatarActionState === 'removing'}
                onClick={handleAvatarRemove}
              >
                {avatarActionState === 'removing'
                  ? translate('avatar.removing')
                  : translate('avatar.remove')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {loadState.status !== 'error' && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
          aria-busy={loadState.status === 'loading'}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={translate('fields.name')} htmlFor="name">
              <Input id="name" disabled value={readOnlyInfo?.name ?? ''} readOnly />
            </FormField>

            <FormField label={translate('fields.cpf')} htmlFor="cpf">
              <Input
                id="cpf"
                disabled
                readOnly
                value={readOnlyInfo ? maskCpf(readOnlyInfo.cpf) : ''}
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label={translate('fields.email')} htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                disabled={loadState.status === 'loading'}
                aria-invalid={!!errors.email}
                {...register('email')}
              />
            </FormField>

            <FormField label={translate('fields.phone')} htmlFor="phone" error={errors.phone?.message}>
              <Input
                id="phone"
                inputMode="numeric"
                placeholder={translate('placeholders.phone')}
                disabled={loadState.status === 'loading'}
                aria-invalid={!!errors.phone}
                {...register('phone', {
                  onChange: (event) => {
                    setValue('phone', maskPhone(event.target.value), { shouldValidate: true })
                  },
                })}
              />
            </FormField>

            <FormField
              label={translate('fields.monthlyIncome')}
              htmlFor="monthlyIncome"
              error={errors.monthlyIncome?.message}
            >
              <Input
                id="monthlyIncome"
                inputMode="numeric"
                placeholder={translate('placeholders.monthlyIncome')}
                disabled={loadState.status === 'loading'}
                aria-invalid={!!errors.monthlyIncome}
                {...register('monthlyIncome', {
                  onChange: (event) => {
                    setValue('monthlyIncome', maskCurrency(event.target.value), {
                      shouldValidate: true,
                    })
                  },
                })}
              />
            </FormField>
          </div>

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
                disabled={loadState.status === 'loading'}
                aria-invalid={!!errors.address?.zipCode}
                {...register('address.zipCode', {
                  onChange: (event) => {
                    setValue('address.zipCode', maskCep(event.target.value), {
                      shouldValidate: true,
                    })
                  },
                })}
              />
            </FormField>

            <FormField
              label={translate('fields.state')}
              htmlFor="address.state"
              error={errors.address?.state?.message}
            >
              <Select
                id="address.state"
                disabled={loadState.status === 'loading'}
                aria-invalid={!!errors.address?.state}
                {...register('address.state')}
              >
                <option value="">{translate('fields.statePlaceholder')}</option>
                {BRAZILIAN_STATES.map((option) => (
                  <option key={option} value={option}>
                    {translateStates(option)}
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
                disabled={loadState.status === 'loading'}
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
                disabled={loadState.status === 'loading'}
                aria-invalid={!!errors.address?.number}
                {...register('address.number')}
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              label={translate('fields.complement')}
              htmlFor="address.complement"
              error={errors.address?.complement?.message}
            >
              <Input
                id="address.complement"
                disabled={loadState.status === 'loading'}
                aria-invalid={!!errors.address?.complement}
                {...register('address.complement')}
              />
            </FormField>

            <FormField
              label={translate('fields.neighborhood')}
              htmlFor="address.neighborhood"
              error={errors.address?.neighborhood?.message}
            >
              <Input
                id="address.neighborhood"
                disabled={loadState.status === 'loading'}
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
                disabled={loadState.status === 'loading'}
                aria-invalid={!!errors.address?.city}
                {...register('address.city')}
              />
            </FormField>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || loadState.status === 'loading' || !isDirty}
          >
            {isSubmitting ? translate('submit.submitting') : translate('submit.idle')}
          </Button>
        </form>
      )}
    </div>
  )
}
