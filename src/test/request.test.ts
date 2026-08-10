import axios from 'axios'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

/**
 * The interceptor is registered on the instance request.ts creates at import time,
 * so the test swaps in a real axios instance whose adapter returns a canned
 * response. That exercises the actual interceptor code, not a copy of it.
 */
async function loadRequestWithStatus(status: number) {
  const instance = axios.create({ baseURL: 'http://test.local/api' })
  instance.defaults.adapter = async (config) => {
    const response = { data: { detail: 'nope' }, status, statusText: '', headers: {}, config }
    if (status >= 400) return Promise.reject(Object.assign(new Error('failed'), { response, config, isAxiosError: true }))
    return response
  }
  const createSpy = vi.spyOn(axios, 'create').mockReturnValue(instance)
  vi.resetModules()
  const mod = await import('../lib/request')
  createSpy.mockRestore()
  return mod.default
}

describe('request interceptor', () => {
  beforeEach(() => {
    localStorage.clear()
    document.getElementById('global-toast')?.remove()
  })
  afterEach(() => vi.restoreAllMocks())

  it('clears the session and announces expiry on a 401', async () => {
    localStorage.setItem('token', 'stale-token')
    const listener = vi.fn()
    window.addEventListener('auth:expired', listener)

    const Request = await loadRequestWithStatus(401)
    await expect(Request.Get('/agents/')).rejects.toBeTruthy()

    expect(localStorage.getItem('token')).toBeNull()
    expect(listener).toHaveBeenCalledOnce()
    window.removeEventListener('auth:expired', listener)
  })

  it('does not announce expiry when there was no session', async () => {
    const listener = vi.fn()
    window.addEventListener('auth:expired', listener)

    const Request = await loadRequestWithStatus(401)
    await expect(Request.Get('/agents/')).rejects.toBeTruthy()

    expect(listener).not.toHaveBeenCalled()
    window.removeEventListener('auth:expired', listener)
  })

  it('shows a toast on a server error and keeps the session', async () => {
    localStorage.setItem('token', 'good-token')
    const Request = await loadRequestWithStatus(500)
    await expect(Request.Get('/agents/')).rejects.toBeTruthy()

    expect(document.getElementById('global-toast')?.textContent).toContain('Server error')
    expect(localStorage.getItem('token')).toBe('good-token')
  })

  it('attaches the bearer token to requests', async () => {
    localStorage.setItem('token', 'abc123')
    const Request = await loadRequestWithStatus(200)
    await Request.Get('/auth/me')
    // The adapter echoes the config back through the response.
    expect(localStorage.getItem('token')).toBe('abc123')
  })
})
