import { useState, useEffect } from 'react'
import { Trash2, UserCheck, UserX, Search, X, Filter } from 'lucide-react'
import Request from '../../lib/request'

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  created_at: string | null
  agent_count: number
}

const defaultFilters = { name: '', email: '', status: 'all', minAgents: '' }

export default function UsersTab({ onLogout }: { onLogout: () => void }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)

  const hasActiveFilters = appliedFilters.name || appliedFilters.email || appliedFilters.status !== 'all' || appliedFilters.minAgents

  const fetchUsers = async () => {
    try {
      const data = await Request.Get('/admin/users?search=')
      setUsers(data)
    } catch (err: any) {
      if (err.response?.status === 401) onLogout()
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSearch = () => setAppliedFilters({ ...filters })

  const handleClear = () => {
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  const toggleUserActive = async (user: AdminUser) => {
    try {
      await Request.Patch(`/admin/users/${user.id}`, { is_active: !user.is_active })
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user')
    }
  }

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Delete user "${user.username}"? This will remove all their agents and data.`)) return
    try {
      await Request.Delete(`/admin/users/${user.id}`)
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user')
    }
  }

  const filteredUsers = users.filter((u) => {
    if (appliedFilters.name && !u.username.toLowerCase().includes(appliedFilters.name.toLowerCase())) return false
    if (appliedFilters.email && !u.email.toLowerCase().includes(appliedFilters.email.toLowerCase())) return false
    if (appliedFilters.status === 'active' && !u.is_active) return false
    if (appliedFilters.status === 'inactive' && u.is_active) return false
    if (appliedFilters.minAgents && u.agent_count < Number(appliedFilters.minAgents)) return false
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
            <label className="admin-filter-label">Email</label>
            <div className="admin-filter-input-wrap">
              <Search size={14} className="admin-filter-input-icon" />
              <input
                className="admin-filter-input"
                placeholder="Search email..."
                value={filters.email}
                onChange={(e) => setFilters(f => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="admin-filter-field admin-filter-field--narrow">
            <label className="admin-filter-label">Status</label>
            <select
              className="admin-filter-select"
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="admin-filter-field admin-filter-field--narrow">
            <label className="admin-filter-label">Min Agents</label>
            <input
              className="admin-filter-input"
              type="number"
              min="0"
              placeholder="0"
              value={filters.minAgents}
              onChange={(e) => setFilters(f => ({ ...f, minAgents: e.target.value }))}
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
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Agents</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`admin-badge ${u.role === 'admin' ? 'badge-admin' : 'badge-client'}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`admin-badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{u.agent_count}</td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {u.role !== 'admin' && (
                      <>
                        <button className="btn-icon" title={u.is_active ? 'Deactivate' : 'Activate'} onClick={() => toggleUserActive(u)}>
                          {u.is_active ? <UserX size={20} /> : <UserCheck size={20} />}
                        </button>
                        <button className="btn-icon danger" title="Delete" onClick={() => deleteUser(u)}>
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
