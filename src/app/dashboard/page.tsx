import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Bot, Box, TrendingUp, MessageSquare, Activity } from 'lucide-react'
import Request from '../../lib/request'

interface Agent {
  id: number
  name: string
  description: string | null
  user_id: number
}

interface Stats {
  total_agents: number
  total_products: number
  total_questions: number
  most_used_agent: { id: number; name: string; question_count: number } | null
  recent_agent: { id: number; name: string } | null
}

interface ActivityLog {
  id: number
  question: string
  agent_name: string
  agent_id: number
  source_channel: string
  created_at: string | null
}

function Dashboard({ onLogout, onOpenAgent }: { onLogout: () => void; onOpenAgent: (id: number) => void }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState<Stats>({ total_agents: 0, total_products: 0, total_questions: 0, most_used_agent: null, recent_agent: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [showLogs, setShowLogs] = useState(false)

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const data = await Request.Get('/agents/logs')
      setLogs(data)
    } catch { /* ignore */ }
    finally { setLogsLoading(false) }
  }

  const fetchData = async () => {
    try {
      const [agentsData, statsData] = await Promise.all([
        Request.Get('/agents/'),
        Request.Get('/agents/stats'),
      ])
      setAgents(agentsData)
      setStats(statsData)
    } catch (err: any) {
      if (err.response?.status === 401) {
        onLogout()
        return
      }
      setError(err.response?.data?.detail || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreateForm = () => {
    setEditingAgent(null)
    setFormName('')
    setFormDescription('')
    setFormError(null)
    setShowForm(true)
  }

  const openEditForm = (e: React.MouseEvent, agent: Agent) => {
    e.stopPropagation()
    setEditingAgent(agent)
    setFormName(agent.name)
    setFormDescription(agent.description || '')
    setFormError(null)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingAgent(null)
    setFormName('')
    setFormDescription('')
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      setFormError('Name is required')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      if (editingAgent) {
        await Request.Patch(`/agents/${editingAgent.id}`, {
          name: formName.trim(),
          description: formDescription.trim() || null,
        })
      } else {
        await Request.Post('/agents/', {
          name: formName.trim(),
          description: formDescription.trim() || null,
        })
      }
      closeForm()
      await fetchData()
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save agent')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, agent: Agent) => {
    e.stopPropagation()
    if (!confirm(`Delete "${agent.name}"? This cannot be undone.`)) return
    try {
      await Request.Delete(`/agents/${agent.id}`)
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete agent')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2.5 py-12 text-gray-400 text-sm">
        <div className="w-5 h-5 border-[2.5px] border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        Loading...
      </div>
    )
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Agents */}
        <div className="bg-white border border-gray-200 rounded-[14px] p-[1.75rem] flex items-center gap-5 transition-all hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
            <Bot size={26} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-3xl font-bold text-gray-900 leading-tight tracking-tight">{stats.total_agents}</span>
            <span className="text-sm text-gray-500 mt-1 font-medium">Total Agents</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-gray-200 rounded-[14px] p-[1.75rem] flex items-center gap-5 transition-all hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500">
            <Box size={26} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-3xl font-bold text-gray-900 leading-tight tracking-tight">{stats.total_products}</span>
            <span className="text-sm text-gray-500 mt-1 font-medium">Total Products</span>
          </div>
        </div>

        {/* Most Used Agent */}
        <div className="bg-white border border-gray-200 rounded-[14px] p-[1.75rem] flex items-center gap-5 transition-all hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-500">
            <TrendingUp size={26} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-semibold text-gray-900 leading-tight tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{stats.most_used_agent?.name || '—'}</span>
            <span className="text-sm text-gray-500 mt-1 font-medium">Most Used Agent</span>
          </div>
        </div>

        {/* Total Questions */}
        <div className="bg-white border border-gray-200 rounded-[14px] p-[1.75rem] flex items-center gap-5 transition-all hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 bg-violet-500/10 text-violet-500">
            <MessageSquare size={26} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-3xl font-bold text-gray-900 leading-tight tracking-tight">{stats.total_questions}</span>
            <span className="text-sm text-gray-500 mt-1 font-medium">Total Questions</span>
          </div>
        </div>
      </div>

      {/* Dashboard Actions */}
      <div className="mb-6">
        {!showForm && (
          <button
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border-none bg-blue-500 text-white text-[0.95rem] font-semibold cursor-pointer transition-colors hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={openCreateForm}
          >
            <Plus size={16} /> Create Agent
          </button>
        )}
      </div>

      {/* Create/Edit Agent Form */}
      {showForm && (
        <form className="bg-white border border-gray-200 rounded-xl p-5 mb-4" onSubmit={handleSubmit}>
          <h3 className="m-0 mb-4 text-xl font-bold text-gray-900 tracking-tight">{editingAgent ? 'Edit Agent' : 'Create Agent'}</h3>
          <div className="mb-3">
            <label className="block text-[0.95rem] font-semibold text-gray-700 mb-1.5 tracking-wide">Name</label>
            <input
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-base text-gray-800 bg-white outline-none transition-colors focus:border-blue-500"
              type="text"
              placeholder="My Agent"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="block text-[0.95rem] font-semibold text-gray-700 mb-1.5 tracking-wide">Description</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-base text-gray-800 bg-white outline-none transition-colors focus:border-blue-500 resize-y min-h-[80px] font-[inherit]"
              placeholder="What does this agent do?"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
          {formError && (
            <p className="text-red-600 text-sm m-0 mb-2">{formError}</p>
          )}
          <div className="flex gap-3 mt-3">
            <button
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border-none bg-blue-500 text-white text-[0.95rem] font-semibold cursor-pointer transition-colors hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingAgent ? 'Update' : 'Create'}
            </button>
            <button
              className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[0.95rem] font-medium cursor-pointer transition-colors hover:bg-gray-100 hover:border-gray-300"
              type="button"
              onClick={closeForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Agent List */}
      {agents.length === 0 ? (
        <div className="text-center py-12 px-4 text-gray-400 text-sm leading-relaxed">
          <p>No agents yet. Create your first agent to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <div
              className="bg-white border border-gray-200 rounded-[14px] px-7 py-6 transition-all cursor-pointer hover:border-blue-300 hover:shadow-[0_1px_4px_rgba(79,110,247,0.08)]"
              key={agent.id}
              onClick={() => onOpenAgent(agent.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/[0.08] text-blue-500 flex items-center justify-center shrink-0">
                  <Bot size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[1.05rem] font-semibold text-gray-900 m-0 tracking-tight">{agent.name}</p>
                  {agent.description && (
                    <p className="text-sm text-gray-500 mt-1 m-0 leading-relaxed">{agent.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 border-none bg-transparent"
                    title="Edit"
                    onClick={(e) => openEditForm(e, agent)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 border-none bg-transparent"
                    title="Delete"
                    onClick={(e) => handleDelete(e, agent)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Logs */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="m-0 flex items-center gap-2 text-base font-bold text-gray-900">
            <Activity size={18} /> Recent Activity
          </h3>
          <button
            className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[0.95rem] font-medium cursor-pointer transition-colors hover:bg-gray-100 hover:border-gray-300"
            onClick={() => { setShowLogs(!showLogs); if (!showLogs && logs.length === 0) fetchLogs() }}
          >
            {showLogs ? 'Hide' : 'Show'}
          </button>
        </div>
        {showLogs && (
          logsLoading ? (
            <div className="flex items-center justify-center gap-2.5 py-12 text-gray-400 text-sm">
              <div className="w-5 h-5 border-[2.5px] border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              Loading...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-400 text-sm leading-relaxed">
              <p>No activity yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
              <table className="w-full border-collapse text-[0.95rem] min-w-[600px]">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">Agent</th>
                    <th className="text-left px-4 py-3.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="text-left px-4 py-3.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                    <th className="text-left px-4 py-3.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 border-b border-gray-100 text-gray-700">{log.agent_name}</td>
                      <td className="px-4 py-3 border-b border-gray-100 text-gray-700 max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">{log.question}</td>
                      <td className="px-4 py-3 border-b border-gray-100 text-gray-700">
                        <span className={`text-xs px-2 py-0.5 rounded ${log.source_channel === 'whatsapp' ? 'bg-green-100 text-green-600' : 'bg-sky-100 text-sky-700'}`}>
                          {log.source_channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Dashboard
