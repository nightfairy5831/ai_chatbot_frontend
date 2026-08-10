/** Facebook JS SDK loader and Embedded Signup message listener. */

interface FacebookSdk {
  init(options: { appId: string; autoLogAppEvents: boolean; xfbml: boolean; version: string }): void
  login(callback: (response: { authResponse?: { code?: string } }) => void, options: Record<string, unknown>): void
}

declare global {
  interface Window {
    FB?: FacebookSdk
    fbAsyncInit?: () => void
  }
}

let sdkReady: Promise<FacebookSdk> | null = null

export function loadFacebookSdk(appId: string, version: string): Promise<FacebookSdk> {
  if (sdkReady) return sdkReady
  sdkReady = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB?.init({ appId, autoLogAppEvents: true, xfbml: true, version })
      if (window.FB) resolve(window.FB)
      else reject(new Error('Facebook SDK failed to initialise'))
    }
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => reject(new Error('Could not load the Facebook SDK'))
    document.body.appendChild(script)
  })
  return sdkReady
}

// Meta's own sample checks origin.endsWith('facebook.com'), which
// 'evilfacebook.com' also satisfies. Exact match instead.
const ALLOWED_ORIGINS = ['https://www.facebook.com', 'https://web.facebook.com']

export interface SignupInfo {
  event?: string
  waba_id?: string
  phone_number_id?: string
  business_id?: string
  session_id?: string
  error_message?: string
}

/** Listen for the signup popup's progress events. Returns an unsubscribe function. */
export function listenForSignup(onInfo: (info: SignupInfo) => void): () => void {
  const handler = (event: MessageEvent) => {
    if (!ALLOWED_ORIGINS.includes(event.origin)) return
    try {
      const data = JSON.parse(event.data)
      if (data?.type === 'WA_EMBEDDED_SIGNUP') {
        onInfo({ event: data.event, ...(data.data || {}) })
      }
    } catch {
      // The SDK also posts non-JSON chatter on the same channel.
    }
  }
  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}

export interface MetaConfig {
  enabled: boolean
  app_id: string
  config_id: string
  graph_version: string
}

/** Launch Embedded Signup and resolve with the short-lived authorization code. */
export function launchSignup(sdk: FacebookSdk, config: MetaConfig): Promise<string | null> {
  return new Promise((resolve) => {
    sdk.login(
      (response) => resolve(response?.authResponse?.code ?? null),
      {
        config_id: config.config_id,
        // Both are required — omitting either returns a user token instead of
        // the authorization code the backend needs.
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {} },
      },
    )
  })
}
