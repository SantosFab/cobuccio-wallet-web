// Mirrors the backend's own limits (see cobuccio-wallet-api's
// wallets/dto/deposit.dto.ts, wallets/dto/transfer.dto.ts and
// users/dto/create-user.dto.ts) — kept in sync manually since the two
// repos don't share code. Well under the wallet balance column's
// decimal(14,2) cap; high enough that no legitimate value ever hits it.
export const MAX_MONEY_VALUE = 1_000_000_000
