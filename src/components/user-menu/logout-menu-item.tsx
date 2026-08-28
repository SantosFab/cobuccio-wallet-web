'use client'

import { useTranslations } from 'next-intl'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from '@/i18n/navigation'
import { toast } from '@/lib/toast-store'

export function LogoutMenuItem() {
  const translate = useTranslations('UserMenu')
  const { logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      // Local state stays 'authenticated' here on purpose — the API call
      // failed, so the session cookies are still valid server-side, and
      // navigating to /login would misrepresent that as a real logout.
      console.error('[logout-menu-item] - failed to log out.', error)
      toast.error(translate('logoutError'))
    }
  }

  return <DropdownMenuItem onSelect={handleLogout}>{translate('logout')}</DropdownMenuItem>
}
