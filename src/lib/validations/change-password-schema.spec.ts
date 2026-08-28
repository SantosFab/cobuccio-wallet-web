import { describe, expect, it } from 'vitest'

import { createChangePasswordSchema } from './change-password-schema'

const translateErrors = ((key: string) => key) as unknown as Parameters<
  typeof createChangePasswordSchema
>[0]

const schema = createChangePasswordSchema(translateErrors)

function buildPayload(overrides: Partial<Record<string, string>> = {}) {
  return {
    currentPassword: 'OldSenha123',
    newPassword: 'NewSenha123',
    confirmNewPassword: 'NewSenha123',
    ...overrides,
  }
}

describe('createChangePasswordSchema', () => {
  it('accepts a valid payload', () => {
    const result = schema.safeParse(buildPayload())

    expect(result.success).toBe(true)
  })

  it('rejects a new password shorter than 8 characters', () => {
    const result = schema.safeParse(
      buildPayload({ newPassword: 'Ab1', confirmNewPassword: 'Ab1' }),
    )

    expect(result.success).toBe(false)
  })

  it('rejects a new password without an uppercase letter, lowercase letter or number', () => {
    const result = schema.safeParse(
      buildPayload({
        newPassword: 'lowercase',
        confirmNewPassword: 'lowercase',
      }),
    )

    expect(result.success).toBe(false)
  })

  it('rejects when the confirmation does not match the new password, attaching the error to confirmNewPassword', () => {
    const result = schema.safeParse(
      buildPayload({ confirmNewPassword: 'Different123' }),
    )

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmNewPassword'])
      expect(result.error.issues[0]?.message).toBe('passwordsDoNotMatch')
    }
  })

  it('rejects an empty current password', () => {
    const result = schema.safeParse(buildPayload({ currentPassword: '' }))

    expect(result.success).toBe(false)
  })
})
