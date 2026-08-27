'use client'

import { useTranslations } from 'next-intl'

import { WalletBalanceCard } from '@/components/wallet-balance-card'

export default function DashboardBalancePage() {
  const translate = useTranslations('DashboardPage')

  return (
    <div className="flex flex-col gap-4">
      <h1 className="border-l-2 border-gold pl-2 text-xl font-semibold">
        {translate('sections.balance')}
      </h1>
      <WalletBalanceCard />
    </div>
  )
}
