import type { SignupFormOutput } from '@/lib/validations/signup-schema'

export interface SignupResponse {
  id: string
  name: string
  email: string
}

export type SignupErrorCode = 'emailAlreadyRegistered'

export class SignupServiceError extends Error {
  constructor(public readonly code: SignupErrorCode) {
    super(code)
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mocked signup call. Swap the body for a real `fetch` to the API
 * once the signup endpoint exists — the payload/response shape stays the same.
 * Throws `SignupServiceError` with a translation-ready code instead of a
 * hardcoded message, since this module can't call `useTranslations` itself.
 */
export async function signup(payload: SignupFormOutput): Promise<SignupResponse> {
  console.log('[signup-service] - submitting mocked signup payload', payload)

  await delay(1200)

  if (payload.email === 'existing@cobuccio.com') {
    console.log('[signup-service] - mocked conflict for existing email')
    throw new SignupServiceError('emailAlreadyRegistered')
  }

  console.log('[signup-service] - mocked signup succeeded')

  return {
    id: crypto.randomUUID(),
    name: payload.name,
    email: payload.email,
  }
}
