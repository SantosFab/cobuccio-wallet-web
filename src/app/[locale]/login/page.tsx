import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { LoginForm } from '@/components/login-form'

export async function generateMetadata(): Promise<Metadata> {
  const translate = await getTranslations('LoginPage')

  return {
    title: translate('metaTitle'),
  }
}

export default async function LoginPage() {
  const translate = await getTranslations('LoginPage')

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl font-medium text-navy dark:text-white">
          {translate('title')}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {translate('description')}
        </p>
      </div>

      <LoginForm />
    </main>
  )
}
