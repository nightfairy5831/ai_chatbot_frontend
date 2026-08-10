import { useState, useEffect, useCallback } from 'react'
import { Globe, Copy, Check } from 'lucide-react'
import Request, { showToast } from '../../../lib/request'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { type Agent, errorText } from '../types'

export default function WebsiteTab({ agent, onChanged }: { agent: Agent; onChanged: () => void }) {
  const [snippet, setSnippet] = useState('')
  const [enabled, setEnabled] = useState(agent.public_chat_enabled)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [origins, setOrigins] = useState(agent.allowed_origins || '')
  const [savingOrigins, setSavingOrigins] = useState(false)
  const [originsMsg, setOriginsMsg] = useState<string | null>(null)

  const fetchEmbed = useCallback(async () => {
    try {
      const data = await Request.Get(`/agents/${agent.id}/embed`)
      setSnippet(data.snippet)
      setEnabled(data.enabled)
    } catch (err) {
      showToast(errorText(err, 'Could not load the embed snippet'))
    }
  }, [agent.id])

  useEffect(() => { fetchEmbed() }, [fetchEmbed])

  const toggle = async () => {
    setSaving(true)
    try {
      await Request.Patch(`/agents/${agent.id}`, { public_chat_enabled: !enabled })
      setEnabled(!enabled)
      onChanged()
    } catch (err) {
      showToast(errorText(err, 'Could not update the website chat'))
    } finally {
      setSaving(false)
    }
  }

  const saveOrigins = async () => {
    setSavingOrigins(true)
    setOriginsMsg(null)
    try {
      await Request.Patch(`/agents/${agent.id}`, { allowed_origins: origins.trim() || null })
      setOriginsMsg('Saved')
      onChanged()
      setTimeout(() => setOriginsMsg(null), 3000)
    } catch (err) {
      showToast(errorText(err, 'Could not save the allowed websites'))
    } finally {
      setSavingOrigins(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Copy failed — select the snippet and copy manually')
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="flex items-center gap-2 m-0 text-base font-semibold text-gray-900">
              <Globe size={18} className="text-brand" /> Website Chat
            </h3>
            <p className="text-xs text-gray-400 m-0 mt-1 max-w-lg">
              Adds a chat bubble to your website. Visitors talk to this agent directly — conversations count
              towards your plan and appear in your activity log.
            </p>
          </div>
          <Button variant={enabled ? 'outline' : 'default'} onClick={toggle} disabled={saving}>
            {saving ? 'Saving...' : enabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        <div className={`flex items-center gap-2 text-xs font-medium mb-4 ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
          {enabled ? 'Live — the snippet below is answering visitors' : 'Disabled — the snippet will not respond'}
        </div>

        <div className="relative">
          <pre className="bg-gray-900 text-gray-300 p-4 pr-12 rounded-lg text-xs leading-relaxed whitespace-pre-wrap break-all m-0">
            {snippet || 'Loading…'}
          </pre>
          <Button
            variant="ghost" size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
            onClick={copy} disabled={!snippet}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 m-0">
          Paste this just before the closing <code>&lt;/body&gt;</code> tag on every page you want the chat on.
        </p>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <Label className="block text-xs font-medium text-gray-500 mb-1">Allowed websites</Label>
          <p className="text-xs text-gray-400 m-0 mb-2 max-w-lg">
            Leave empty to allow any site. Listing your domains stops anyone else embedding this
            agent and spending your message allowance. Comma separated, e.g.
            <code className="ml-1">https://acme.com, https://www.acme.com</code>
          </p>
          <div className="flex gap-2 flex-wrap">
            <Input
              className="flex-1 min-w-64"
              value={origins}
              onChange={(e) => setOrigins(e.target.value)}
              placeholder="https://yourdomain.com"
            />
            <Button variant="outline" onClick={saveOrigins} disabled={savingOrigins}>
              {savingOrigins ? 'Saving...' : 'Save'}
            </Button>
            {originsMsg && <span className="text-xs text-green-600 self-center">{originsMsg}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
