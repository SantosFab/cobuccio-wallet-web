interface ApiErrorBody {
  code?: string
  message?: string
}

interface ApiClientConfig<TErrorCode extends string> {
  serviceName: string
  errorCodeMap: Record<string, TErrorCode>
  ErrorClass: new (code: TErrorCode) => Error
  // Some errors are signaled by HTTP status alone, not by a `code` in the
  // body (e.g. a 429 from the throttler never carries one) — checked
  // before falling back to `errorCodeMap`.
  statusOverrides?: Partial<Record<number, TErrorCode>>
}

export function createApiClient<TErrorCode extends string>(config: ApiClientConfig<TErrorCode>) {
  async function handleErrorResponse(path: string, response: Response): Promise<never> {
    const body: ApiErrorBody = await response.json().catch(() => ({}))
    console.log(`[${config.serviceName}] - request rejected by the API`, {
      path,
      status: response.status,
      body,
    })

    const errorCode =
      config.statusOverrides?.[response.status] ??
      (body.code ? config.errorCodeMap[body.code] : undefined)

    if (errorCode) throw new config.ErrorClass(errorCode)
    throw new Error(body.message ?? `[${config.serviceName}] - request failed with status ${response.status}`)
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })

    if (!response.ok) return handleErrorResponse(path, response)

    return response.json() as Promise<T>
  }

  return { request, handleErrorResponse }
}
