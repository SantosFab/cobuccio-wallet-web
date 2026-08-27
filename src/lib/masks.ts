function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function maskCpf(value: string): string {
  const digits = digitsOnly(value).slice(0, 11)

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskPhone(value: string): string {
  const digits = digitsOnly(value).slice(0, 11)

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export function maskCep(value: string): string {
  const digits = digitsOnly(value).slice(0, 8)

  return digits.replace(/(\d{5})(\d)/, '$1-$2')
}

export function maskCardExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4)

  return digits.replace(/(\d{2})(\d)/, '$1/$2')
}

export function maskCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, 16)

  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function maskCurrency(value: string): string {
  const digits = digitsOnly(value)

  if (!digits) return ''

  const cents = parseInt(digits, 10)

  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function parseCurrencyToNumber(value: string): number {
  const digits = digitsOnly(value)

  if (!digits) return 0

  return parseInt(digits, 10) / 100
}

// Format-only — never do arithmetic on this result. Safe here because
// it's a single parse-and-format of a value that already arrived
// pre-rounded to 2 decimals from the API, not repeated float math.
export function formatCurrency(value: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(value),
  )
}
