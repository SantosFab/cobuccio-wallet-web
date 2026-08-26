function calculateCheckDigit(digits: string, weightStart: number): number {
  const sum = digits
    .split('')
    .reduce((acc, digit, index) => acc + Number(digit) * (weightStart - index), 0)

  const remainder = (sum * 10) % 11

  return remainder === 10 ? 0 : remainder
}

export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '')

  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  const firstCheckDigit = calculateCheckDigit(digits.slice(0, 9), 10)
  const secondCheckDigit = calculateCheckDigit(digits.slice(0, 10), 11)

  return (
    firstCheckDigit === Number(digits[9]) &&
    secondCheckDigit === Number(digits[10])
  )
}
