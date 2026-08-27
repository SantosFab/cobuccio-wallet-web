'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'

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

// Same rationale as the old theme-toggle.tsx: server-rendered markup
// never knows the user's stored theme, so the first client render must
// match the server before switching to the real value.
function useHasMounted() {
  return useSyncExternalStore(subscribeToNothing, getHasMountedOnClient, getHasMountedOnServer)
}

function isThemeOption(value: string | undefined): value is ThemeOption {
  return THEME_ORDER.includes(value as ThemeOption)
}

export function ThemeMenuItem() {
  const translate = useTranslations('ThemeToggle')
  const translateMenu = useTranslations('UserMenu')
  const { theme, setTheme } = useTheme()
  const hasMounted = useHasMounted()

  const currentTheme: ThemeOption = hasMounted && isThemeOption(theme) ? theme : 'system'

  return (
    <div>
      <DropdownMenuLabel>{translateMenu('theme')}</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={currentTheme}
        onValueChange={(value) => setTheme(value as ThemeOption)}
      >
        {THEME_ORDER.map((option) => (
          <DropdownMenuRadioItem key={option} value={option} disabled={!hasMounted}>
            {translate(option)}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </div>
  )
}
