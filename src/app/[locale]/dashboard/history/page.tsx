'use client'

import { useState } from 'react'

import { WalletTransactionList } from '@/components/wallet-transaction-list'
import { useAuth } from '@/contexts/auth-context'

export default function DashboardHistoryPage() {
  const { state } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  if (state.status !== 'authenticated') {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <WalletTransactionList
        currentUserId={state.user.id}
        refreshKey={refreshKey}
        onReversed={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  )
}
