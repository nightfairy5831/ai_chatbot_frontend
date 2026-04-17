import { useState, useEffect } from 'react'
import { Trash2, UserCheck, UserX, Search, X, Filter } from 'lucide-react'
import Request from '../../lib/request'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

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
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Email</Label>
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-gray-300 pointer-events-none" />
                <Input
                  className="pl-8 bg-gray-50"
                  placeholder="Search email..."
                  value={filters.email}
                  onChange={(e) => setFilters(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 w-44 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(f => ({ ...f, status: value || '' }))}
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1 w-44 shrink-0 max-md:w-full max-md:shrink">
              <Label className="text-xs font-semibold text-gray-400 tracking-wide">Min Agents</Label>
              <Input
                className="bg-gray-50"
                type="number"
                min="0"
                placeholder="0"
                value={filters.minAgents}
                onChange={(e) => setFilters(f => ({ ...f, minAgents: e.target.value }))}
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
              <TableHead className="text-xs uppercase tracking-wider">User</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Email</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Role</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Agents</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Joined</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-semibold">{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={u.is_active ? 'default' : 'destructive'}
                    className={u.is_active ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'}
                  >
                    {u.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{u.agent_count}</TableCell>
                <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '\u2014'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {u.role !== 'admin' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-700"
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                          onClick={() => toggleUserActive(u)}
                        >
                          {u.is_active ? <UserX size={20} /> : <UserCheck size={20} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                          onClick={() => deleteUser(u)}
                        >
                          <Trash2 size={20} />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
