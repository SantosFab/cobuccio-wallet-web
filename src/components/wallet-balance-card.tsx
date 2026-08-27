'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/masks'
import { getWallet } from '@/services/wallet-service'

export function WalletBalanceCard() {
  const translate = useTranslations('DashboardPage')
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    getWallet()
      .then((wallet) => setBalance(wallet.balance))
      .catch(() => setBalance(null))
  }, [])

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
