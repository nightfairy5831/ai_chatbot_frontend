import { useState, useEffect, useCallback } from 'react'
import { Phone, PhoneOff, Globe, Search, Building2, KeyRound } from 'lucide-react'
import Request, { showToast } from '../../../lib/request'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type WhatsappNumber, errorText } from '../types'

const COUNTRIES = [
  ['US', '🇺🇸 United States (+1)'], ['GB', '🇬🇧 United Kingdom (+44)'], ['CA', '🇨🇦 Canada (+1)'],
  ['AU', '🇦🇺 Australia (+61)'], ['DE', '🇩🇪 Germany (+49)'], ['FR', '🇫🇷 France (+33)'],
  ['ES', '🇪🇸 Spain (+34)'], ['IT', '🇮🇹 Italy (+39)'], ['BR', '🇧🇷 Brazil (+55)'],
  ['MX', '🇲🇽 Mexico (+52)'], ['JP', '🇯🇵 Japan (+81)'], ['KR', '🇰🇷 South Korea (+82)'],
  ['IN', '🇮🇳 India (+91)'], ['PE', '🇵🇪 Peru (+51)'], ['CL', '🇨🇱 Chile (+56)'],
  ['CO', '🇨🇴 Colombia (+57)'], ['AR', '🇦🇷 Argentina (+54)'], ['SA', '🇸🇦 Saudi Arabia (+966)'],
  ['AE', '🇦🇪 United Arab Emirates (+971)'],
]

type Mode = 'purchase' | 'platform' | 'client'

