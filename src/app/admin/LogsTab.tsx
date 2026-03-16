import { useState, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import Request from '../../lib/request'

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
      <div className="admin-filter-card" onKeyDown={(e) => e.key === 'Enter' && handleSearch()}>
        <div className="admin-filter-header">
          <div className="admin-filter-title">
            <Filter size={14} />
            <span>Filters</span>
          </div>
        </div>
        <div className="admin-filter-grid">
          <div className="admin-filter-field">
            <label className="admin-filter-label">Question</label>
            <div className="admin-filter-input-wrap">
              <Search size={14} className="admin-filter-input-icon" />
              <input
                className="admin-filter-input"
                placeholder="Search question..."
                value={filters.question}
                onChange={(e) => setFilters(f => ({ ...f, question: e.target.value }))}
              />
            </div>
          </div>
          <div className="admin-filter-field admin-filter-field--narrow">
            <label className="admin-filter-label">User</label>
            <input
              className="admin-filter-input"
              placeholder="Username..."
              value={filters.user}
              onChange={(e) => setFilters(f => ({ ...f, user: e.target.value }))}
            />
          </div>
          <div className="admin-filter-field admin-filter-field--narrow">
            <label className="admin-filter-label">Agent</label>
            <input
              className="admin-filter-input"
              placeholder="Agent name..."
              value={filters.agent}
              onChange={(e) => setFilters(f => ({ ...f, agent: e.target.value }))}
            />
          </div>
          <div className="admin-filter-field admin-filter-field--narrow">
            <label className="admin-filter-label">Start Date</label>
            <input
              type="date"
              className="admin-filter-input"
              value={filters.startDate}
              onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className="admin-filter-field admin-filter-field--narrow">
            <label className="admin-filter-label">End Date</label>
            <input
              type="date"
              className="admin-filter-input"
              value={filters.endDate}
              onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        </div>
        <div className="admin-filter-actions">
          <button className="btn-primary btn-sm" onClick={handleSearch}>
            <Search size={14} /> Search
          </button>
          <button className="btn-secondary btn-sm" onClick={handleClear} disabled={!hasActiveFilters}>
            <X size={14} /> Clear
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>User</th>
              <th>Agent</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.question}
                </td>
                <td>{log.username}</td>
                <td>{log.agent_name}</td>
                <td>{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No activity logs found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
