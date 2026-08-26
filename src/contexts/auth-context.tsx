'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import {
  type CurrentUser,
  getCurrentUser,
  logout as logoutService,
  refreshSession,
} from '@/services/auth-service'
import { login as loginService } from '@/services/login-service'
import type { LoginFormOutput } from '@/lib/validations/login-schema'

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: CurrentUser }
  | { status: 'unauthenticated' }

interface AuthContextValue {
  state: AuthState
  login: (payload: LoginFormOutput) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Deliberately minimal: no generic fetch-with-retry-on-401 wrapper for
// every authenticated call yet (only /auth/me exists today), no cross-tab
// sync, no periodic proactive refresh — add those when an actual protected
// business route needs them, not preemptively.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    async function loadSession() {
      const user = await getCurrentUser()
      if (user) {
        setState({ status: 'authenticated', user })
        return
      }

      // The access token may have simply expired (short-lived on purpose)
      // while the refresh token is still valid — try to renew once before
      // concluding there's no session at all.
      const refreshed = await refreshSession()
      if (refreshed) {
        const retriedUser = await getCurrentUser()
        if (retriedUser) {
          setState({ status: 'authenticated', user: retriedUser })
          return
        }
      }

      setState({ status: 'unauthenticated' })
    }

    loadSession().catch(() => setState({ status: 'unauthenticated' }))
  }, [])

  async function handleLogin(payload: LoginFormOutput) {
    const user = await loginService(payload)
    setState({ status: 'authenticated', user })
  }

  async function handleLogout() {
    await logoutService()
    setState({ status: 'unauthenticated' })
  }

  return (
    <AuthContext.Provider value={{ state, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
