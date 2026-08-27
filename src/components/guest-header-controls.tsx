'use client'

import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/auth-context'

// UserMenu already exposes theme/language once logged in (avatar
// dropdown) — these standalone buttons only fill the gap for guests, who
// otherwise have no way to reach either setting.
export function GuestHeaderControls() {
  const { state } = useAuth()

  if (state.status === 'authenticated') return null

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <LocaleSwitcher />
    </div>
  )
}
