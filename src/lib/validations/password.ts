// Shared by every schema that sets a new password (signup, change
// password) — mirrors the backend's STRONG_PASSWORD_REGEX (see
// cobuccio-wallet-api's users/dto/create-user.dto.ts).
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
