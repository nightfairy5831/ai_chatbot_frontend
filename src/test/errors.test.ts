import { describe, expect, it } from 'vitest'
import { errorStatus, errorText } from '../lib/errors'

describe('errorText', () => {
  it('uses a string detail from the API', () => {
    const err = { response: { status: 403, data: { detail: 'Agent limit reached for the free plan (1).' } } }
    expect(errorText(err, 'fallback')).toContain('Agent limit reached')
    expect(errorStatus(err)).toBe(403)
  })

  it('unwraps a pydantic validation list', () => {
    const err = { response: { status: 422, data: { detail: [{ msg: 'Password must contain a number' }] } } }
    expect(errorText(err, 'fallback')).toBe('Password must contain a number')
  })

  it('falls back when there is nothing usable', () => {
    expect(errorText(new Error('boom'), 'fallback')).toBe('fallback')
    expect(errorText(undefined, 'fallback')).toBe('fallback')
    expect(errorStatus(undefined)).toBeUndefined()
  })
})
