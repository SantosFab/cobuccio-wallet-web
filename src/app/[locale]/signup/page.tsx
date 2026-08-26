import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { SignupForm } from '@/components/signup-form'

export async function generateMetadata(): Promise<Metadata> {
  const translate = await getTranslations('SignupPage')

  return {
    title: translate('metaTitle'),
  }
}

export default async function SignupPage() {
  const translate = await getTranslations('SignupPage')

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{translate('title')}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {translate('description')}
        </p>
      </div>

      <SignupForm />
    </main>
  )
}
