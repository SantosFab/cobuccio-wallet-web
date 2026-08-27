'use client'

import { Link } from '@/i18n/navigation'
import { useAuth } from '@/contexts/auth-context'

export function HeaderBrandLink() {
  const { state } = useAuth()
  const href = state.status === 'authenticated' ? '/dashboard' : '/login'

  return (
    <Link href={href} className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-gold font-serif text-sm text-gold">
        CW
      </span>
      <span className="font-serif text-lg tracking-wide">Cobuccio Wallet</span>
    </Link>
  )
}
