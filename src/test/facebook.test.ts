import { describe, expect, it, beforeEach } from 'vitest'
import { listenForSignup } from '../lib/facebook'

function postFrom(origin: string, data: unknown) {
  window.dispatchEvent(new MessageEvent('message', {
    origin,
    data: typeof data === 'string' ? data : JSON.stringify(data),
  }))
}

describe('embedded signup listener', () => {
  let seen: unknown[]
  let stop: () => void

  beforeEach(() => {
    seen = []
    stop?.()
    stop = listenForSignup((info) => seen.push(info))
  })

  it('accepts signup events from facebook', () => {
    postFrom('https://www.facebook.com', {
      type: 'WA_EMBEDDED_SIGNUP',
      event: 'FINISH',
      data: { waba_id: '123', phone_number_id: '456' },
    })
    expect(seen).toEqual([{ event: 'FINISH', waba_id: '123', phone_number_id: '456' }])
  })

  it('ignores look-alike origins', () => {
    // endsWith('facebook.com') would accept this — an exact allowlist must not.
    postFrom('https://evilfacebook.com', { type: 'WA_EMBEDDED_SIGNUP', event: 'FINISH', data: {} })
    expect(seen).toEqual([])
  })

  it('ignores non-JSON sdk chatter without throwing', () => {
    expect(() => postFrom('https://www.facebook.com', 'not-json')).not.toThrow()
    expect(seen).toEqual([])
  })

  it('ignores unrelated postMessage traffic', () => {
    postFrom('https://www.facebook.com', { type: 'SOMETHING_ELSE' })
    expect(seen).toEqual([])
  })
})
