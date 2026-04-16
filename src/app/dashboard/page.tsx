import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Bot, Box, TrendingUp, MessageSquare, Activity } from 'lucide-react'
import Request from '../../lib/request'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

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
        <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        Loading...
      </div>
    )
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-xl font-bold text-gray-900">Dashboard</h2>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Agents */}
        <Card className="transition-all hover:border-gray-300 hover:shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
              <Bot size={26} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xl font-bold text-gray-900 leading-tight">{stats.total_agents}</span>
              <span className="text-sm text-gray-500 mt-1 font-medium">Total Agents</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="transition-all hover:border-gray-300 hover:shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500">
              <Box size={26} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xl font-bold text-gray-900 leading-tight">{stats.total_products}</span>
              <span className="text-sm text-gray-500 mt-1 font-medium">Total Products</span>
            </div>
          </CardContent>
        </Card>

        {/* Most Used Agent */}
        <Card className="transition-all hover:border-gray-300 hover:shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-500">
              <TrendingUp size={26} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-semibold text-gray-900 leading-tight tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{stats.most_used_agent?.name || '—'}</span>
              <span className="text-sm text-gray-500 mt-1 font-medium">Most Used Agent</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Questions */}
        <Card className="transition-all hover:border-gray-300 hover:shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-violet-500/10 text-violet-500">
              <MessageSquare size={26} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xl font-bold text-gray-900 leading-tight">{stats.total_questions}</span>
              <span className="text-sm text-gray-500 mt-1 font-medium">Total Questions</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Actions */}
      <div className="mb-6">
        {!showForm && (
          <Button onClick={openCreateForm}>
            <Plus size={16} /> Create Agent
          </Button>
        )}
      </div>

      {/* Create/Edit Agent Form */}
      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit}>
              <h3 className="m-0 mb-4 text-base font-semibold text-gray-900">{editingAgent ? 'Edit Agent' : 'Create Agent'}</h3>
              <div className="mb-3">
                <Label className="block text-sm font-medium text-gray-700 mb-1.5">Name</Label>
                <Input
                  type="text"
                  placeholder="My Agent"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <Label className="block text-sm font-medium text-gray-700 mb-1.5">Description</Label>
                <Textarea
                  placeholder="What does this agent do?"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="resize-y min-h-20"
                />
              </div>
              {formError && (
                <p className="text-red-600 text-sm m-0 mb-2">{formError}</p>
              )}
              <div className="flex gap-3 mt-3">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingAgent ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Agent List */}
      {agents.length === 0 ? (
        <div className="text-center py-12 px-4 text-gray-400 text-sm leading-relaxed">
          <p>No agents yet. Create your first agent to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <Card
              className="px-5 py-4 transition-all cursor-pointer hover:border-blue-300 hover:shadow-sm"
              key={agent.id}
              onClick={() => onOpenAgent(agent.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Bot size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 m-0 tracking-tight">{agent.name}</p>
                  {agent.description && (
                    <p className="text-sm text-gray-500 mt-1 m-0 leading-relaxed">{agent.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-gray-400 hover:text-gray-700"
                    title="Edit"
                    onClick={(e) => openEditForm(e, agent)}
                  >
                    <Pencil size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                    onClick={(e) => handleDelete(e, agent)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Activity Logs */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="m-0 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Activity size={18} /> Recent Activity
          </h3>
          <Button
            variant="outline"
            onClick={() => { setShowLogs(!showLogs); if (!showLogs && logs.length === 0) fetchLogs() }}
          >
            {showLogs ? 'Hide' : 'Show'}
          </Button>
        </div>
        {showLogs && (
          logsLoading ? (
            <div className="flex items-center justify-center gap-2.5 py-12 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              Loading...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-400 text-sm leading-relaxed">
              <p>No activity yet.</p>
            </div>
          ) : (
            <Card className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs uppercase tracking-wider">Agent</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider">Question</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider">Channel</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-gray-700">{log.agent_name}</TableCell>
                      <TableCell className="text-gray-700 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{log.question}</TableCell>
                      <TableCell>
                        <Badge variant={log.source_channel === 'whatsapp' ? 'default' : 'secondary'} className={log.source_channel === 'whatsapp' ? 'bg-green-100 text-green-600 hover:bg-green-100' : 'bg-sky-100 text-sky-700 hover:bg-sky-100'}>
                          {log.source_channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )
        )}
      </div>
    </div>
  )
}

export default Dashboard
