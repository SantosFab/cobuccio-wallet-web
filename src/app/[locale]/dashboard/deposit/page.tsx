'use client'

import { useTranslations } from 'next-intl'

import { DepositForm } from '@/components/deposit-form'
import { useRouter } from '@/i18n/navigation'

export default function DashboardDepositPage() {
  const translate = useTranslations('DashboardPage')
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="border-l-2 border-gold pl-2 text-xl font-semibold">
        {translate('sections.deposit')}
      </h1>
      <DepositForm onSuccess={() => router.push('/dashboard')} />
    </div>
  )
}
