'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/masks'
import { toast } from '@/lib/toast-store'
import {
  listTransactions,
  reverseTransaction,
  WalletServiceError,
  type WalletTransaction,
} from '@/services/wallet-service'

const PAGE_SIZE = 5

interface Props {
  currentUserId: string
  refreshKey: number
  onReversed: () => void
}

export function WalletTransactionList({ currentUserId, refreshKey, onReversed }: Props) {
  const translate = useTranslations('WalletTransactionList')
  const translateErrors = useTranslations('WalletTransactionList.errors')

  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [reversingId, setReversingId] = useState<string | null>(null)

  const isFetchingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    isFetchingRef.current = true
    listTransactions({ limit: PAGE_SIZE, offset: 0 })
      .then((page) => {
        setTransactions(page)
        setHasMore(page.length === PAGE_SIZE)
      })
      .catch(() => {
        setTransactions([])
        setHasMore(false)
        toast.error(translate('loadError'))
      })
      .finally(() => {
        isFetchingRef.current = false
      })
  }, [refreshKey, translate])

  // The list lives inside a bounded, scrollable container (see the JSX
  // below — it grows to fill the page down to the footer, never beyond)
  // instead of growing the whole page — otherwise the sentinel below would
  // already sit inside the viewport on mount and this effect would keep
  // fetching forever without the user ever scrolling. Scoping the
  // observer's `root` to that container means the 4th item of the most
  // recently loaded batch of 5 only intersects once the user actually
  // scrolls it into view, which is when the next page is fetched.
  useEffect(() => {
    const container = containerRef.current
    const sentinel = sentinelRef.current
    if (!container || !sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isFetchingRef.current) return

        isFetchingRef.current = true
        setIsLoadingMore(true)

        listTransactions({ limit: PAGE_SIZE, offset: transactions.length })
          .then((page) => {
            setTransactions((current) => [...current, ...page])
            setHasMore(page.length === PAGE_SIZE)
          })
          .catch(() => {
            setHasMore(false)
            toast.error(translate('loadError'))
          })
          .finally(() => {
            isFetchingRef.current = false
            setIsLoadingMore(false)
          })
      },
      { root: container, threshold: 0.5 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [transactions.length, hasMore, translate])

  async function handleReverse(transactionId: string) {
    setReversingId(transactionId)

    try {
      await reverseTransaction(transactionId)
      onReversed()
    } catch (error) {
      const message =
        error instanceof WalletServiceError
          ? translateErrors(error.code)
          : translate('genericError')
      toast.error(message)
    } finally {
      setReversingId(null)
    }
  }

  if (transactions.length === 0) {
    return <p className="text-sm text-neutral-500">{translate('empty')}</p>
  }

  return (
    <div ref={containerRef} className="flex min-h-64 flex-1 flex-col gap-3 overflow-y-auto pr-1">
      {transactions.map((transaction, index) => {
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
          <Card
            key={transaction.id}
            ref={index === transactions.length - 2 ? sentinelRef : undefined}
            padding="sm"
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm font-medium">
                {translate(`types.${transaction.type}`)}
                {transaction.counterpartName ? ` · ${transaction.counterpartName}` : ''}
              </span>
              <span className="text-xs text-neutral-500">
                {new Date(transaction.createdAt).toLocaleString('pt-BR')}
                {transaction.status === 'reversed' ? ` · ${translate('reversedTag')}` : ''}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
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

      {isLoadingMore && <p className="text-sm text-neutral-500">{translate('loadingMore')}</p>}
    </div>
  )
}
