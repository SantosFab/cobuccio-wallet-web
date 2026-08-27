'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from '@/i18n/navigation'

export function HeaderLogoutButton() {
  const translate = useTranslations('DashboardPage')
  const { state, logout } = useAuth()
  const router = useRouter()

  if (state.status !== 'authenticated') return null

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <Button type="button" variant="header" size="sm" onClick={handleLogout}>
      {translate('logout')}
    </Button>
  )
}
