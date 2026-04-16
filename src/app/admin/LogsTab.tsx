import { useState, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import Request from '../../lib/request'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

interface ActivityLog {
  id: number
  question: string
  username: string
  agent_name: string
  agent_id: number
  created_at: string | null
}

const defaultFilters = { question: '', user: '', agent: '', startDate: '', endDate: '' }

export default function LogsTab({ onLogout }: { onLogout: () => void }) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)

  const hasActiveFilters = appliedFilters.question || appliedFilters.user || appliedFilters.agent || appliedFilters.startDate || appliedFilters.endDate

  const fetchLogs = async () => {
    try {
      const data = await Request.Get('/admin/logs?search=')
      setLogs(data)
    } catch (err: any) {
      if (err.response?.status === 401) onLogout()
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const handleSearch = () => setAppliedFilters({ ...filters })

  const handleClear = () => {
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  const filteredLogs = logs.filter((log) => {
    if (appliedFilters.question && !log.question.toLowerCase().includes(appliedFilters.question.toLowerCase())) return false
    if (appliedFilters.user && !log.username.toLowerCase().includes(appliedFilters.user.toLowerCase())) return false
    if (appliedFilters.agent && !log.agent_name.toLowerCase().includes(appliedFilters.agent.toLowerCase())) return false
    if (appliedFilters.startDate && log.created_at) {
      const logDate = new Date(log.created_at)
      const start = new Date(appliedFilters.startDate)
      start.setHours(0, 0, 0, 0)
      if (logDate < start) return false
    }
    if (appliedFilters.endDate && log.created_at) {
      const logDate = new Date(log.created_at)
      const end = new Date(appliedFilters.endDate)
      end.setHours(23, 59, 59, 999)
      if (logDate > end) return false
    }
    return true
  })

  return (
    <div>
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
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Question</Label>
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-gray-300 pointer-events-none" />
                <Input
                  className="pl-8 bg-gray-50"
                  placeholder="Search question..."
                  value={filters.question}
                  onChange={(e) => setFilters(f => ({ ...f, question: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 w-44 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">User</Label>
              <Input
                className="bg-gray-50"
                placeholder="Username..."
                value={filters.user}
                onChange={(e) => setFilters(f => ({ ...f, user: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1 w-44 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Agent</Label>
              <Input
                className="bg-gray-50"
                placeholder="Agent name..."
                value={filters.agent}
                onChange={(e) => setFilters(f => ({ ...f, agent: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1 w-44 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Start Date</Label>
              <Input
                type="date"
                className="bg-gray-50"
                value={filters.startDate}
                onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1 w-44 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">End Date</Label>
              <Input
                type="date"
                className="bg-gray-50"
                value={filters.endDate}
                onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
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
              <TableHead className="text-xs uppercase tracking-wider">Question</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">User</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Agent</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="max-w-96 overflow-hidden text-ellipsis whitespace-nowrap">
                  {log.question}
                </TableCell>
                <TableCell>{log.username}</TableCell>
                <TableCell>{log.agent_name}</TableCell>
                <TableCell>{log.created_at ? new Date(log.created_at).toLocaleString() : '\u2014'}</TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400 py-8">No activity logs found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
