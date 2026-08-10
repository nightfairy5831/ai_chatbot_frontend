import { useState, useEffect, useCallback } from 'react'
import { Trash2, UserCheck, UserX, Search, ShieldCheck, ShieldOff } from 'lucide-react'
import Request from '../../lib/request'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { errorStatus, errorText } from '../../lib/errors'

interface AdminUser {
  id: number; username: string; email: string; role: string; plan: string; message_limit: number
  is_active: boolean; created_at: string | null; agent_count: number
}

const PLANS = ['free', 'starter', 'growth', 'scale']

export default function UsersTab({ onLogout }: { onLogout: () => void }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [meId, setMeId] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    try { const data = await Request.Get('/admin/users?search='); setUsers(data) }
    catch (err) { if (errorStatus(err) === 401) onLogout() }
  }, [onLogout])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the fetchers await before they touch state
    void fetchUsers()
    Request.Get('/auth/me')
      .then((d) => setMeId(d.id))
      .catch(() => { /* the table still renders without knowing who "me" is */ })
  }, [fetchUsers])

  const toggleUserActive = async (user: AdminUser) => {
    try { await Request.Patch(`/admin/users/${user.id}`, { is_active: !user.is_active }); fetchUsers() }
    catch (err) { setError(errorText(err, 'Failed')) }
  }

  const toggleUserRole = async (user: AdminUser) => {
    const role = user.role === 'admin' ? 'client' : 'admin'
    if (!confirm(`Change ${user.username} to ${role}?`)) return
    try { await Request.Patch(`/admin/users/${user.id}`, { role }); fetchUsers() }
    catch (err) { setError(errorText(err, 'Failed')) }
  }

  const changePlan = async (user: AdminUser, plan: string) => {
    if (plan === user.plan) return
    try { await Request.Patch(`/admin/users/${user.id}`, { plan }); fetchUsers() }
    catch (err) { setError(errorText(err, 'Failed')) }
  }

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Delete "${user.username}"?`)) return
    try { await Request.Delete(`/admin/users/${user.id}`); fetchUsers() }
    catch (err) { setError(errorText(err, 'Failed')) }
  }

  const filtered = users.filter((u) => {
    if (search && !u.username.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    if (status === 'active' && !u.is_active) return false
    if (status === 'inactive' && u.is_active) return false
    return true
  })

  return (
    <div>
      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

      {/* Inline Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <Input className="pl-8" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v || 'all')}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">User</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Plan</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Agents</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Joined</TableHead>
                <TableHead className="text-xs uppercase tracking-wider w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <p className="text-sm font-medium text-gray-900 m-0">{u.username}</p>
                    <p className="text-xs text-gray-400 m-0">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={u.role === 'admin' ? 'bg-brand-light text-brand-dark border border-brand-lighter' : 'bg-gray-50 text-gray-500 border border-gray-100'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.id === meId ? (
                      <span className="text-sm text-gray-400">{u.plan}</span>
                    ) : (
                      <Select value={u.plan} onValueChange={(v) => v && changePlan(u, v)}>
                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PLANS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={u.is_active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{u.agent_count}</TableCell>
                  <TableCell className="text-xs text-gray-400 text-right">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-0.5 justify-end">
                      {u.id !== meId && (
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-brand-dark" title={u.role === 'admin' ? 'Make client' : 'Make admin'} onClick={() => toggleUserRole(u)}>
                          {u.role === 'admin' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        </Button>
                      )}
                      {u.role !== 'admin' && (
                        <>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-brand-dark" title={u.is_active ? 'Deactivate' : 'Activate'} onClick={() => toggleUserActive(u)}>
                            {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-red-600" title="Delete" onClick={() => deleteUser(u)}>
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-400 py-8 text-sm">No users found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
