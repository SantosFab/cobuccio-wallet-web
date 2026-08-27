import { z as zod } from 'zod'

import type { SharedErrorsTranslator } from './shared-errors'

const CEP_REGEX = /^\d{5}-\d{3}$/
const UF_REGEX = /^[A-Z]{2}$/

export function createAddressSchema(translateErrors: SharedErrorsTranslator) {
  return zod.object({
    zipCode: zod
      .string()
      .regex(CEP_REGEX, { message: translateErrors('zipCodeInvalid') })
      .transform((value) => value.replace(/\D/g, '')),
    street: zod.string().min(1, { message: translateErrors('streetRequired') }),
    number: zod.string().min(1, { message: translateErrors('numberRequired') }),
    complement: zod.string().optional(),
    neighborhood: zod.string().min(1, { message: translateErrors('neighborhoodRequired') }),
    city: zod.string().min(1, { message: translateErrors('cityRequired') }),
    state: zod.string().regex(UF_REGEX, { message: translateErrors('stateInvalid') }),
  })
}

export type AddressSchema = ReturnType<typeof createAddressSchema>
