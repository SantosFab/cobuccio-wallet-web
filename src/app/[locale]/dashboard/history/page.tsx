'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { WalletTransactionList } from '@/components/wallet-transaction-list'
import { useAuth } from '@/contexts/auth-context'

export default function DashboardHistoryPage() {
  const translate = useTranslations('DashboardPage')
  const { state } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  if (state.status !== 'authenticated') {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="border-l-2 border-gold pl-2 text-xl font-semibold">
        {translate('sections.history')}
      </h1>
      <WalletTransactionList
        currentUserId={state.user.id}
        refreshKey={refreshKey}
        onReversed={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  )
}