export default function WhatsappTab({ agentId }: { agentId: number }) {
  const [numbers, setNumbers] = useState<WhatsappNumber[]>([])
  const [mode, setMode] = useState<Mode>('purchase')

  const [country, setCountry] = useState('US')
  const [available, setAvailable] = useState<{ phone_number: string; friendly_name: string }[]>([])
  const [platformNumbers, setPlatformNumbers] = useState<{ phone_number: string; friendly_name: string }[]>([])
  const [searching, setSearching] = useState(false)

  const [clientNumber, setClientNumber] = useState('')
  const [clientSid, setClientSid] = useState('')
  const [clientToken, setClientToken] = useState('')
  const [connecting, setConnecting] = useState(false)

  const fetchNumbers = useCallback(async () => {
    try {
      setNumbers(await Request.Get(`/whatsapp/agents/${agentId}/numbers`))
    } catch { /* an empty list is the meaningful state here */ }
  }, [agentId])

  useEffect(() => { fetchNumbers() }, [fetchNumbers])

  const searchAvailable = async () => {
    setSearching(true)
    try {
      setAvailable(await Request.Get(`/whatsapp/available-numbers?country=${country}`))
    } catch (err) {
      showToast(errorText(err, 'Could not load available numbers'))
    } finally {
      setSearching(false)
    }
  }

  const loadPlatformNumbers = async () => {
    setSearching(true)
    try {
      setPlatformNumbers(await Request.Get('/whatsapp/platform-numbers'))
    } catch (err) {
      showToast(errorText(err, 'Could not load platform numbers'))
    } finally {
      setSearching(false)
    }
  }

  const connect = async (phone_number: string, connectMode: Mode, extra: Record<string, string> = {}) => {
    setConnecting(true)
    try {
      await Request.Post(`/whatsapp/agents/${agentId}/connect`, { phone_number, mode: connectMode, ...extra })
      showToast('Number connected')
      setAvailable([])
      setClientNumber(''); setClientSid(''); setClientToken('')
      await fetchNumbers()
    } catch (err) {
      showToast(errorText(err, 'Could not connect this number'))
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = async (id: number) => {
    if (!confirm('Disconnect this WhatsApp number?')) return
    try {
      await Request.Delete(`/whatsapp/numbers/${id}`)
      await fetchNumbers()
    } catch (err) {
      showToast(errorText(err, 'Could not disconnect this number'))
    }
  }

  const modeButton = (value: Mode, icon: React.ReactNode, title: string, subtitle: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={`flex-1 min-w-[180px] text-left px-4 py-3 rounded-lg border transition-colors ${
        mode === value ? 'border-brand bg-brand-light/40' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">{icon} {title}</span>
      <span className="block text-xs text-gray-500 mt-0.5">{subtitle}</span>
    </button>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="flex items-center gap-2 m-0 text-base font-semibold text-gray-900">
          <Phone size={18} className="text-green-500" /> WhatsApp Numbers
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
                      <p className="text-sm font-medium text-gray-900 m-0 flex items-center gap-2">
                        {wn.phone_number}
                        <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0 bg-gray-100 text-gray-500 border border-gray-200">
                          {wn.provider_mode === 'client' ? 'Your Twilio' : 'Platform'}
                        </Badge>
                      </p>
                      <p className="text-xs text-green-500 m-0 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Active
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => disconnect(wn.id)}>
                    <PhoneOff size={14} className="mr-1" /> Disconnect
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Phone size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm m-0">No numbers connected yet.</p>
              <p className="text-xs m-0 mt-1">Connect a number below to enable WhatsApp messaging.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h4 className="text-sm font-semibold text-gray-900 m-0 mb-1">Connect a Number</h4>
          <p className="text-xs text-gray-400 m-0 mb-4">
            A number must be registered as a WhatsApp sender with Twilio before it can receive WhatsApp messages.
          </p>

          <div className="flex flex-wrap gap-2 mb-5">
            {modeButton('purchase', <Globe size={15} className="text-brand" />, 'Buy a number', 'We provide it — billed with your plan')}
            {modeButton('platform', <Building2 size={15} className="text-brand" />, 'Use a platform number', 'Attach a sender we already own')}
            {modeButton('client', <KeyRound size={15} className="text-brand" />, 'Use my Twilio', 'Your account, your billing')}
          </div>

          {mode === 'purchase' && (
            <>
              <div className="flex gap-2 mb-4 items-end flex-wrap">
                <div className="w-56">
                  <Label className="block text-xs font-medium text-gray-500 mb-1">Country</Label>
                  <Select value={country} onValueChange={(v) => setCountry(v || 'US')}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select country..." /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(([code, label]) => <SelectItem key={code} value={code}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={searchAvailable} disabled={searching}>
                  {searching
                    ? <><span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" /> Searching...</>
                    : <><Search size={14} className="mr-1.5" /> Search Numbers</>}
                </Button>
              </div>
              {available.length > 0 ? (
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {available.map((n) => (
                    <div key={n.phone_number} className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center"><Phone size={14} /></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 m-0">{n.phone_number}</p>
                          {n.friendly_name && <p className="text-xs text-gray-400 m-0">{n.friendly_name}</p>}
                        </div>
                      </div>
                      <Button size="sm" disabled={connecting} onClick={() => connect(n.phone_number, 'purchase')}>Connect</Button>
                    </div>
                  ))}
                </div>
              ) : (
                !searching && <p className="text-sm text-gray-400 m-0 text-center py-2">Select a country and search to find available numbers.</p>
              )}
            </>
          )}

          {mode === 'platform' && (
            <>
              <Button variant="outline" onClick={loadPlatformNumbers} disabled={searching} className="mb-3">
                {searching ? 'Loading...' : 'Load platform numbers'}
              </Button>
              {platformNumbers.length > 0 ? (
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {platformNumbers.map((n) => (
                    <div key={n.phone_number} className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-100 bg-gray-50/50">
                      <div>
                        <p className="text-sm font-medium text-gray-900 m-0">{n.phone_number}</p>
                        {n.friendly_name && <p className="text-xs text-gray-400 m-0">{n.friendly_name}</p>}
                      </div>
                      <Button size="sm" disabled={connecting} onClick={() => connect(n.phone_number, 'platform')}>Attach</Button>
                    </div>
                  ))}
                </div>
              ) : (
                !searching && <p className="text-sm text-gray-400 m-0">No numbers loaded yet.</p>
              )}
            </>
          )}

          {mode === 'client' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                connect(clientNumber.trim(), 'client', {
                  twilio_account_sid: clientSid.trim(),
                  twilio_auth_token: clientToken.trim(),
                })
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <Label className="block text-xs font-medium text-gray-500 mb-1">WhatsApp Number</Label>
                  <Input value={clientNumber} onChange={(e) => setClientNumber(e.target.value)} placeholder="+5511999999999" />
                </div>
                <div>
                  <Label className="block text-xs font-medium text-gray-500 mb-1">Twilio Account SID</Label>
                  <Input value={clientSid} onChange={(e) => setClientSid(e.target.value)} placeholder="AC..." />
                </div>
                <div>
                  <Label className="block text-xs font-medium text-gray-500 mb-1">Twilio Auth Token</Label>
                  <Input type="password" value={clientToken} onChange={(e) => setClientToken(e.target.value)} placeholder="••••••••" />
                </div>
              </div>
              <p className="text-xs text-gray-400 m-0 mb-3">
                Your token is encrypted before it is stored and is never shown again. You keep paying Twilio directly.
              </p>
              <Button type="submit" size="sm" disabled={connecting || !clientNumber || !clientSid || !clientToken}>
                {connecting ? 'Connecting...' : 'Connect my number'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
