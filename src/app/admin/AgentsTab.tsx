import { useState, useEffect } from 'react'
import { Search, Trash2, MessageSquare, X, Filter } from 'lucide-react'
import Request from '../../lib/request'

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
      {error && <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

      <div className="admin-filter-card" onKeyDown={(e) => e.key === 'Enter' && handleSearch()}>
        <div className="admin-filter-header">
          <div className="admin-filter-title">
            <Filter size={14} />
            <span>Filters</span>
          </div>
        </div>
        <div className="admin-filter-grid">
          <div className="admin-filter-field">
            <label className="admin-filter-label">Name</label>
            <div className="admin-filter-input-wrap">
              <Search size={14} className="admin-filter-input-icon" />
              <input
                className="admin-filter-input"
                placeholder="Search name..."
                value={filters.name}
                onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
              />
            </div>
          </div>
          <div className="admin-filter-field">
            <label className="admin-filter-label">Owner</label>
            <div className="admin-filter-input-wrap">
              <Search size={14} className="admin-filter-input-icon" />
              <input
                className="admin-filter-input"
                placeholder="Search owner..."
                value={filters.owner}
                onChange={(e) => setFilters(f => ({ ...f, owner: e.target.value }))}
              />
            </div>
          </div>
          <div className="admin-filter-field admin-filter-field--narrow">
            <label className="admin-filter-label">Industry</label>
            <input
              className="admin-filter-input"
              placeholder="Industry..."
              value={filters.industry}
              onChange={(e) => setFilters(f => ({ ...f, industry: e.target.value }))}
            />
          </div>
          <div className="admin-filter-field admin-filter-field--narrow">
            <label className="admin-filter-label">Tone</label>
            <input
              className="admin-filter-input"
              placeholder="Tone..."
              value={filters.tone}
              onChange={(e) => setFilters(f => ({ ...f, tone: e.target.value }))}
            />
          </div>
          <div className="admin-filter-field admin-filter-field--narrow">
            <label className="admin-filter-label">Min Products</label>
            <input
              className="admin-filter-input"
              type="number"
              min="0"
              placeholder="0"
              value={filters.minProducts}
              onChange={(e) => setFilters(f => ({ ...f, minProducts: e.target.value }))}
            />
          </div>
          <div className="admin-filter-field admin-filter-field--narrow">
            <label className="admin-filter-label">Min Questions</label>
            <input
              className="admin-filter-input"
              type="number"
              min="0"
              placeholder="0"
              value={filters.minQuestions}
              onChange={(e) => setFilters(f => ({ ...f, minQuestions: e.target.value }))}
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
              <th>Agent</th>
              <th>Owner</th>
              <th>Industry</th>
              <th>Tone</th>
              <th>Products</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.map((a) => (
              <tr key={a.id}>
                <td>
                  <div>
                    <span style={{ fontWeight: 600 }}>{a.name}</span>
                    {a.business_name && <span style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block' }}>{a.business_name}</span>}
                  </div>
                </td>
                <td>{a.owner_username}</td>
                <td>{a.industry || '—'}</td>
                <td>{a.tone || '—'}</td>
                <td>{a.product_count}</td>
                <td>{a.question_count}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      className="btn-icon"
                      title="Test chat"
                      onClick={() => onTestAgent?.(a.id)}
                    >
                      <MessageSquare size={15} />
                    </button>
                    <button className="btn-icon danger" title="Delete" onClick={() => deleteAgent(a)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAgents.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No agents found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
