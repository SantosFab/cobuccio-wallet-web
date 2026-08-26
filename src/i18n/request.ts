import { locale as rootParamsLocale } from 'next/root-params'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from '@/i18n/routing'

export default getRequestConfig(async () => {
  const locale = await rootParamsLocale()

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
