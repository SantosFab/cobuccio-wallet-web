'use client'

import { useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { routing } from '@/i18n/routing'
import { usePathname, useRouter } from '@/i18n/navigation'

type Locale = (typeof routing.locales)[number]

export function LocaleSwitcher() {
  const translate = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(nextLocale: Locale) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <select
      aria-label={translate('label')}
      value={locale}
      disabled={isPending}
      onChange={(event) => handleChange(event.target.value as Locale)}
      className="rounded-md border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
    >
      {routing.locales.map((availableLocale) => (
        <option key={availableLocale} value={availableLocale}>
          {translate(availableLocale)}
        </option>
      ))}
    </select>
  )
}
