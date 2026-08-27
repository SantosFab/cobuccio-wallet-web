'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { DepositForm } from '@/components/deposit-form'
import { WalletBalanceCard } from '@/components/wallet-balance-card'
import { WalletTransactionList } from '@/components/wallet-transaction-list'
import { useAuth } from '@/contexts/auth-context'

export default function DashboardBalancePage() {
  const translate = useTranslations('DashboardPage')
  const { state } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  if (state.status !== 'authenticated') {
    return null
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <WalletBalanceCard refreshKey={refreshKey} />

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {translate('sections.deposit')}
        </h2>
        <DepositForm onSuccess={() => setRefreshKey((key) => key + 1)} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {translate('sections.history')}
        </h2>
        <WalletTransactionList
          currentUserId={state.user.id}
          refreshKey={refreshKey}
          onReversed={() => setRefreshKey((key) => key + 1)}
        />
      </div>
    </div>
  )
}
