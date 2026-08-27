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

const ERROR_CODE_BY_API_CODE: Record<string, WalletErrorCode> = {
  INSUFFICIENT_BALANCE: 'insufficientBalance',
  CANNOT_TRANSFER_TO_SELF: 'cannotTransferToSelf',
  RECIPIENT_NOT_FOUND: 'recipientNotFound',
  TRANSACTION_NOT_FOUND: 'transactionNotFound',
  TRANSACTION_ALREADY_REVERSED: 'transactionAlreadyReversed',
  CANNOT_REVERSE_OTHERS_TRANSACTION: 'cannotReverseOthersTransaction',
  CANNOT_REVERSE_A_REVERSAL: 'cannotReverseAReversal',
  INVALID_CARD: 'invalidCard',
  ONLY_RECIPIENT_CAN_REVERSE: 'onlyRecipientCanReverse',
}

export class WalletServiceError extends Error {
  constructor(public readonly code: WalletErrorCode) {
    super(code)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!response.ok) {
    const body: { code?: string } = await response.json().catch(() => ({}))
    console.log('[wallet-service] - request rejected by the API', {
      path,
      status: response.status,
      body,
    })

    const errorCode = body.code ? ERROR_CODE_BY_API_CODE[body.code] : undefined
    if (errorCode) throw new WalletServiceError(errorCode)
    throw new Error(`[wallet-service] - request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

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
