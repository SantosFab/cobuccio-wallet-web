import type { SignupFormOutput } from '@/lib/validations/signup-schema'
import { createApiClient } from '@/services/http-client'

export interface SignupResponse {
  id: string
  name: string
  email: string
}

export type SignupErrorCode = 'emailAlreadyRegistered' | 'cpfAlreadyRegistered'

export class SignupServiceError extends Error {
  constructor(public readonly code: SignupErrorCode) {
    super(code)
  }
}

const { request } = createApiClient<SignupErrorCode>({
  serviceName: 'signup-service',
  // Maps the API's `code` (from a 409 ConflictException body) to the
  // translation-ready codes this module exposes to the form.
  errorCodeMap: {
    EMAIL_ALREADY_REGISTERED: 'emailAlreadyRegistered',
    CPF_ALREADY_REGISTERED: 'cpfAlreadyRegistered',
  },
  ErrorClass: SignupServiceError,
})

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

  const response = await request<SignupResponse>('/users', {
    method: 'POST',
    body: JSON.stringify(createUserPayload),
  })

  console.log('[signup-service] - signup succeeded')
  return response
}
