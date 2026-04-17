import { useState, useEffect } from 'react'
import { Users, Bot, MessageSquare, UserCheck, Send, TrendingUp, Coins } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Request from '../../lib/request'
import { Loading } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

interface AdminStats { total_users: number; total_agents: number; total_products: number; total_questions: number; active_users: number }
interface ChartData { date: string; count: number }
interface AdminAgent { id: number; name: string; owner_username: string }
interface TokenByAgent { agent_name: string; username: string; questions: number; total_token: number }
interface TokenDaily { date: string; total_token: number }

export default function DashboardTab({ onLogout, testAgentId: initialTestAgentId }: { onLogout: () => void; testAgentId?: number | null }) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [agents, setAgents] = useState<AdminAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questionChart, setQuestionChart] = useState<ChartData[]>([])
  const [registrationChart, setRegistrationChart] = useState<ChartData[]>([])
  const [agentChart, setAgentChart] = useState<ChartData[]>([])
  const [tokenByAgent, setTokenByAgent] = useState<TokenByAgent[]>([])
  const [tokenDaily, setTokenDaily] = useState<TokenDaily[]>([])
  const [agentsLoading, setAgentsLoading] = useState(false)
  const [testAgentId, setTestAgentId] = useState<number | null>(null)
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [testLoading, setTestLoading] = useState(false)

  const fetchStats = async () => {
    try { const data = await Request.Get('/admin/stats'); setStats(data) }
    catch (err: any) {
      if (err.response?.status === 401) { onLogout(); return }
      if (err.response?.status === 403) { setError('Admin access required'); return }
      setError('Failed to load stats')
    }
  }
  const fetchCharts = async () => {
    try {
      const [qData, rData, aData] = await Promise.all([Request.Get('/admin/charts/questions'), Request.Get('/admin/charts/registrations'), Request.Get('/admin/charts/agents')])
      setQuestionChart(qData); setRegistrationChart(rData); setAgentChart(aData)
    } catch {}
  }
  const fetchTokenUsage = async () => {
    try {
      const [a, d] = await Promise.all([Request.Get('/admin/token-usage/agents'), Request.Get('/admin/token-usage/daily')])
      setTokenByAgent(a); setTokenDaily(d)
    } catch {}
  }
  const fetchAgents = async () => {
    setAgentsLoading(true)
    try { const data = await Request.Get('/admin/agents?search='); setAgents(data) }
    catch (err: any) { if (err.response?.status === 401) onLogout() }
    finally { setAgentsLoading(false) }
  }

  useEffect(() => {
    const load = async () => { setLoading(true); await Promise.all([fetchStats(), fetchCharts(), fetchTokenUsage()]); setLoading(false) }
    load()
  }, [])

  useEffect(() => {
    if (initialTestAgentId) { setTestAgentId(initialTestAgentId); if (agents.length === 0) fetchAgents() }
  }, [initialTestAgentId])

  const handleTestChat = async () => {
    if (!testAgentId || !testMessage.trim()) return
    setTestLoading(true); setTestResponse('')
    try { const data = await Request.Post(`/admin/agents/${testAgentId}/chat`, { message: testMessage }); setTestResponse(data.response) }
    catch (err: any) { setTestResponse(`Error: ${err.response?.data?.detail || 'Failed'}`) }
    finally { setTestLoading(false) }
  }

  if (loading) return <Loading />
  if (error && !stats) return <div className="text-center py-12 text-gray-400 text-sm"><p className="text-red-600">{error}</p></div>

  return (
    <div>
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {stats && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard icon={<Users size={18} />} color="blue" value={stats.total_users} label="Total Users" />
            <StatCard icon={<UserCheck size={18} />} color="emerald" value={stats.active_users} label="Active Users" />
            <StatCard icon={<Bot size={18} />} color="amber" value={stats.total_agents} label="Total Agents" />
            <StatCard icon={<MessageSquare size={18} />} color="violet" value={stats.total_questions} label="Total Questions" />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ChartCard title="Agents Created" icon={<Bot size={16} />}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={agentChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} labelFormatter={(v) => v} formatter={(v) => [v, 'Agents']} />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ r: 1.5 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="User Registrations" icon={<Users size={16} />}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={registrationChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} labelFormatter={(v) => v} formatter={(v) => [v, 'Users']} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ChartCard title="Token Usage by Agent" icon={<Coins size={16} />}>
              <div className="overflow-x-auto max-h-56 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs uppercase tracking-wider">Agent</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Owner</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Qs</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-right">Tokens</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokenByAgent.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-gray-400 text-xs">No data yet</TableCell></TableRow>
                    ) : (
                      tokenByAgent.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm font-medium text-gray-800">{row.agent_name}</TableCell>
                          <TableCell className="text-sm text-gray-500">{row.username}</TableCell>
                          <TableCell className="text-sm text-gray-500">{row.questions}</TableCell>
                          <TableCell className="text-sm text-gray-500 text-right">{row.total_token.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </ChartCard>
            <ChartCard title="Daily Token Usage" icon={<Coins size={16} />}>
              {tokenDaily.every(r => r.total_token === 0) ? (
                <p className="text-gray-400 text-xs text-center py-8">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={tokenDaily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} labelFormatter={(v) => v} formatter={(v) => [Number(v).toLocaleString(), 'Tokens']} />
                    <Bar dataKey="total_token" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Questions (30 Days)" icon={<MessageSquare size={16} />}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={questionChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} labelFormatter={(v) => v} formatter={(v) => [v, 'Questions']} />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 1.5 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Live Test */}
            <Card>
              <CardContent className="p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 m-0 mb-3">
                  <TrendingUp size={16} className="text-blue-500" /> Live Agent Test
                </h3>
                <div className="flex gap-2 mb-2">
                  <Select value={testAgentId ? String(testAgentId) : ''} onValueChange={(v) => setTestAgentId(v ? Number(v) : null)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select agent..." /></SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {agents.length === 0 && (
                    <Button size="sm" variant="outline" onClick={() => fetchAgents()} disabled={agentsLoading}>
                      {agentsLoading ? '...' : 'Load'}
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Type a test message..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
                    disabled={!testAgentId}
                  />
                  <Button size="sm" onClick={handleTestChat} disabled={testLoading || !testAgentId || !testMessage.trim()}>
                    {testLoading ? '...' : <Send size={14} />}
                  </Button>
                </div>
                {testResponse && (
                  <div className="mt-3 max-h-32 overflow-y-auto bg-green-50 border border-green-100 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-600 m-0 mb-1">AI Response</p>
                    <p className="text-sm text-gray-800 m-0 leading-relaxed whitespace-pre-wrap">{testResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, color, value, label }: { icon: React.ReactNode; color: string; value: number; label: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
    violet: 'bg-violet-500/10 text-violet-500',
  }
  return (
    <Card className="transition-all hover:shadow-sm">
      <CardContent className="flex items-center gap-3 p-3.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}>{icon}</div>
        <div className="min-w-0">
          <p className="m-0 text-xl font-bold text-gray-900 leading-tight">{value}</p>
          <p className="m-0 text-xs text-gray-400">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 m-0 mb-3 [&>svg]:text-blue-500">
          {icon} {title}
        </h3>
        {children}
      </CardContent>
    </Card>
  )
}
