import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Bot, Box, TrendingUp, MessageSquare, Activity, ChevronRight } from 'lucide-react'
import Request from '../../lib/request'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

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

  const fetchLogs = async () => {
    try {
      const data = await Request.Get('/agents/logs')
      setLogs(data)
    } catch { /* ignore */ }
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
      if (err.response?.status === 401) { onLogout(); return }
      setError(err.response?.data?.detail || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchLogs()
  }, [])

  const openCreateForm = () => { setEditingAgent(null); setFormName(''); setFormDescription(''); setFormError(null); setShowForm(true) }
  const openEditForm = (e: React.MouseEvent, agent: Agent) => { e.stopPropagation(); setEditingAgent(agent); setFormName(agent.name); setFormDescription(agent.description || ''); setFormError(null); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditingAgent(null); setFormName(''); setFormDescription(''); setFormError(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) { setFormError('Name is required'); return }
    setSaving(true); setFormError(null)
    try {
      if (editingAgent) {
        await Request.Patch(`/agents/${editingAgent.id}`, { name: formName.trim(), description: formDescription.trim() || null })
      } else {
        await Request.Post('/agents/', { name: formName.trim(), description: formDescription.trim() || null })
      }
      closeForm(); await fetchData()
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save agent')
    } finally { setSaving(false) }
  }

  const handleDelete = async (e: React.MouseEvent, agent: Agent) => {
    e.stopPropagation()
    if (!confirm(`Delete "${agent.name}"? This cannot be undone.`)) return
    try { await Request.Delete(`/agents/${agent.id}`); await fetchData() }
    catch (err: any) { setError(err.response?.data?.detail || 'Failed to delete agent') }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-gray-400 text-sm">
        <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        Loading...
      </div>
    )
  }

  return (
    <div>
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard icon={<Bot size={18} />} color="blue" value={stats.total_agents} label="Agents" />
        <StatCard icon={<Box size={18} />} color="emerald" value={stats.total_products} label="Products" />
        <StatCard icon={<MessageSquare size={18} />} color="violet" value={stats.total_questions} label="Questions" />
        <StatCard icon={<TrendingUp size={18} />} color="amber" value={stats.most_used_agent?.name || '—'} label="Top Agent" isText />
      </div>

      {/* Agents Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Agents</h2>
          {!showForm && (
            <Button size="sm" onClick={openCreateForm}>
              <Plus size={14} /> New Agent
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit}>
                <h3 className="m-0 mb-3 text-sm font-semibold text-gray-900">{editingAgent ? 'Edit Agent' : 'New Agent'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">Name</Label>
                    <Input placeholder="My Agent" value={formName} onChange={(e) => setFormName(e.target.value)} autoFocus />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">Description</Label>
                    <Textarea placeholder="What does this agent do?" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="resize-none h-10" />
                  </div>
                </div>
                {formError && <p className="text-red-600 text-xs mb-2">{formError}</p>}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : editingAgent ? 'Update' : 'Create'}</Button>
                  <Button type="button" variant="outline" size="sm" onClick={closeForm}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Agent List */}
        {agents.length === 0 ? (
          <Card className="py-10 text-center text-gray-400 text-sm">
            <p className="m-0">No agents yet. Create your first agent to get started.</p>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-gray-100">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="group flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onOpenAgent(agent.id)}
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Bot size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 m-0 truncate">{agent.name}</p>
                    {agent.description && <p className="text-xs text-gray-400 m-0 truncate">{agent.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-blue-600" title="Edit" onClick={(e) => openEditForm(e, agent)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-red-600" title="Delete" onClick={(e) => handleDelete(e, agent)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity size={16} /> Recent Activity
        </h2>
        {logs.length === 0 ? (
          <Card className="py-8 text-center text-gray-400 text-sm">
            <p className="m-0">No activity yet.</p>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-gray-50">
              {logs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <MessageSquare size={14} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium m-0 truncate">{log.question}</p>
                    <p className="text-xs text-gray-500 m-0 mt-0.5">{log.agent_name}</p>
                  </div>
                  <Badge variant="secondary" className={`shrink-0 rounded-full text-xs px-2.5 py-0.5 ${log.source_channel === 'whatsapp' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                    {log.source_channel}
                  </Badge>
                  <span className="text-xs text-gray-500 shrink-0 text-right whitespace-nowrap">
                    {log.created_at ? new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, color, value, label, isText }: { icon: React.ReactNode; color: string; value: string | number; label: string; isText?: boolean }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    violet: 'bg-violet-500/10 text-violet-500',
    amber: 'bg-amber-500/10 text-amber-500',
  }

  return (
    <Card className="transition-all hover:shadow-sm">
      <CardContent className="flex items-center gap-3 p-3.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`m-0 font-bold text-gray-900 leading-tight ${isText ? 'text-sm truncate' : 'text-xl'}`}>{value}</p>
          <p className="m-0 text-xs text-gray-400">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default Dashboard
