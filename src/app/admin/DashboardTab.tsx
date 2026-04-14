import { useState, useEffect } from 'react'
import { Users, Bot, MessageSquare, UserCheck, Send, TrendingUp, Coins } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Request from '../../lib/request'

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

  if (loading) return (
    <div className="flex items-center justify-center gap-3 h-[calc(100vh-5rem)] text-gray-500 text-sm">
      <div className="w-5 h-5 border-[2.5px] border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      Loading...
    </div>
  )

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
            <div className="bg-white border border-gray-200 rounded-[14px] p-7 max-md:p-4 flex items-center gap-5 max-md:gap-3 transition-[border-color,box-shadow] duration-150 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-[52px] h-[52px] max-md:w-10 max-md:h-10 rounded-xl max-md:rounded-[10px] flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
                <Users size={26} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[1.85rem] max-md:text-[1.4rem] font-bold text-gray-900 leading-tight tracking-tight">{stats.total_users}</span>
                <span className="text-sm max-md:text-xs text-gray-500 mt-1 font-medium">Total Users</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-[14px] p-7 max-md:p-4 flex items-center gap-5 max-md:gap-3 transition-[border-color,box-shadow] duration-150 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-[52px] h-[52px] max-md:w-10 max-md:h-10 rounded-xl max-md:rounded-[10px] flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500">
                <UserCheck size={26} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[1.85rem] max-md:text-[1.4rem] font-bold text-gray-900 leading-tight tracking-tight">{stats.active_users}</span>
                <span className="text-sm max-md:text-xs text-gray-500 mt-1 font-medium">Active Users</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-[14px] p-7 max-md:p-4 flex items-center gap-5 max-md:gap-3 transition-[border-color,box-shadow] duration-150 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-[52px] h-[52px] max-md:w-10 max-md:h-10 rounded-xl max-md:rounded-[10px] flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-500">
                <Bot size={26} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[1.85rem] max-md:text-[1.4rem] font-bold text-gray-900 leading-tight tracking-tight">{stats.total_agents}</span>
                <span className="text-sm max-md:text-xs text-gray-500 mt-1 font-medium">Total Agents</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-[14px] p-7 max-md:p-4 flex items-center gap-5 max-md:gap-3 transition-[border-color,box-shadow] duration-150 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-[52px] h-[52px] max-md:w-10 max-md:h-10 rounded-xl max-md:rounded-[10px] flex items-center justify-center shrink-0 bg-violet-500/10 text-violet-500">
                <MessageSquare size={26} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[1.85rem] max-md:text-[1.4rem] font-bold text-gray-900 leading-tight tracking-tight">{stats.total_questions}</span>
                <span className="text-sm max-md:text-xs text-gray-500 mt-1 font-medium">Total Questions</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            <div className="bg-white border border-gray-200 rounded-[10px] pt-4 px-4 pb-2">
              <h3 className="flex items-center gap-2 m-0 mb-4 text-[1.1rem] max-md:text-[0.95rem] font-bold text-gray-900 [&>svg]:text-blue-500">
                <Bot size={18} /> Agents Created (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={agentChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={(v) => v} formatter={(v) => [v, 'Agents']} />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-gray-200 rounded-[10px] pt-4 px-4 pb-2">
              <h3 className="flex items-center gap-2 m-0 mb-4 text-[1.1rem] max-md:text-[0.95rem] font-bold text-gray-900 [&>svg]:text-blue-500">
                <Users size={18} /> User Registrations (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={registrationChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={(v) => v} formatter={(v) => [v, 'Registrations']} />
                  <Bar dataKey="count" fill="#4f6ef7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Token Usage Table + Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            <div className="bg-white border border-gray-200 rounded-[10px] pt-4 px-4 pb-2">
              <h3 className="flex items-center gap-2 m-0 mb-4 text-[1.1rem] max-md:text-[0.95rem] font-bold text-gray-900 [&>svg]:text-blue-500">
                <Coins size={18} /> Token Usage by Agent
              </h3>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full border-collapse text-[0.95rem] max-[480px]:min-w-[500px] max-[480px]:text-[0.85rem]">
                  <thead>
                    <tr>
                      <th className="text-left py-3.5 px-4 max-[480px]:py-2.5 max-[480px]:px-2 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 text-[0.85rem] uppercase tracking-wider">Agent</th>
                      <th className="text-left py-3.5 px-4 max-[480px]:py-2.5 max-[480px]:px-2 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 text-[0.85rem] uppercase tracking-wider">Owner</th>
                      <th className="text-left py-3.5 px-4 max-[480px]:py-2.5 max-[480px]:px-2 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 text-[0.85rem] uppercase tracking-wider">Questions</th>
                      <th className="text-left py-3.5 px-4 max-[480px]:py-2.5 max-[480px]:px-2 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200 text-[0.85rem] uppercase tracking-wider">Tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokenByAgent.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-slate-400">No token usage data yet.</td>
                      </tr>
                    ) : (
                      tokenByAgent.map((row, i) => (
                        <tr key={i} className="hover:[&>td]:bg-[#fafafa]">
                          <td className="py-3 px-4 max-[480px]:py-2.5 max-[480px]:px-2 border-b border-gray-100 text-gray-700 last:border-b-0">{row.agent_name}</td>
                          <td className="py-3 px-4 max-[480px]:py-2.5 max-[480px]:px-2 border-b border-gray-100 text-gray-700 last:border-b-0">{row.username}</td>
                          <td className="py-3 px-4 max-[480px]:py-2.5 max-[480px]:px-2 border-b border-gray-100 text-gray-700 last:border-b-0">{row.questions}</td>
                          <td className="py-3 px-4 max-[480px]:py-2.5 max-[480px]:px-2 border-b border-gray-100 text-gray-700 last:border-b-0">{row.total_token.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-[10px] pt-4 px-4 pb-2">
              <h3 className="flex items-center gap-2 m-0 mb-4 text-[1.1rem] max-md:text-[0.95rem] font-bold text-gray-900 [&>svg]:text-blue-500">
                <Coins size={18} /> Daily Token Usage (Last 30 Days)
              </h3>
              {tokenDaily.every(r => r.total_token === 0) ? (
                <p className="text-slate-400 text-sm">No token usage data yet.</p>
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
            </div>
          </div>

          {/* Questions Chart + Live Test Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            <div className="bg-white border border-gray-200 rounded-[10px] pt-4 px-4 pb-2">
              <h3 className="flex items-center gap-2 m-0 mb-4 text-[1.1rem] max-md:text-[0.95rem] font-bold text-gray-900 [&>svg]:text-blue-500">
                <MessageSquare size={18} /> Questions (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={questionChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={(v) => v} formatter={(v) => [v, 'Questions']} />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-gray-200 rounded-[10px] pt-4 px-4 pb-2">
              <h3 className="flex items-center gap-2 m-0 mb-4 text-[1.1rem] max-md:text-[0.95rem] font-bold text-gray-900 [&>svg]:text-blue-500">
                <TrendingUp size={18} /> Live Agent Test
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex gap-3 mb-3">
                  <select
                    className="flex-1 w-full py-2.5 px-4 rounded-lg border border-gray-200 text-base text-gray-800 bg-white outline-none transition-colors duration-150 focus:border-blue-500"
                    value={testAgentId ?? ''}
                    onChange={(e) => setTestAgentId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Select an agent to test...</option>
                    {agents.length === 0 && <option disabled>Loading agents...</option>}
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.owner_username})</option>
                    ))}
                  </select>
                  {agents.length === 0 && (
                    <button
                      className="bg-emerald-500 text-white border-none rounded-lg px-4 py-2 cursor-pointer inline-flex items-center gap-1.5 hover:bg-emerald-600 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => fetchAgents()}
                      type="button"
                      disabled={agentsLoading}
                    >
                      {agentsLoading ? <div className="w-4 h-4 border-[2.5px] border-gray-200 border-t-blue-500 rounded-full animate-spin" /> : 'Load'}
                    </button>
                  )}
                </div>
                <div className="flex gap-3 shrink-0 max-md:flex-col max-md:gap-2">
                  <input
                    className="flex-1 w-full py-2.5 px-4 rounded-lg border border-gray-200 text-base text-gray-800 bg-white outline-none transition-colors duration-150 focus:border-blue-500"
                    placeholder="Type a test message..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
                    disabled={!testAgentId}
                  />
                  <button
                    className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-lg border-none bg-blue-500 text-white text-[0.95rem] font-semibold cursor-pointer transition-colors duration-150 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleTestChat}
                    disabled={testLoading || !testAgentId || !testMessage.trim()}
                  >
                    {testLoading ? <div className="w-4 h-4 border-[2.5px] border-gray-200 border-t-blue-500 rounded-full animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
                {testResponse && (
                  <div className="mt-3 max-h-[150px] overflow-y-auto bg-green-50 border border-green-200 rounded-[10px] p-4">
                    <p className="text-xs font-semibold text-green-600 m-0 mb-2 uppercase tracking-wider">AI Response</p>
                    <p className="text-[0.9rem] text-gray-800 m-0 leading-relaxed whitespace-pre-wrap">{testResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
