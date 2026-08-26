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

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export function maskCep(value: string): string {
  const digits = digitsOnly(value).slice(0, 8)

  return digits.replace(/(\d{5})(\d)/, '$1-$2')
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
