export interface AddressLookupResult {
  street: string
  neighborhood: string
  city: string
  state: string
}

export class CepNotFoundError extends Error {
  constructor() {
    super('CEP not found')
  }
}

/**
 * ViaCEP is a free, public, CORS-enabled Brazilian postal code API —
 * no key required, meant to be called directly from the browser.
 */
export async function lookupAddressByCep(cepDigits: string): Promise<AddressLookupResult> {
  const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)

  if (!response.ok) {
    throw new Error(`ViaCEP request failed with status ${response.status}`)
  }

  const data = await response.json()

  if (data.erro) {
    throw new CepNotFoundError()
  }

  return {
    street: data.logradouro,
    neighborhood: data.bairro,
    city: data.localidade,
    state: data.uf,
  }
}
