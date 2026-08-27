import type { useTranslations } from 'next-intl'

// Error messages that are identical across more than one form (email
// format, address fields, monthly income, "email already registered")
// live in the single `FormErrors` message namespace instead of being
// copy-pasted into each form's own `errors` block.
export type SharedErrorsTranslator = ReturnType<typeof useTranslations<'FormErrors'>>
