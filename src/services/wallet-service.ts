import { createApiClient } from '@/services/http-client'

export interface Wallet {
  balance: string
  updatedAt: string
}

export interface WalletTransaction {
  id: string
  type: 'deposit' | 'transfer' | 'reversal'
  amount: string
  status: 'completed' | 'reversed'
  direction: 'credit' | 'debit'
  counterpartName: string | null
  initiatedByUserId: string
  reversalOfTransactionId: string | null
  createdAt: string
}

export type WalletErrorCode =
  | 'insufficientBalance'
  | 'cannotTransferToSelf'
  | 'recipientNotFound'
  | 'transactionNotFound'
  | 'transactionAlreadyReversed'
  | 'cannotReverseOthersTransaction'
  | 'cannotReverseAReversal'
  | 'invalidCard'
  | 'onlyRecipientCanReverse'

export class WalletServiceError extends Error {
  constructor(public readonly code: WalletErrorCode) {
    super(code)
  }
}

const { request } = createApiClient<WalletErrorCode>({
  serviceName: 'wallet-service',
  errorCodeMap: {
    INSUFFICIENT_BALANCE: 'insufficientBalance',
    CANNOT_TRANSFER_TO_SELF: 'cannotTransferToSelf',
    RECIPIENT_NOT_FOUND: 'recipientNotFound',
    TRANSACTION_NOT_FOUND: 'transactionNotFound',
    TRANSACTION_ALREADY_REVERSED: 'transactionAlreadyReversed',
    CANNOT_REVERSE_OTHERS_TRANSACTION: 'cannotReverseOthersTransaction',
    CANNOT_REVERSE_A_REVERSAL: 'cannotReverseAReversal',
    INVALID_CARD: 'invalidCard',
    ONLY_RECIPIENT_CAN_REVERSE: 'onlyRecipientCanReverse',
  },
  ErrorClass: WalletServiceError,
})

export interface CardDetails {
  cardNumber: string
  cardCvv: string
  cardExpiry: string
}

export const getWallet = () => request<Wallet>('/wallets/me')

export const deposit = (amount: number, card: CardDetails) =>
  request<WalletTransaction>('/wallets/deposits', {
    method: 'POST',
    body: JSON.stringify({ amount, ...card }),
  })

export const transfer = (recipientIdentifier: string, amount: number) =>
  request<WalletTransaction>('/wallets/transfers', {
    method: 'POST',
    body: JSON.stringify({ recipientIdentifier, amount }),
  })

export const listTransactions = (params: { limit: number; offset: number }) =>
  request<WalletTransaction[]>(`/wallets/transactions?limit=${params.limit}&offset=${params.offset}`)

export const reverseTransaction = (transactionId: string) =>
  request<WalletTransaction>(`/wallets/transactions/${transactionId}/reversal`, {
    method: 'POST',
  })
