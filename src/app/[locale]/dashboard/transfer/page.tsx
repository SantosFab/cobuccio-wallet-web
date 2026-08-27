'use client'

import { useTranslations } from 'next-intl'

import { TransferForm } from '@/components/transfer-form'
import { useRouter } from '@/i18n/navigation'

export default function DashboardTransferPage() {
  const translate = useTranslations('DashboardPage')
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="border-l-2 border-gold pl-2 text-xl font-semibold">
        {translate('sections.transfer')}
      </h1>
      <TransferForm onSuccess={() => router.push('/dashboard')} />
    </div>
  )
}
