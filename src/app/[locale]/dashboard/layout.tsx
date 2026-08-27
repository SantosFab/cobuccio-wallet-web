'use client'

import { useEffect, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from '@/i18n/navigation'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const translate = useTranslations('DashboardPage')
  const { state } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (state.status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [state.status, router])

  if (state.status !== 'authenticated') {
    return null
  }

  return (
    <main className="flex h-[calc(100vh-4rem)] w-full flex-col sm:flex-row">
      <aside className="flex flex-col gap-4 border-neutral-200 px-4 py-8 dark:border-neutral-800 sm:w-56 sm:shrink-0 sm:border-r">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {translate('welcome', { name: state.user.name })}
        </p>

        <DashboardSidebar />
      </aside>

      <div className="min-h-0 flex-1 px-4 py-8">
        <div className="mx-auto flex h-full w-full max-w-xl flex-col overflow-y-auto">{children}</div>
      </div>
    </main>
  )
}
