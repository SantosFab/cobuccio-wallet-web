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

// Server-rendered markup never knows the user's stored theme (it lives in
// localStorage), so the first client render must match the server before
// switching to the real value — otherwise React flags a hydration mismatch.
function useHasMounted() {
  return useSyncExternalStore(subscribeToNothing, getHasMountedOnClient, getHasMountedOnServer)
}

function isThemeOption(value: string | undefined): value is ThemeOption {
  return THEME_ORDER.includes(value as ThemeOption)
}

function getNextTheme(current: ThemeOption): ThemeOption {
  const currentIndex = THEME_ORDER.indexOf(current)
  return THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length]
}

export function ThemeToggle() {
  const translate = useTranslations('ThemeToggle')
  const { theme, setTheme } = useTheme()
  const hasMounted = useHasMounted()

  const currentTheme: ThemeOption = hasMounted && isThemeOption(theme) ? theme : 'system'
  const nextTheme = getNextTheme(currentTheme)

  return (
    <Button
      type="button"
      variant="header"
      size="sm"
      onClick={() => setTheme(nextTheme)}
      disabled={!hasMounted}
      aria-label={translate('switchTo', { theme: translate(nextTheme) })}
      title={translate('switchTo', { theme: translate(nextTheme) })}
    >
      {translate(currentTheme)}
    </Button>
  )
}
