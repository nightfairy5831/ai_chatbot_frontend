import { useState, useEffect } from 'react'
import { Search, Trash2, MessageSquare, X, Filter } from 'lucide-react'
import Request from '../../lib/request'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

interface AdminAgent {
  id: number
  name: string
  description: string | null
  business_name: string | null
  industry: string | null
  tone: string | null
  owner_username: string
  owner_email: string
  product_count: number
  question_count: number
  created_at: string | null
}

const defaultFilters = { name: '', owner: '', industry: '', tone: '', minProducts: '', minQuestions: '' }

export default function AgentsTab({ onLogout, onTestAgent }: { onLogout: () => void; onTestAgent?: (agentId: number) => void }) {
  const [agents, setAgents] = useState<AdminAgent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)

  const hasActiveFilters = appliedFilters.name || appliedFilters.owner || appliedFilters.industry || appliedFilters.tone || appliedFilters.minProducts || appliedFilters.minQuestions

  const fetchAgents = async () => {
    try {
      const data = await Request.Get('/admin/agents?search=')
      setAgents(data)
    } catch (err: any) {
      if (err.response?.status === 401) onLogout()
    }
  }

  useEffect(() => { fetchAgents() }, [])

  const handleSearch = () => setAppliedFilters({ ...filters })

  const handleClear = () => {
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  const deleteAgent = async (agent: AdminAgent) => {
    if (!confirm(`Delete agent "${agent.name}"?`)) return
    try {
      await Request.Delete(`/admin/agents/${agent.id}`)
      fetchAgents()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete agent')
    }
  }

  const filteredAgents = agents.filter((a) => {
    if (appliedFilters.name && !a.name.toLowerCase().includes(appliedFilters.name.toLowerCase())) return false
    if (appliedFilters.owner && !a.owner_username.toLowerCase().includes(appliedFilters.owner.toLowerCase())) return false
    if (appliedFilters.industry && !(a.industry || '').toLowerCase().includes(appliedFilters.industry.toLowerCase())) return false
    if (appliedFilters.tone && !(a.tone || '').toLowerCase().includes(appliedFilters.tone.toLowerCase())) return false
    if (appliedFilters.minProducts && a.product_count < Number(appliedFilters.minProducts)) return false
    if (appliedFilters.minQuestions && a.question_count < Number(appliedFilters.minQuestions)) return false
    return true
  })

  return (
    <div>
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {/* Filter Card */}
      <Card
        className="mb-4"
        onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
      >
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <Filter size={14} />
              <span>Filters</span>
            </div>
          </div>
          <div className="flex gap-4 items-end flex-wrap max-md:flex-col max-md:gap-3">
            <div className="flex flex-col gap-1 w-64 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Name</Label>
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-gray-300 pointer-events-none" />
                <Input
                  className="pl-8 bg-gray-50"
                  placeholder="Search name..."
                  value={filters.name}
                  onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 w-64 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Owner</Label>
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-gray-300 pointer-events-none" />
                <Input
                  className="pl-8 bg-gray-50"
                  placeholder="Search owner..."
                  value={filters.owner}
                  onChange={(e) => setFilters(f => ({ ...f, owner: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 w-44 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Industry</Label>
              <Input
                className="bg-gray-50"
                placeholder="Industry..."
                value={filters.industry}
                onChange={(e) => setFilters(f => ({ ...f, industry: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1 w-44 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Tone</Label>
              <Input
                className="bg-gray-50"
                placeholder="Tone..."
                value={filters.tone}
                onChange={(e) => setFilters(f => ({ ...f, tone: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1 w-44 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Min Products</Label>
              <Input
                className="bg-gray-50"
                type="number"
                min="0"
                placeholder="0"
                value={filters.minProducts}
                onChange={(e) => setFilters(f => ({ ...f, minProducts: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1 w-44 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Min Questions</Label>
              <Input
                className="bg-gray-50"
                type="number"
                min="0"
                placeholder="0"
                value={filters.minQuestions}
                onChange={(e) => setFilters(f => ({ ...f, minQuestions: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3 pt-2.5 border-t border-gray-100">
            <Button size="sm" onClick={handleSearch}>
              <Search size={14} /> Search
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={!hasActiveFilters}
            >
              <X size={14} /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden max-md:overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider">Agent</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Owner</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Industry</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Tone</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Products</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Questions</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <div>
                    <span className="font-semibold">{a.name}</span>
                    {a.business_name && <span className="text-gray-500 text-xs block">{a.business_name}</span>}
                  </div>
                </TableCell>
                <TableCell>{a.owner_username}</TableCell>
                <TableCell>{a.industry || '\u2014'}</TableCell>
                <TableCell>{a.tone || '\u2014'}</TableCell>
                <TableCell>{a.product_count}</TableCell>
                <TableCell>{a.question_count}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-gray-700"
                      title="Test chat"
                      onClick={() => onTestAgent?.(a.id)}
                    >
                      <MessageSquare size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                      onClick={() => deleteAgent(a)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredAgents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">No agents found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
