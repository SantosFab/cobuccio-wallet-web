import type { LoginFormOutput } from '@/lib/validations/login-schema'

export interface LoginResponse {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export type LoginErrorCode = 'invalidCredentials' | 'tooManyAttempts'

const ERROR_CODE_BY_API_CODE: Record<string, LoginErrorCode> = {
  INVALID_CREDENTIALS: 'invalidCredentials',
}

export class LoginServiceError extends Error {
  constructor(public readonly code: LoginErrorCode) {
    super(code)
  }
}

interface ApiErrorBody {
  code?: string
  message?: string
}

export async function login(payload: LoginFormOutput): Promise<LoginResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Essential: without this, the browser ignores the Set-Cookie headers
    // the API responds with (access_token/refresh_token are httpOnly).
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body: ApiErrorBody = await response.json().catch(() => ({}))
    console.log('[login-service] - login rejected by the API', {
      status: response.status,
      body,
    })

    const errorCode =
      response.status === 429
        ? 'tooManyAttempts'
        : body.code
          ? ERROR_CODE_BY_API_CODE[body.code]
          : undefined

    if (errorCode) throw new LoginServiceError(errorCode)
    throw new Error(body.message ?? `Login failed with status ${response.status}`)
  }

  console.log('[login-service] - login succeeded')
  return response.json() as Promise<LoginResponse>
}
