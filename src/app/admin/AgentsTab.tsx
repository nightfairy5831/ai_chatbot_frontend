import { useState, useEffect } from 'react'
import { Search, Trash2, MessageSquare } from 'lucide-react'
import Request from '../../lib/request'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

interface AdminAgent {
  id: number; name: string; description: string | null; business_name: string | null; industry: string | null; tone: string | null
  owner_username: string; owner_email: string; product_count: number; question_count: number; created_at: string | null
}

export default function AgentsTab({ onLogout, onTestAgent }: { onLogout: () => void; onTestAgent?: (agentId: number) => void }) {
  const [agents, setAgents] = useState<AdminAgent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchAgents = async () => {
    try { const data = await Request.Get('/admin/agents?search='); setAgents(data) }
    catch (err: any) { if (err.response?.status === 401) onLogout() }
  }

  useEffect(() => { fetchAgents() }, [])

  const deleteAgent = async (agent: AdminAgent) => {
    if (!confirm(`Delete "${agent.name}"?`)) return
    try { await Request.Delete(`/admin/agents/${agent.id}`); fetchAgents() }
    catch (err: any) { setError(err.response?.data?.detail || 'Failed') }
  }

  const filtered = agents.filter((a) => {
    if (!search) return true
    const s = search.toLowerCase()
    return a.name.toLowerCase().includes(s) || a.owner_username.toLowerCase().includes(s) || (a.industry || '').toLowerCase().includes(s)
  })

  return (
    <div>
      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <Input className="pl-8" placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">Agent</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Owner</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Products</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Questions</TableHead>
                <TableHead className="text-xs uppercase tracking-wider w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <p className="text-sm font-medium text-gray-900 m-0">{a.name}</p>
                    <p className="text-xs text-gray-400 m-0">{[a.industry, a.tone].filter(Boolean).join(' · ') || '—'}</p>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{a.owner_username}</TableCell>
                  <TableCell className="text-sm text-gray-500">{a.product_count}</TableCell>
                  <TableCell className="text-sm text-gray-500">{a.question_count}</TableCell>
                  <TableCell>
                    <div className="flex gap-0.5 justify-end">
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-blue-600" title="Test" onClick={() => onTestAgent?.(a.id)}>
                        <MessageSquare size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-red-600" title="Delete" onClick={() => deleteAgent(a)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-8 text-sm">No agents found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
