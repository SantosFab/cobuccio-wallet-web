import { createApiClient } from '@/services/http-client'

export interface UserProfileAddress {
  zipCode: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
  monthlyIncome: string
  avatarUrl: string | null
  address: UserProfileAddress
}

export interface UpdateProfilePayload {
  email?: string
  phone?: string
  monthlyIncome?: number
  address?: {
    zipCode: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
  }
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export type UsersServiceErrorCode =
  | 'emailAlreadyRegistered'
  | 'unsupportedFileType'
  | 'invalidCurrentPassword'
  | 'newPasswordConfirmationMismatch'

export class UsersServiceError extends Error {
  constructor(public readonly code: UsersServiceErrorCode) {
    super(code)
  }
}

const { request, handleErrorResponse } = createApiClient<UsersServiceErrorCode>({
  serviceName: 'users-service',
  errorCodeMap: {
    EMAIL_ALREADY_REGISTERED: 'emailAlreadyRegistered',
    UNSUPPORTED_FILE_TYPE: 'unsupportedFileType',
    INVALID_CURRENT_PASSWORD: 'invalidCurrentPassword',
    NEW_PASSWORD_CONFIRMATION_MISMATCH: 'newPasswordConfirmationMismatch',
  },
  ErrorClass: UsersServiceError,
})

// avatarUrl is a path relative to the API (e.g. "/uploads/avatars/x.jpg"),
// not a full URL — <img src> needs it resolved against the API origin.
export function getAvatarSrc(avatarUrl: string | null): string | undefined {
  return avatarUrl ? `${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}` : undefined
}

export const getMyProfile = () => request<UserProfile>('/users/me')

export const updateMyProfile = (payload: UpdateProfilePayload) =>
  request<UserProfile>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

// Can't reuse the generic `request` above — it always sends a JSON
// Content-Type, which would break the multipart boundary the browser
// needs to set itself for FormData.
export async function uploadMyAvatar(file: File): Promise<UserProfile> {
  const formData = new FormData()
  formData.append('file', file)

  const path = '/users/me/avatar'
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) return handleErrorResponse(path, response)

  return response.json() as Promise<UserProfile>
}

export const removeMyAvatar = () =>
  request<UserProfile>('/users/me/avatar', { method: 'DELETE' })

export const changeMyPassword = (payload: ChangePasswordPayload) =>
  request<UserProfile>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
