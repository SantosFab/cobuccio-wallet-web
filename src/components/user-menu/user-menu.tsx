'use client'

import { useTranslations } from 'next-intl'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from '@/i18n/navigation'
import { getInitials } from '@/lib/get-initials'
import { getAvatarSrc } from '@/services/users-service'
import { LocaleMenuItem } from './locale-menu-item'
import { LogoutMenuItem } from './logout-menu-item'
import { ThemeMenuItem } from './theme-menu-item'

export function UserMenu() {
  const translate = useTranslations('UserMenu')
  const { state } = useAuth()
  const router = useRouter()

  if (state.status !== 'authenticated') return null

  const initials = getInitials(state.user.name)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={translate('openMenu')}
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Avatar>
            <AvatarImage src={getAvatarSrc(state.user.avatarUrl)} alt="" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>{state.user.name}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => router.push('/dashboard/profile')}>
          {translate('profileLink')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ThemeMenuItem />
        <DropdownMenuSeparator />
        <LocaleMenuItem />
        <DropdownMenuSeparator />
        <LogoutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
