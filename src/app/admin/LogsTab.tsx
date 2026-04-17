import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Request from '../../lib/request'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface ActivityLog {
  id: number; question: string; username: string; agent_name: string; agent_id: number; created_at: string | null
}

export default function LogsTab({ onLogout }: { onLogout: () => void }) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [search, setSearch] = useState('')

  const fetchLogs = async () => {
    try { const data = await Request.Get('/admin/logs?search='); setLogs(data) }
    catch (err: any) { if (err.response?.status === 401) onLogout() }
  }

  useEffect(() => { fetchLogs() }, [])

  const filtered = logs.filter((l) => {
    if (!search) return true
    const s = search.toLowerCase()
    return l.question.toLowerCase().includes(s) || l.username.toLowerCase().includes(s) || l.agent_name.toLowerCase().includes(s)
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <Input className="pl-8" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm m-0">No logs found</p>
          ) : (
            filtered.slice(0, 50).map((l) => (
              <div key={l.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium m-0 truncate">{l.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{l.username}</span>
                    <span className="text-xs text-gray-200">·</span>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border border-blue-100 text-xs px-2 py-0 rounded-full">{l.agent_name}</Badge>
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap pt-0.5">
                  {l.created_at ? new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date(l.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
