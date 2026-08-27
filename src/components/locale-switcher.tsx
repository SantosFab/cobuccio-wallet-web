'use client'

import { useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { routing } from '@/i18n/routing'
import { usePathname, useRouter } from '@/i18n/navigation'

type Locale = (typeof routing.locales)[number]

function getNextLocale(currentLocale: Locale): Locale {
  const currentIndex = routing.locales.indexOf(currentLocale)
  return routing.locales[(currentIndex + 1) % routing.locales.length]
}

export function LocaleSwitcher() {
  const translate = useTranslations('LocaleSwitcher')
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const nextLocale = getNextLocale(locale)

  function handleClick() {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <Button
      type="button"
      variant="header"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-label={translate('switchTo', { locale: translate(nextLocale) })}
      title={translate('switchTo', { locale: translate(nextLocale) })}
    >
      {translate(nextLocale)}
    </Button>
  )
}
