export interface CurrentUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

// Not authenticated is a normal outcome here, not an error — every page
// load needs to ask "is there a session?" without treating "no" as a
// failure.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    credentials: 'include',
  })

  if (response.status === 401) return null
  if (!response.ok) throw new Error(`[auth-service] - failed to load session: ${response.status}`)

  return response.json() as Promise<CurrentUser>
}

export async function refreshSession(): Promise<boolean> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  return response.ok
}

export async function logout(): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}
