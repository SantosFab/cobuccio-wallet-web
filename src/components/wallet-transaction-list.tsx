'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/masks'
import {
  listTransactions,
  reverseTransaction,
  WalletServiceError,
  type WalletTransaction,
} from '@/services/wallet-service'

interface Props {
  currentUserId: string
  refreshKey: number
  onReversed: () => void
}

export function WalletTransactionList({ currentUserId, refreshKey, onReversed }: Props) {
  const translate = useTranslations('WalletTransactionList')
  const translateErrors = useTranslations('WalletTransactionList.errors')

  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [reversingId, setReversingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    listTransactions()
      .then(setTransactions)
      .catch(() => setTransactions([]))
  }, [refreshKey])

  async function handleReverse(transactionId: string) {
    setErrorMessage(null)
    setReversingId(transactionId)

    try {
      await reverseTransaction(transactionId)
      onReversed()
    } catch (error) {
      setErrorMessage(
        error instanceof WalletServiceError
          ? translateErrors(error.code)
          : translate('genericError'),
      )
    } finally {
      setReversingId(null)
    }
  }

  if (transactions.length === 0) {
    return <p className="text-sm text-neutral-500">{translate('empty')}</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {errorMessage && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}

      {transactions.map((transaction) => {
        // Deposits only involve one person, so the original depositor
        // reverses them instantly. For transfers, only the recipient may
        // reverse it — `direction: 'credit'` means the viewer received
        // this transfer — and it's just as instant; the sender has no
        // say and nothing to approve.
        const canReverse =
          transaction.status === 'completed' &&
          (transaction.type === 'deposit'
            ? transaction.initiatedByUserId === currentUserId
            : transaction.type === 'transfer' && transaction.direction === 'credit')

        return (
          <Card key={transaction.id} padding="sm" className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {translate(`types.${transaction.type}`)}
                {transaction.counterpartName ? ` · ${transaction.counterpartName}` : ''}
              </span>
              <span className="text-xs text-neutral-500">
                {new Date(transaction.createdAt).toLocaleString('pt-BR')}
                {transaction.status === 'reversed' ? ` · ${translate('reversedTag')}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={
                  transaction.direction === 'credit'
                    ? 'text-sm font-medium text-green-600 dark:text-green-400'
                    : 'text-sm font-medium text-red-600 dark:text-red-400'
                }
              >
                {transaction.direction === 'credit' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </span>

              {canReverse && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={reversingId === transaction.id}
                  onClick={() => handleReverse(transaction.id)}
                >
                  {transaction.type === 'deposit' ? translate('reverse.button') : translate('reverse.returnButton')}
                </Button>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
