'use client'

import { useTranslations } from 'next-intl'

import { usePathname } from '@/i18n/navigation'
import { DASHBOARD_NAV_ITEMS } from '@/lib/dashboard-nav-items'

// Shows the current dashboard section's name in the navbar instead of
// each page repeating its own <h1> — nothing renders outside the
// dashboard routes (login, signup, etc).
export function HeaderPageTitle() {
  const translate = useTranslations('DashboardPage')
  const pathname = usePathname()

  const activeItem = DASHBOARD_NAV_ITEMS.find((item) => item.href === pathname)
  if (!activeItem) return null

  return (
    <span className="hidden text-sm font-medium text-white/80 sm:inline">
      {translate(`sections.${activeItem.key}`)}
    </span>
  )
}
