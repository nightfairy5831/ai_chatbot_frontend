import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Pencil, Trash2, Package, Sparkles, Send, MessageSquare, Upload, X } from 'lucide-react'
import Request from '../../lib/request'

interface Product {
  id: number
  name: string
  description: string | null
  price: string | null
  agent_id: number
}

interface Agent {
  id: number
  name: string
  description: string | null
  business_name: string | null
  industry: string | null
  tone: string | null
  instructions: string | null
  sinstruction: string | null
  prompt_template: string | null
  products: Product[]
}

const INDUSTRIES = ['retail', 'healthcare', 'finance', 'education', 'technology', 'food', 'travel', 'real-estate', 'other']
const TONES = ['professional', 'friendly', 'casual', 'formal']

function AgentDetail({ agentId, onBack, onLogout }: { agentId: number; onBack: () => void; onLogout: () => void }) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'config' | 'products' | 'prompt'>('config')

  // Config form
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [tone, setTone] = useState('professional')
  const [instructions, setInstructions] = useState('')
  const [configSaving, setConfigSaving] = useState(false)
  const [configMsg, setConfigMsg] = useState<string | null>(null)
  const [sinstruction, setSinstruction] = useState<string | null>(null)
  const [pdfUploading, setPdfUploading] = useState(false)
  const [pdfMsg, setPdfMsg] = useState<string | null>(null)

  // Products
  const [products, setProducts] = useState<Product[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [pName, setPName] = useState('')
  const [pDesc, setPDesc] = useState('')
  const [pPrice, setPPrice] = useState('')
  const [pSaving, setPSaving] = useState(false)
  const [pError, setPError] = useState<string | null>(null)

  // Prompt preview
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [promptLoading, setPromptLoading] = useState(false)

  // Chat test
  const [chatMessage, setChatMessage] = useState('')
  const [chatResponse, setChatResponse] = useState<string | null>(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  const fetchAgent = async () => {
    try {
      const data = await Request.Get(`/agents/${agentId}`)
      setAgent(data)
      setBusinessName(data.business_name || '')
      setIndustry(data.industry || '')
      setTone(data.tone || 'professional')
      setInstructions(data.instructions || '')
      setSinstruction(data.sinstruction || null)
      if (data.prompt_template) setGeneratedPrompt(data.prompt_template)
    } catch (err: any) {
      if (err.response?.status === 401) { onLogout(); return }
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const data = await Request.Get(`/agents/${agentId}/products/`)
      setProducts(data)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchAgent()
    fetchProducts()
  }, [agentId])

  // Config handlers
  const saveConfig = async () => {
    setConfigSaving(true)
    setConfigMsg(null)
    try {
      await Request.Patch(`/agents/${agentId}`, {
        business_name: businessName.trim() || null,
        industry: industry || null,
        tone: tone || null,
        instructions: instructions.trim() || null,
      })
      setConfigMsg('Configuration saved!')
      setTimeout(() => setConfigMsg(null), 3000)
    } catch {
      setConfigMsg('Failed to save')
    } finally {
      setConfigSaving(false)
    }
  }

  // PDF upload handlers
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setPdfMsg('Only PDF files are accepted')
      setTimeout(() => setPdfMsg(null), 3000)
      return
    }
    setPdfUploading(true)
    setPdfMsg(null)
    try {
      const data = await Request.Upload(`/agents/${agentId}/upload-sinstruction`, file)
      setSinstruction(data.sinstruction)
      setPdfMsg('PDF uploaded successfully!')
      setTimeout(() => setPdfMsg(null), 3000)
    } catch (err: any) {
      setPdfMsg(err.response?.data?.detail || 'Failed to upload PDF')
      setTimeout(() => setPdfMsg(null), 3000)
    } finally {
      setPdfUploading(false)
      e.target.value = ''
    }
  }

  const removeSinstruction = async () => {
    try {
      await Request.Delete(`/agents/${agentId}/sinstruction`)
      setSinstruction(null)
      setPdfMsg('Special instruction removed')
      setTimeout(() => setPdfMsg(null), 3000)
    } catch {
      setPdfMsg('Failed to remove')
      setTimeout(() => setPdfMsg(null), 3000)
    }
  }

  // Product handlers
  const openProductCreate = () => {
    setEditingProduct(null)
    setPName('')
    setPDesc('')
    setPPrice('')
    setPError(null)
    setShowProductForm(true)
  }

  const openProductEdit = (p: Product) => {
    setEditingProduct(p)
    setPName(p.name)
    setPDesc(p.description || '')
    setPPrice(p.price || '')
    setPError(null)
    setShowProductForm(true)
  }

  const closeProductForm = () => {
    setShowProductForm(false)
    setEditingProduct(null)
    setPName('')
    setPDesc('')
    setPPrice('')
    setPError(null)
  }

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pName.trim()) { setPError('Name is required'); return }
    setPSaving(true)
    setPError(null)
    try {
      const payload = { name: pName.trim(), description: pDesc.trim() || null, price: pPrice.trim() || null }
      if (editingProduct) {
        await Request.Patch(`/agents/${agentId}/products/${editingProduct.id}`, payload)
      } else {
        await Request.Post(`/agents/${agentId}/products/`, payload)
      }
      closeProductForm()
      await fetchProducts()
    } catch {
      setPError('Failed to save product')
    } finally {
      setPSaving(false)
    }
  }

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return
    try {
      await Request.Delete(`/agents/${agentId}/products/${p.id}`)
      await fetchProducts()
    } catch { /* ignore */ }
  }

  // Prompt handlers
  const generatePrompt = async () => {
    setPromptLoading(true)
    try {
      const data = await Request.Get(`/agents/${agentId}/generate-prompt`)
      setGeneratedPrompt(data.prompt)
    } catch {
      setGeneratedPrompt('Failed to generate prompt.')
    } finally {
      setPromptLoading(false)
    }
  }

  const sendChat = async () => {
    if (!chatMessage.trim()) return
    setChatLoading(true)
    setChatError(null)
    setChatResponse(null)
    try {
      const data = await Request.Post(`/agents/${agentId}/chat`, { message: chatMessage.trim() })
      setChatResponse(data.response)
    } catch (err: any) {
      setChatError(err.response?.data?.detail || 'Failed to get AI response')
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) return <div className="loading-state"><div className="spinner" />Loading...</div>
  if (!agent) return <p>Agent not found.</p>

  return (
    <div>
      <button className="btn-back" onClick={onBack}><ArrowLeft size={16} /> Back</button>
      <div className="detail-header">
        <h2>{agent.name}</h2>
      </div>
      {agent.description && <p className="detail-desc">{agent.description}</p>}

      <div className="tabs">
        <button className={`tab${activeTab === 'config' ? ' active' : ''}`} onClick={() => setActiveTab('config')}>Configuration</button>
        <button className={`tab${activeTab === 'products' ? ' active' : ''}`} onClick={() => setActiveTab('products')}>Products</button>
        <button className={`tab${activeTab === 'prompt' ? ' active' : ''}`} onClick={() => setActiveTab('prompt')}>Prompt & Test</button>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="tab-content">
          <div className="form-group">
            <label>Business Name</label>
            <input className="form-input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Acme Corp" />
          </div>
          <div className="form-group">
            <label>Industry</label>
            <select className="form-input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option value="">Select industry...</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Tone</label>
            <select className="form-input" value={tone} onChange={(e) => setTone(e.target.value)}>
              {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Custom Instructions</label>
            <textarea className="form-input" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Special instructions for the AI agent..." rows={4} />
          </div>
          <div className="form-group">
            <label>Special Instruction (PDF Upload)</label>
            {sinstruction ? (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem', background: '#f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 500 }}>PDF content loaded ({sinstruction.length} characters)</span>
                  <button
                    className="btn-icon danger"
                    title="Remove"
                    onClick={removeSinstruction}
                    style={{ padding: '0.25rem' }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <pre style={{ fontSize: '0.8rem', color: '#4b5563', maxHeight: '150px', overflow: 'auto', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {sinstruction.substring(0, 500)}{sinstruction.length > 500 ? '...' : ''}
                </pre>
              </div>
            ) : (
              <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', background: '#f9fafb' }}>
                <Upload size={24} style={{ color: '#9ca3af', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 0.75rem' }}>
                  Upload a PDF file to add special instructions for this agent
                </p>
                <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Upload size={16} />
                  {pdfUploading ? 'Uploading...' : 'Choose PDF'}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    disabled={pdfUploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
            {pdfMsg && (
              <span style={{ color: pdfMsg.includes('Failed') || pdfMsg.includes('Only') ? '#dc2626' : '#16a34a', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                {pdfMsg}
              </span>
            )}
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={saveConfig} disabled={configSaving}>
              {configSaving ? 'Saving...' : 'Save Configuration'}
            </button>
            {configMsg && <span style={{ color: configMsg.includes('Failed') ? '#dc2626' : '#16a34a', fontSize: '0.85rem', alignSelf: 'center' }}>{configMsg}</span>}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="tab-content">
          <div className="dashboard-actions">
            {!showProductForm && (
              <button className="btn-primary" onClick={openProductCreate}><Plus size={16} /> Add Product</button>
            )}
          </div>

          {showProductForm && (
            <form className="agent-form" onSubmit={saveProduct}>
              <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <div className="form-group">
                <label>Name</label>
                <input className="form-input" value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Product name" autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Product description" />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input className="form-input" type="number" step="0.01" min="0" value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="29.99" />
              </div>
              {pError && <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>{pError}</p>}
              <div className="form-actions">
                <button className="btn-primary" type="submit" disabled={pSaving}>{pSaving ? 'Saving...' : editingProduct ? 'Update' : 'Add'}</button>
                <button className="btn-secondary" type="button" onClick={closeProductForm}>Cancel</button>
              </div>
            </form>
          )}

          {products.length === 0 ? (
            <div className="empty-state"><p>No products yet. Add your first product or service.</p></div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <div className="product-card" key={p.id}>
                  <div className="product-card-col">
                    <div className="product-card-icon">
                      <Package size={36} />
                    </div>
                    {p.price && <span className="product-card-price">${p.price}</span>}
                  </div>
                  <div className="product-card-col product-card-info">
                    <p className="product-card-name">{p.name}</p>
                    {p.description && <p className="product-card-desc">{p.description}</p>}
                  </div>
                  <div className="product-card-col product-card-actions">
                    <button className="btn-icon" title="Edit" onClick={() => openProductEdit(p)}><Pencil size={17} /></button>
                    <button className="btn-icon danger" title="Delete" onClick={() => deleteProduct(p)}><Trash2 size={17} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prompt & Test Tab */}
      {activeTab === 'prompt' && (
        <div className="tab-content prompt-test-layout">
          <div className="prompt-section">
            <div className="prompt-section-header">
              <h3><Sparkles size={18} /> Generated Prompt</h3>
              <button className="btn-primary" onClick={generatePrompt} disabled={promptLoading}>
                {promptLoading ? 'Generating...' : <><Sparkles size={16} /> Generate Prompt</>}
              </button>
            </div>
            <div className="prompt-preview-scroll">
              {generatedPrompt ? (
                <pre className="prompt-preview">{generatedPrompt}</pre>
              ) : (
                <div className="empty-state"><p>Click "Generate Prompt" to preview your agent's prompt.</p></div>
              )}
            </div>
          </div>

          <div className="chat-section">
            <h3><MessageSquare size={18} /> Test Chat</h3>
            <div className="chat-input-row">
              <input
                className="form-input"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message to test the agent..."
                onKeyDown={(e) => e.key === 'Enter' && !chatLoading && sendChat()}
              />
              <button className="btn-primary" onClick={sendChat} disabled={chatLoading || !chatMessage.trim()}>
                {chatLoading ? 'Sending...' : <><Send size={16} /> Send</>}
              </button>
            </div>
            <div className="chat-response-scroll">
              {chatError && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem' }}>{chatError}</p>}
              {chatResponse && (
                <div className="chat-response">
                  <p className="chat-response-label">AI Response:</p>
                  <p className="chat-response-text">{chatResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentDetail
