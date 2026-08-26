'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from '@/i18n/navigation'

// Minimal page just to close the login loop end-to-end — a real dashboard
// (balance, transactions) is a separate, future task.
export default function DashboardPage() {
  const translate = useTranslations('DashboardPage')
  const { state, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (state.status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [state.status, router])

  if (state.status !== 'authenticated') {
    return null
  }

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="font-serif text-3xl font-medium text-navy dark:text-white">
        {translate('welcome', { name: state.user.name })}
      </h1>
      <Button onClick={handleLogout} className="self-start">
        {translate('logout')}
      </Button>
    </main>
  )
}
