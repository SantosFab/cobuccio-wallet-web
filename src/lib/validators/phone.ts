// Only mobile numbers are accepted (DDD + 9 digits, always starting with 9)
// — landlines are out of scope.
const PHONE_FORMAT_REGEX = /^\(\d{2}\) 9\d{4}-\d{4}$/

export function isValidPhone(value: string): boolean {
  return PHONE_FORMAT_REGEX.test(value)
}
