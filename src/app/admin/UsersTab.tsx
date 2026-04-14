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
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {/* Filter Card */}
      <div
        className="bg-white border border-gray-200 rounded-[10px] py-3 px-4 mb-4"
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-[0.85rem] font-semibold text-gray-500 uppercase tracking-wide">
            <Filter size={14} />
            <span>Filters</span>
          </div>
        </div>
        <div className="flex gap-4 items-end flex-wrap max-md:flex-col max-md:gap-3">
          <div className="flex flex-col gap-1 w-[260px] shrink-0 max-md:w-full max-md:shrink">
            <label className="text-[0.8rem] font-semibold text-gray-400 tracking-wide">Name</label>
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-2.5 text-gray-300 pointer-events-none" />
              <input
                className="w-full box-border py-2 pr-3 pl-8 border border-gray-200 rounded-[7px] text-[0.9rem] text-gray-700 bg-gray-50 outline-none transition-[border-color,background] duration-150 focus:border-blue-500 focus:bg-white placeholder:text-gray-400"
                placeholder="Search name..."
                value={filters.name}
                onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 w-[260px] shrink-0 max-md:w-full max-md:shrink">
            <label className="text-[0.8rem] font-semibold text-gray-400 tracking-wide">Email</label>
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-2.5 text-gray-300 pointer-events-none" />
              <input
                className="w-full box-border py-2 pr-3 pl-8 border border-gray-200 rounded-[7px] text-[0.9rem] text-gray-700 bg-gray-50 outline-none transition-[border-color,background] duration-150 focus:border-blue-500 focus:bg-white placeholder:text-gray-400"
                placeholder="Search email..."
                value={filters.email}
                onChange={(e) => setFilters(f => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 w-[180px] shrink-0 max-md:w-full max-md:shrink">
            <label className="text-[0.8rem] font-semibold text-gray-400 tracking-wide">Status</label>
            <select
              className="w-full box-border py-2 px-3 pr-7 border border-gray-200 rounded-[7px] text-[0.9rem] text-gray-700 bg-gray-50 outline-none cursor-pointer transition-[border-color,background] duration-150 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2710%27%20height%3D%276%27%20viewBox%3D%270%200%2010%206%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201L5%205L9%201%27%20stroke%3D%27%239CA3AF%27%20stroke-width%3D%271.5%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.6rem_center] focus:border-blue-500 focus:bg-white"
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 w-[180px] shrink-0 max-md:w-full max-md:shrink">
            <label className="text-[0.8rem] font-semibold text-gray-400 tracking-wide">Min Agents</label>
            <input
              className="w-full box-border py-2 px-3 border border-gray-200 rounded-[7px] text-[0.9rem] text-gray-700 bg-gray-50 outline-none transition-[border-color,background] duration-150 focus:border-blue-500 focus:bg-white placeholder:text-gray-400"
              type="number"
              min="0"
              placeholder="0"
              value={filters.minAgents}
              onChange={(e) => setFilters(f => ({ ...f, minAgents: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3 pt-2.5 border-t border-gray-100">
          <button
            className="inline-flex items-center gap-1.5 py-2 px-4 text-sm rounded-[7px] border-none bg-blue-500 text-white font-semibold cursor-pointer transition-colors duration-150 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSearch}
          >
            <Search size={14} /> Search
          </button>
          <button
            className="inline-flex items-center gap-1.5 py-2 px-4 text-sm rounded-[7px] border border-gray-200 bg-white text-gray-700 font-medium cursor-pointer transition-colors duration-150 hover:bg-gray-100 hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleClear}
            disabled={!hasActiveFilters}
          >
            <X size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden max-md:overflow-x-auto max-md:[&_::-webkit-scrollbar]{display:none}">
        <table className="w-full border-collapse text-[0.95rem] max-md:min-w-[600px] max-[480px]:min-w-[500px] max-[480px]:text-[0.85rem]">
          <thead>
            <tr>
              <th className="text-left py-3.5 px-4 max-[480px]:py-2.5 max-[480px]:px-2 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 text-[0.85rem] uppercase tracking-wider">User</th>
              <th className="text-left py-3.5 px-4 max-[480px]:py-2.5 max-[480px]:px-2 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 text-[0.85rem] uppercase tracking-wider">Email</th>
              <th className="text-left py-3.5 px-4 max-[480px]:py-2.5 max-[480px]:px-2 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 text-[0.85rem] uppercase tracking-wider">Role</th>
              <th className="text-left py-3.5 px-4 max-[480px]:py-2.5 max-[480px]:px-2 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 text-[0.85rem] uppercase tracking-wider">Status</th>
              <th className="text-left py-3.5 px-4 max-[480px]:py-2.5 max-[480px]:px-2 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 text-[0.85rem] uppercase tracking-wider">Agents</th>
              <th className="text-left py-3.5 px-4 max-[480px]:py-2.5 max-[480px]:px-2 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 text-[0.85rem] uppercase tracking-wider">Joined</th>
              <th className="text-left py-3.5 px-4 max-[480px]:py-2.5 max-[480px]:px-2 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 text-[0.85rem] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:[&>td]:bg-[#fafafa]">
                <td className="py-3 px-4 max-[480px]:py-2.5 max-[480px]:px-2 border-b border-gray-100 text-gray-700 font-semibold">{u.username}</td>
                <td className="py-3 px-4 max-[480px]:py-2.5 max-[480px]:px-2 border-b border-gray-100 text-gray-700">{u.email}</td>
                <td className="py-3 px-4 max-[480px]:py-2.5 max-[480px]:px-2 border-b border-gray-100 text-gray-700">
                  <span className={`inline-block py-0.5 px-2.5 rounded-md text-xs font-semibold capitalize ${
                    u.role === 'admin'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 max-[480px]:py-2.5 max-[480px]:px-2 border-b border-gray-100 text-gray-700">
                  <span className={`inline-block py-0.5 px-2.5 rounded-md text-xs font-semibold capitalize ${
                    u.is_active
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 max-[480px]:py-2.5 max-[480px]:px-2 border-b border-gray-100 text-gray-700">{u.agent_count}</td>
                <td className="py-3 px-4 max-[480px]:py-2.5 max-[480px]:px-2 border-b border-gray-100 text-gray-700">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                <td className="py-3 px-4 max-[480px]:py-2.5 max-[480px]:px-2 border-b border-gray-100 text-gray-700">
                  <div className="flex gap-1">
                    {u.role !== 'admin' && (
                      <>
                        <button
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer text-gray-400 transition-[background,color] duration-150 hover:bg-gray-100 hover:text-gray-700 border-none bg-transparent p-0"
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                          onClick={() => toggleUserActive(u)}
                        >
                          {u.is_active ? <UserX size={20} /> : <UserCheck size={20} />}
                        </button>
                        <button
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer text-gray-400 transition-[background,color] duration-150 hover:bg-red-50 hover:text-red-600 border-none bg-transparent p-0"
                          title="Delete"
                          onClick={() => deleteUser(u)}
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8 px-4">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
