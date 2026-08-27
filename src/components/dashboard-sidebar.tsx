'use client'

import { useTranslations } from 'next-intl'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link, usePathname } from '@/i18n/navigation'
import { DASHBOARD_NAV_ITEMS } from '@/lib/dashboard-nav-items'
import { cn } from '@/lib/utils'

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function DashboardSidebar() {
  const translate = useTranslations('DashboardSidebar')
  const pathname = usePathname()
  const activeItem =
    DASHBOARD_NAV_ITEMS.find((item) => item.href === pathname) ?? DASHBOARD_NAV_ITEMS[0]

  return (
    <>
      {/* Mobile: a single dropdown showing the current section, instead of
          a row of links that used to wrap awkwardly on narrow screens. */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-foreground dark:border-neutral-700"
            >
              {translate(activeItem.key)}
              <ChevronDownIcon />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {DASHBOARD_NAV_ITEMS.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>{translate(item.key)}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* sm and up: the original vertical link list in the sidebar. */}
      <nav className="hidden flex-col gap-1 sm:flex">
        {DASHBOARD_NAV_ITEMS.map((item) => {
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
    </>
  )
}
