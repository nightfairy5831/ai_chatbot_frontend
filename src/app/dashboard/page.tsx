import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Bot, Box, TrendingUp, MessageSquare } from 'lucide-react'
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

  if (loading) return <div className="loading-state"><div className="spinner" />Loading...</div>

  return (
    <div>
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(79, 110, 247, 0.1)', color: '#4f6ef7' }}>
            <Bot size={26} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.total_agents}</span>
            <span className="stat-card-label">Total Agents</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Box size={26} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.total_products}</span>
            <span className="stat-card-label">Total Products</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <TrendingUp size={26} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value stat-card-value-name">{stats.most_used_agent?.name || '—'}</span>
            <span className="stat-card-label">Most Used Agent</span>
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

      <div className="dashboard-actions">
        {!showForm && (
          <button className="btn-primary" onClick={openCreateForm}>
            <Plus size={16} /> Create Agent
          </button>
        )}
      </div>

      {showForm && (
        <form className="agent-form" onSubmit={handleSubmit}>
          <h3>{editingAgent ? 'Edit Agent' : 'Create Agent'}</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="My Agent"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-input"
              placeholder="What does this agent do?"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
          {formError && (
            <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>{formError}</p>
          )}
          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingAgent ? 'Update' : 'Create'}
            </button>
            <button className="btn-secondary" type="button" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {agents.length === 0 ? (
        <div className="empty-state">
          <p>No agents yet. Create your first agent to get started.</p>
        </div>
      ) : (
        <div className="agent-list">
          {agents.map((agent) => (
            <div className="agent-card clickable" key={agent.id} onClick={() => onOpenAgent(agent.id)}>
              <div className="agent-card-header">
                <div className="agent-card-icon">
                  <Bot size={24} />
                </div>
                <div className="agent-card-body">
                  <p className="agent-card-name">{agent.name}</p>
                  {agent.description && (
                    <p className="agent-card-desc">{agent.description}</p>
                  )}
                </div>
                <div className="agent-card-actions">
                  <button className="btn-icon" title="Edit" onClick={(e) => openEditForm(e, agent)}>
                    <Pencil size={15} />
                  </button>
                  <button className="btn-icon danger" title="Delete" onClick={(e) => handleDelete(e, agent)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
