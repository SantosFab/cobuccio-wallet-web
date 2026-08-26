import type { SignupFormOutput } from '@/lib/validations/signup-schema'

export interface SignupResponse {
  id: string
  name: string
  email: string
}

export type SignupErrorCode = 'emailAlreadyRegistered' | 'cpfAlreadyRegistered'

// Maps the API's `code` (from a 409 ConflictException body) to the
// translation-ready codes this module exposes to the form.
const ERROR_CODE_BY_API_CODE: Record<string, SignupErrorCode> = {
  EMAIL_ALREADY_REGISTERED: 'emailAlreadyRegistered',
  CPF_ALREADY_REGISTERED: 'cpfAlreadyRegistered',
}

export class SignupServiceError extends Error {
  constructor(public readonly code: SignupErrorCode) {
    super(code)
  }
}

interface ApiErrorBody {
  code?: string
  message?: string
}

export async function signup(payload: SignupFormOutput): Promise<SignupResponse> {
  // `confirmPassword` only exists for client-side validation — the API's
  // CreateUserDto doesn't know it and rejects unknown fields with a 400.
  const createUserPayload = {
    name: payload.name,
    email: payload.email,
    cpf: payload.cpf,
    phone: payload.phone,
    address: payload.address,
    monthlyIncome: payload.monthlyIncome,
    password: payload.password,
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createUserPayload),
  })

  if (!response.ok) {
    const body: ApiErrorBody = await response.json().catch(() => ({}))
    const errorCode = body.code ? ERROR_CODE_BY_API_CODE[body.code] : undefined

    console.log('[signup-service] - signup rejected by the API', {
      status: response.status,
      body,
    })

    if (errorCode) throw new SignupServiceError(errorCode)
    throw new Error(body.message ?? `Signup failed with status ${response.status}`)
  }

  console.log('[signup-service] - signup succeeded')

  return response.json() as Promise<SignupResponse>
}
