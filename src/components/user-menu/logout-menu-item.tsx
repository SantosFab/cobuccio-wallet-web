'use client'

import { useTranslations } from 'next-intl'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from '@/i18n/navigation'

export function LogoutMenuItem() {
  const translate = useTranslations('UserMenu')
  const { logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return <DropdownMenuItem onSelect={handleLogout}>{translate('logout')}</DropdownMenuItem>
}
