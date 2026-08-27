'use client'

import { useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { routing } from '@/i18n/routing'
import { usePathname, useRouter } from '@/i18n/navigation'

type Locale = (typeof routing.locales)[number]

export function LocaleMenuItem() {
  const translate = useTranslations('LocaleSwitcher')
  const translateMenu = useTranslations('UserMenu')
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleValueChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale as Locale })
    })
  }

  return (
    <div>
      <DropdownMenuLabel>{translateMenu('language')}</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={locale} onValueChange={handleValueChange}>
        {routing.locales.map((option) => (
          <DropdownMenuRadioItem key={option} value={option} disabled={isPending}>
            {translate(option)}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </div>
  )
}
