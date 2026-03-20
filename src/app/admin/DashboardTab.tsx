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

  if (loading) return <div className="loading-state"><div className="spinner" />Loading...</div>
  if (error && !stats) return <div className="empty-state"><p style={{ color: '#dc2626' }}>{error}</p></div>

  return (
    <div>
      {error && <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

      {stats && (
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(79, 110, 247, 0.1)', color: '#4f6ef7' }}>
                <Users size={26} />
              </div>
              <div className="stat-card-info">
                <span className="stat-card-value">{stats.total_users}</span>
                <span className="stat-card-label">Total Users</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <UserCheck size={26} />
              </div>
              <div className="stat-card-info">
                <span className="stat-card-value">{stats.active_users}</span>
                <span className="stat-card-label">Active Users</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <Bot size={26} />
              </div>
              <div className="stat-card-info">
                <span className="stat-card-value">{stats.total_agents}</span>
                <span className="stat-card-label">Total Agents</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <MessageSquare size={26} />
              </div>
              <div className="stat-card-info">
                <span className="stat-card-value">{stats.total_questions}</span>
                <span className="stat-card-label">Total Questions</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="admin-charts-grid">
            <div className="admin-chart-card">
              <h3 className="admin-section-title"><Bot size={18} /> Agents Created (Last 30 Days)</h3>
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
            <div className="admin-chart-card">
              <h3 className="admin-section-title"><Users size={18} /> User Registrations (Last 30 Days)</h3>
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
          <div className="admin-charts-grid">
            <div className="admin-chart-card">
              <h3 className="admin-section-title"><Coins size={18} /> Token Usage by Agent</h3>
              <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Owner</th>
                      <th>Questions</th>
                      <th>Tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokenByAgent.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>No token usage data yet.</td>
                      </tr>
                    ) : (
                      tokenByAgent.map((row, i) => (
                        <tr key={i}>
                          <td>{row.agent_name}</td>
                          <td>{row.username}</td>
                          <td>{row.questions}</td>
                          <td>{row.total_token.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="admin-chart-card">
              <h3 className="admin-section-title"><Coins size={18} /> Daily Token Usage (Last 30 Days)</h3>
              {tokenDaily.every(r => r.total_token === 0) ? (
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No token usage data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={tokenDaily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip labelFormatter={(v) => v} formatter={(v: number) => [v.toLocaleString(), 'Tokens']} />
                    <Bar dataKey="total_token" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Questions Chart + Live Test Panel */}
          <div className="admin-charts-grid">
            <div className="admin-chart-card">
              <h3 className="admin-section-title"><MessageSquare size={18} /> Questions (Last 30 Days)</h3>
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
            <div className="admin-chart-card">
              <h3 className="admin-section-title"><TrendingUp size={18} /> Live Agent Test</h3>
              <div className="admin-test-panel">
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <select
                    className="form-input"
                    style={{ flex: 1 }}
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
                      style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => fetchAgents()}
                      type="button"
                      disabled={agentsLoading}
                    >
                      {agentsLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : 'Load'}
                    </button>
                  )}
                </div>
                <div className="chat-input-row">
                  <input
                    className="form-input"
                    placeholder="Type a test message..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
                    disabled={!testAgentId}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleTestChat}
                    disabled={testLoading || !testAgentId || !testMessage.trim()}
                  >
                    {testLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Send size={16} />}
                  </button>
                </div>
                {testResponse && (
                  <div className="chat-response" style={{ marginTop: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                    <p className="chat-response-label">AI Response</p>
                    <p className="chat-response-text">{testResponse}</p>
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
