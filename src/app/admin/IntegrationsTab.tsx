import { useState, useEffect, useCallback } from 'react'
import { Phone, Calendar, Search, PhoneOff } from 'lucide-react'
import Request from '../../lib/request'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { errorText } from '../agent-detail/types'

function errorStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status
}

interface AdminNumber {
  id: number; phone_number: string; agent_id: number; user_id: number; provider_mode: string
  is_active: boolean; created_at: string | null
  owner_username: string | null; owner_email: string | null; agent_name: string | null
  twilio_account_sid: string | null
}

interface AdminConnection {
  id: number; agent_id: number; user_id: number; calendar_id: string | null; is_active: boolean
  created_at: string | null; owner_username: string | null; owner_email: string | null; agent_name: string | null
}

export default function IntegrationsTab({ onLogout }: { onLogout: () => void }) {
  const [numbers, setNumbers] = useState<AdminNumber[]>([])
  const [connections, setConnections] = useState<AdminConnection[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [n, c] = await Promise.all([
        Request.Get('/whatsapp/admin/numbers'),
        Request.Get('/calendar/admin/connections'),
      ])
      setNumbers(n)
      setConnections(c)
    } catch (err) {
      if (errorStatus(err) === 401) { onLogout(); return }
      setError(errorText(err, 'Failed to load integrations'))
    } finally {
      setLoading(false)
    }
  }, [onLogout])

  useEffect(() => { fetchAll() }, [fetchAll])

  const disconnectNumber = async (n: AdminNumber) => {
    if (!confirm(`Disconnect ${n.phone_number}?`)) return
    try { await Request.Delete(`/whatsapp/admin/numbers/${n.id}`); fetchAll() }
    catch (err) { setError(errorText(err, 'Failed to disconnect')) }
  }

  const term = search.toLowerCase()
  const matches = (...values: (string | null)[]) =>
    !term || values.some((v) => (v || '').toLowerCase().includes(term))

  const visibleNumbers = numbers.filter((n) => matches(n.phone_number, n.owner_username, n.owner_email, n.agent_name))
  const visibleConnections = connections.filter((c) => matches(c.owner_username, c.owner_email, c.agent_name))

  return (
    <div>
      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        <Input className="pl-8" placeholder="Search by number, owner or agent..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 m-0 mb-2">
        <Phone size={16} className="text-green-500" /> WhatsApp Numbers
        <span className="text-xs font-normal text-gray-400">({visibleNumbers.length})</span>
      </h3>
      <Card className="overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">Number</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Owner</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Agent</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Provider</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wider w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleNumbers.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="text-sm font-medium text-gray-900">{n.phone_number}</TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-900 m-0">{n.owner_username || '—'}</p>
                    <p className="text-xs text-gray-400 m-0">{n.owner_email}</p>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{n.agent_name || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={n.provider_mode === 'client' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-sky-50 text-sky-600 border border-sky-100'}>
                      {n.provider_mode === 'client' ? `client${n.twilio_account_sid ? ` · ${n.twilio_account_sid.slice(0, 8)}…` : ''}` : 'platform'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={n.is_active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}>
                      {n.is_active ? 'Active' : 'Disconnected'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {n.is_active && (
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-red-600" title="Disconnect" onClick={() => disconnectNumber(n)}>
                        <PhoneOff size={14} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {visibleNumbers.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-400 py-8 text-sm">{loading ? 'Loading…' : 'No WhatsApp numbers connected'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 m-0 mb-2">
        <Calendar size={16} className="text-brand" /> Google Calendars
        <span className="text-xs font-normal text-gray-400">({visibleConnections.length})</span>
      </h3>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">Owner</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Agent</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Calendar</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Connected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleConnections.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="text-sm text-gray-900 m-0">{c.owner_username || '—'}</p>
                    <p className="text-xs text-gray-400 m-0">{c.owner_email}</p>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{c.agent_name || '—'}</TableCell>
                  <TableCell className="text-sm text-gray-500">{c.calendar_id || 'primary'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={c.is_active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}>
                      {c.is_active ? 'Active' : 'Disconnected'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400 text-right">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</TableCell>
                </TableRow>
              ))}
              {visibleConnections.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-8 text-sm">{loading ? 'Loading…' : 'No calendars connected'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
