'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/masks'
import { toast } from '@/lib/toast-store'
import { getWallet } from '@/services/wallet-service'

export function WalletBalanceCard({ refreshKey = 0 }: { refreshKey?: number }) {
  const translate = useTranslations('DashboardPage')
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    getWallet()
      .then((wallet) => setBalance(wallet.balance))
      .catch(() => {
        setBalance(null)
        toast.error(translate('balance.loadError'))
      })
  }, [refreshKey, translate])

  return (
    <Card>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {translate('balance.label')}
      </p>
      <p className="font-serif text-3xl font-medium text-navy dark:text-white">
        {balance === null ? '—' : formatCurrency(balance)}
      </p>
    </Card>
  )
}
