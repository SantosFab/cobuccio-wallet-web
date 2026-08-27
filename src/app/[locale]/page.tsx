import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'

import { redirect } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  redirect({ href: '/login', locale })
}
