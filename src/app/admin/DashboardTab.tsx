import { useState, useEffect } from 'react'
import { Users, Bot, MessageSquare, UserCheck, Send, TrendingUp, Coins } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Request from '../../lib/request'
import { Loading } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

interface AdminStats {
  total_users: number
  total_agents: number
  total_products: number
  total_questions: number
  active_users: number
}

interface ChartData {
  date: string
  count: number
}

interface AdminAgent {
  id: number
  name: string
  owner_username: string
}

interface TokenByAgent {
  agent_name: string
  username: string
  questions: number
  total_token: number
}

interface TokenDaily {
  date: string
  total_token: number
}

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
    try {
      const data = await Request.Get('/admin/stats')
      setStats(data)
    } catch (err: any) {
      if (err.response?.status === 401) { onLogout(); return }
      if (err.response?.status === 403) { setError('Admin access required'); return }
      setError('Failed to load stats')
    }
  }

  const fetchCharts = async () => {
    try {
      const [qData, rData, aData] = await Promise.all([
        Request.Get('/admin/charts/questions'),
        Request.Get('/admin/charts/registrations'),
        Request.Get('/admin/charts/agents'),
      ])
      setQuestionChart(qData)
      setRegistrationChart(rData)
      setAgentChart(aData)
    } catch {}
  }

  const fetchTokenUsage = async () => {
    try {
      const [agents, daily] = await Promise.all([
        Request.Get('/admin/token-usage/agents'),
        Request.Get('/admin/token-usage/daily'),
      ])
      setTokenByAgent(agents)
      setTokenDaily(daily)
    } catch {}
  }

  const fetchAgents = async () => {
    setAgentsLoading(true)
    try {
      const data = await Request.Get('/admin/agents?search=')
      setAgents(data)
    } catch (err: any) {
      if (err.response?.status === 401) onLogout()
    } finally {
      setAgentsLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchCharts(), fetchTokenUsage()])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (initialTestAgentId) {
      setTestAgentId(initialTestAgentId)
      if (agents.length === 0) fetchAgents()
    }
  }, [initialTestAgentId])

  const handleTestChat = async () => {
    if (!testAgentId || !testMessage.trim()) return
    setTestLoading(true)
    setTestResponse('')
    try {
      const data = await Request.Post(`/admin/agents/${testAgentId}/chat`, { message: testMessage })
      setTestResponse(data.response)
    } catch (err: any) {
      setTestResponse(`Error: ${err.response?.data?.detail || 'Failed to get response'}`)
    } finally {
      setTestLoading(false)
    }
  }

  if (loading) return <Loading />

  if (error && !stats) return (
    <div className="text-center py-12 px-4 text-gray-400 text-sm leading-relaxed">
      <p className="text-red-600">{error}</p>
    </div>
  )

  return (
    <div>
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {stats && (
        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1 gap-4 max-md:gap-3 mb-6">
            <Card className="flex items-center gap-4 p-5 max-md:p-4 transition-[border-color,box-shadow] duration-150 hover:border-gray-300 hover:shadow-sm">
              <div className="w-12 h-12 max-md:w-10 max-md:h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
                <Users size={24} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-2xl font-bold text-gray-900 leading-tight">{stats.total_users}</span>
                <span className="text-sm max-md:text-xs text-gray-500 mt-1 font-medium">Total Users</span>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5 max-md:p-4 transition-[border-color,box-shadow] duration-150 hover:border-gray-300 hover:shadow-sm">
              <div className="w-12 h-12 max-md:w-10 max-md:h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500">
                <UserCheck size={24} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-2xl font-bold text-gray-900 leading-tight">{stats.active_users}</span>
                <span className="text-sm max-md:text-xs text-gray-500 mt-1 font-medium">Active Users</span>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5 max-md:p-4 transition-[border-color,box-shadow] duration-150 hover:border-gray-300 hover:shadow-sm">
              <div className="w-12 h-12 max-md:w-10 max-md:h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-500">
                <Bot size={24} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-2xl font-bold text-gray-900 leading-tight">{stats.total_agents}</span>
                <span className="text-sm max-md:text-xs text-gray-500 mt-1 font-medium">Total Agents</span>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5 max-md:p-4 transition-[border-color,box-shadow] duration-150 hover:border-gray-300 hover:shadow-sm">
              <div className="w-12 h-12 max-md:w-10 max-md:h-10 rounded-xl flex items-center justify-center shrink-0 bg-violet-500/10 text-violet-500">
                <MessageSquare size={24} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-2xl font-bold text-gray-900 leading-tight">{stats.total_questions}</span>
                <span className="text-sm max-md:text-xs text-gray-500 mt-1 font-medium">Total Questions</span>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900 [&>svg]:text-blue-500">
                  <Bot size={18} /> Agents Created (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-2">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={agentChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip labelFormatter={(v) => v} formatter={(v) => [v, 'Agents']} />
                    <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900 [&>svg]:text-blue-500">
                  <Users size={18} /> User Registrations (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-2">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={registrationChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip labelFormatter={(v) => v} formatter={(v) => [v, 'Registrations']} />
                    <Bar dataKey="count" fill="#4f6ef7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Token Usage Table + Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900 [&>svg]:text-blue-500">
                  <Coins size={18} /> Token Usage by Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-2">
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs uppercase tracking-wider">Agent</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider">Owner</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider">Questions</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider">Tokens</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokenByAgent.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-400">No token usage data yet.</TableCell>
                        </TableRow>
                      ) : (
                        tokenByAgent.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell>{row.agent_name}</TableCell>
                            <TableCell>{row.username}</TableCell>
                            <TableCell>{row.questions}</TableCell>
                            <TableCell>{row.total_token.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900 [&>svg]:text-blue-500">
                  <Coins size={18} /> Daily Token Usage (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-2">
                {tokenDaily.every(r => r.total_token === 0) ? (
                  <p className="text-gray-400 text-sm">No token usage data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={tokenDaily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip labelFormatter={(v) => v} formatter={(v) => [Number(v).toLocaleString(), 'Tokens']} />
                      <Bar dataKey="total_token" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Questions Chart + Live Test Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900 [&>svg]:text-blue-500">
                  <MessageSquare size={18} /> Questions (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-2">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={questionChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip labelFormatter={(v) => v} formatter={(v) => [v, 'Questions']} />
                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900 [&>svg]:text-blue-500">
                  <TrendingUp size={18} /> Live Agent Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex gap-3 mb-3">
                      <Select
                        value={testAgentId ? String(testAgentId) : ''}
                        onValueChange={(value) => setTestAgentId(value ? Number(value) : null)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select an agent to test..." />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.length === 0 && (
                            <SelectItem value="__loading" disabled>Loading agents...</SelectItem>
                          )}
                          {agents.map((a) => (
                            <SelectItem key={a.id} value={String(a.id)}>{a.name} ({a.owner_username})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {agents.length === 0 && (
                        <Button
                          variant="default"
                          className="bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => fetchAgents()}
                          type="button"
                          disabled={agentsLoading}
                        >
                          {agentsLoading ? <div className="h-4 w-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" /> : 'Load'}
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-3 shrink-0 max-md:flex-col max-md:gap-2">
                      <Input
                        className="flex-1"
                        placeholder="Type a test message..."
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
                        disabled={!testAgentId}
                      />
                      <Button
                        onClick={handleTestChat}
                        disabled={testLoading || !testAgentId || !testMessage.trim()}
                      >
                        {testLoading ? <div className="h-4 w-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" /> : <Send size={16} />}
                      </Button>
                    </div>
                    {testResponse && (
                      <div className="mt-3 max-h-36 overflow-y-auto bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-green-600 m-0 mb-2 uppercase tracking-wider">AI Response</p>
                        <p className="text-sm text-gray-800 m-0 leading-relaxed whitespace-pre-wrap">{testResponse}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
