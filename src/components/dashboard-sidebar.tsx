'use client'

import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', key: 'balance' },
  { href: '/dashboard/deposit', key: 'deposit' },
  { href: '/dashboard/transfer', key: 'transfer' },
  { href: '/dashboard/history', key: 'history' },
] as const

export function DashboardSidebar() {
  const translate = useTranslations('DashboardSidebar')
  const pathname = usePathname()

  return (
    <nav className="flex w-full flex-row gap-1 sm:flex-col">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-navy text-white dark:bg-white dark:text-navy'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800',
            )}
          >
            {translate(item.key)}
          </Link>
        )
      })}
    </nav>
  )
}
