'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

const THEME_ORDER = ['system', 'light', 'dark'] as const

type ThemeOption = (typeof THEME_ORDER)[number]

function subscribeToNothing() {
  return () => {}
}

function getHasMountedOnClient() {
  return true
}

function getHasMountedOnServer() {
  return false
}

/**
 * Server-rendered markup never knows the user's stored theme, so the first
 * client render must match the server before switching to the real value.
 * `useSyncExternalStore` (unlike `useState` + `useEffect`) reports that
 * client/server difference without triggering React's "setState in an
 * effect causes cascading renders" lint rule.
 */
function useHasMounted() {
  return useSyncExternalStore(subscribeToNothing, getHasMountedOnClient, getHasMountedOnServer)
}

function isThemeOption(value: string | undefined): value is ThemeOption {
  return THEME_ORDER.includes(value as ThemeOption)
}

function getNextTheme(currentTheme: ThemeOption): ThemeOption {
  const currentIndex = THEME_ORDER.indexOf(currentTheme)
  return THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length]
}

function SunIcon() {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}

function SystemIcon() {
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
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 20h8M12 17v3" />
    </svg>
  )
}

const THEME_ICONS: Record<ThemeOption, typeof SunIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  system: SystemIcon,
}

export function ThemeToggle() {
  const translate = useTranslations('ThemeToggle')
  const { theme, setTheme } = useTheme()
  const hasMounted = useHasMounted()

  const currentTheme: ThemeOption = hasMounted && isThemeOption(theme) ? theme : 'system'
  const nextTheme = getNextTheme(currentTheme)
  const Icon = THEME_ICONS[currentTheme]

  return (
    <Button
      type="button"
      variant="header"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      disabled={!hasMounted}
      aria-label={translate('switchTo', { theme: translate(nextTheme) })}
      title={translate('current', { theme: translate(currentTheme) })}
    >
      <Icon />
    </Button>
  )
}
