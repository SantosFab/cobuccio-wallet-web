import type { LoginFormOutput } from '@/lib/validations/login-schema'
import { createApiClient } from '@/services/http-client'

export interface LoginResponse {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export type LoginErrorCode = 'invalidCredentials' | 'tooManyAttempts'

export class LoginServiceError extends Error {
  constructor(public readonly code: LoginErrorCode) {
    super(code)
  }
}

const { request } = createApiClient<LoginErrorCode>({
  serviceName: 'login-service',
  errorCodeMap: { INVALID_CREDENTIALS: 'invalidCredentials' },
  ErrorClass: LoginServiceError,
  statusOverrides: { 429: 'tooManyAttempts' },
})

export async function login(payload: LoginFormOutput): Promise<LoginResponse> {
  const response = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  console.log('[login-service] - login succeeded')
  return response
}
