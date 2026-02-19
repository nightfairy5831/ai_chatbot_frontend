import { useState, useEffect } from 'react'
import Request from '../../lib/request'

interface Agent {
  id: number
  name: string
  description: string | null
  user_id: number
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchAgents = async () => {
    try {
      const data = await Request.Get('/agents/')
      setAgents(data)
    } catch (err: any) {
      if (err.response?.status === 401) {
        onLogout()
        return
      }
      setError(err.response?.data?.detail || 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  const openCreateForm = () => {
    setEditingAgent(null)
    setFormName('')
    setFormDescription('')
    setFormError(null)
    setShowForm(true)
  }

  const openEditForm = (agent: Agent) => {
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
      await fetchAgents()
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save agent')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (agent: Agent) => {
    if (!confirm(`Delete "${agent.name}"? This cannot be undone.`)) return
    try {
      await Request.Delete(`/agents/${agent.id}`)
      await fetchAgents()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete agent')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <div className="dashboard-header">
        <h2>Your Agents</h2>
        {!showForm && (
          <button className="btn-primary" onClick={openCreateForm}>
            + Create Agent
          </button>
        )}
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}

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
            <div className="agent-card" key={agent.id}>
              <div className="agent-card-header">
                <div>
                  <p className="agent-card-name">{agent.name}</p>
                  {agent.description && (
                    <p className="agent-card-desc">{agent.description}</p>
                  )}
                </div>
                <div className="agent-card-actions">
                  <button className="btn-icon" onClick={() => openEditForm(agent)}>
                    Edit
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(agent)}>
                    Delete
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
