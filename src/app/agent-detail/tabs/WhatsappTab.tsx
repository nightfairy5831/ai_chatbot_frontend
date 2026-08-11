import { useState, useEffect, useCallback, useRef } from 'react'
import { Phone, PhoneOff, BadgeCheck, RefreshCw } from 'lucide-react'
import Request, { showToast } from '../../../lib/request'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type WhatsappNumber, errorText } from '../types'
import { loadFacebookSdk, listenForSignup, launchSignup, type MetaConfig, type SignupInfo } from '../../../lib/facebook'

const BENEFITS = [
  'Keep your own number — nothing to buy',
  'Your own account, your own quality rating',
  'Keep replying from the WhatsApp Business app if you use it',
  'Disconnect any time',
]

export default function WhatsappTab({ agentId }: { agentId: number }) {
  const [numbers, setNumbers] = useState<WhatsappNumber[]>([])
  const [config, setConfig] = useState<MetaConfig | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [refreshing, setRefreshing] = useState<number | null>(null)
  const signupInfo = useRef<SignupInfo>({})

  const fetchNumbers = useCallback(async () => {
    try {
      setNumbers(await Request.Get(`/whatsapp/agents/${agentId}/numbers`))
    } catch { /* an empty list is the meaningful state here */ }
  }, [agentId])

  useEffect(() => { fetchNumbers() }, [fetchNumbers])

  useEffect(() => {
    Request.Get('/whatsapp/meta/config').then(setConfig).catch(() => setConfig(null))
  }, [])

  // The popup reports the account it created on a different channel from the
  // login callback, so collect it as it arrives.
  useEffect(() => listenForSignup((info) => { signupInfo.current = { ...signupInfo.current, ...info } }), [])

  const connect = async () => {
    if (!config?.enabled) return
    setConnecting(true)
    try {
      const sdk = await loadFacebookSdk(config.app_id, config.graph_version)
      const code = await launchSignup(sdk, config)
      if (!code) { showToast('WhatsApp connection was cancelled'); return }
      // The authorization code is short-lived — exchange it immediately.
      await Request.Post(`/whatsapp/agents/${agentId}/connect`, {
        code,
        waba_id: signupInfo.current.waba_id ?? null,
        phone_number_id: signupInfo.current.phone_number_id ?? null,
        business_id: signupInfo.current.business_id ?? null,
        signup_event: signupInfo.current.event ?? null,
        session_id: signupInfo.current.session_id ?? null,
      })
      showToast('WhatsApp Business account connected')
      signupInfo.current = {}
      await fetchNumbers()
    } catch (err) {
      showToast(errorText(err, 'Could not finish the WhatsApp connection'))
    } finally {
      setConnecting(false)
    }
  }

  const refreshHealth = async (id: number) => {
    setRefreshing(id)
    try {
      await Request.Post(`/whatsapp/numbers/${id}/health`, {})
      await fetchNumbers()
      showToast('Status refreshed')
    } catch (err) {
      showToast(errorText(err, 'Could not refresh the status'))
    } finally {
      setRefreshing(null)
    }
  }

  const disconnect = async (id: number) => {
    if (!confirm('Disconnect this number? Your WhatsApp account stays yours.')) return
    try {
      await Request.Delete(`/whatsapp/numbers/${id}`)
      await fetchNumbers()
    } catch (err) {
      showToast(errorText(err, 'Could not disconnect this number'))
    }
  }

  const qualityClass = (rating: string) =>
    rating === 'GREEN' ? 'bg-green-50 text-green-600 border-green-100'
      : rating === 'YELLOW' ? 'bg-amber-50 text-amber-600 border-amber-100'
        : 'bg-red-50 text-red-500 border-red-100'

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="flex items-center gap-2 m-0 text-base font-semibold text-gray-900">
          <Phone size={18} className="text-green-500" /> WhatsApp
        </h3>
      </div>

      <Card className="mb-4">
        <CardContent className="p-5">
          <h4 className="text-sm font-semibold text-gray-900 m-0 mb-3">Connected Numbers</h4>
          {numbers.length > 0 ? (
            <div className="space-y-2">
              {numbers.map((wn) => (
                <div key={wn.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 m-0 flex items-center gap-2 flex-wrap">
                        {wn.display_phone_number || wn.phone_number}
                        {wn.verified_name && (
                          <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0 bg-gray-100 text-gray-500 border border-gray-200">
                            {wn.verified_name}
                          </Badge>
                        )}
                        {wn.is_on_biz_app && (
                          <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0 bg-sky-50 text-sky-600 border border-sky-100">
                            Business app too
                          </Badge>
                        )}
                        {wn.quality_rating && (
                          <Badge variant="secondary" className={`text-[10px] rounded-full px-2 py-0 border ${qualityClass(wn.quality_rating)}`}>
                            {wn.quality_rating.toLowerCase()}
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-green-500 m-0 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Answering automatically
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost" size="sm" className="text-gray-400 hover:text-gray-700"
                      title="Refresh quality rating"
                      disabled={refreshing === wn.id}
                      onClick={() => refreshHealth(wn.id)}
                    >
                      <RefreshCw size={14} className={refreshing === wn.id ? 'animate-spin' : ''} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => disconnect(wn.id)}>
                      <PhoneOff size={14} className="mr-1" /> Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Phone size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm m-0">No number connected yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h4 className="text-sm font-semibold text-gray-900 m-0 mb-1">Connect your WhatsApp Business account</h4>
          <p className="text-sm text-gray-600 m-0 mb-3 max-w-xl">
            Sign in with the Facebook account that manages your business. The number, the account and
            the message history stay yours — this platform only gets permission to reply on your behalf.
          </p>
          <ul className="list-none m-0 p-0 mb-4 space-y-1">
            {BENEFITS.map((line) => (
              <li key={line} className="flex items-center gap-2 text-xs text-gray-500">
                <BadgeCheck size={13} className="text-brand shrink-0" /> {line}
              </li>
            ))}
          </ul>
          {config?.enabled ? (
            <Button onClick={connect} disabled={connecting}>
              {connecting ? 'Connecting...' : 'Connect WhatsApp Business'}
            </Button>
          ) : (
            <p className="text-xs text-gray-400 m-0">
              WhatsApp connection is not enabled on this deployment yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
