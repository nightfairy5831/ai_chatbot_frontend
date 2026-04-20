'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Pencil, Trash2, Package, Sparkles, Send, MessageSquare, Upload, X, Calendar, Link2, Phone } from 'lucide-react'
import Request from '../../lib/request'

import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Product {
  id: number
  name: string
  description: string | null
  price: string | null
  type: string
  purchase_link: string | null
  agent_id: number
}

interface Booking {
  event_id: string
  summary: string
  start: string
  end: string
  status: string
}

interface TimeSlot {
  start: string
  end: string
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
  const [activeTab, setActiveTab] = useState<string>('config')

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
  const [pType, setPType] = useState('product')
  const [pLink, setPLink] = useState('')
  const [pSaving, setPSaving] = useState(false)
  const [pError, setPError] = useState<string | null>(null)

  // Prompt preview
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [promptLoading, setPromptLoading] = useState(false)

  // Chat test
  const [chatMessage, setChatMessage] = useState('')
  // chatResponse replaced by chatHistory
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])

  // WhatsApp
  const [waNumbers, setWaNumbers] = useState<{ id: number; phone_number: string; is_active: boolean }[]>([])
  const [waAvailable, setWaAvailable] = useState<{ phone_number: string; friendly_name: string }[]>([])
  const [waLoading, setWaLoading] = useState(false)
  const [waCountry, setWaCountry] = useState('US')

  const fetchWaNumbers = async () => {
    try {
      const data = await Request.Get(`/whatsapp/agents/${agentId}/numbers`)
      setWaNumbers(data)
    } catch { /* ignore */ }
  }

  const fetchAvailableNumbers = async () => {
    setWaLoading(true)
    try {
      const data = await Request.Get(`/whatsapp/available-numbers?country=${waCountry}`)
      setWaAvailable(data)
    } catch { /* ignore */ }
    finally { setWaLoading(false) }
  }

  const connectWaNumber = async (phoneNumber: string) => {
    try {
      await Request.Post(`/whatsapp/agents/${agentId}/connect`, { phone_number: phoneNumber, agent_id: agentId })
      await fetchWaNumbers()
      setWaAvailable([])
    } catch { /* ignore */ }
  }

  const disconnectWaNumber = async (numberId: number) => {
    if (!confirm('Disconnect this WhatsApp number?')) return
    try {
      await Request.Delete(`/whatsapp/numbers/${numberId}`)
      await fetchWaNumbers()
    } catch { /* ignore */ }
  }

  // Calendar
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())

  const fetchCalendarConnection = async () => {
    try {
      const data = await Request.Get(`/calendar/agents/${agentId}/connection`)
      setCalendarConnected(!!data)
    } catch {
      setCalendarConnected(false)
    }
  }

  const connectCalendar = async () => {
    try {
      const data = await Request.Get(`/calendar/connect/${agentId}`)
      window.open(data.auth_url, '_blank')
    } catch { /* ignore */ }
  }

  const disconnectCalendar = async () => {
    if (!confirm('Disconnect Google Calendar?')) return
    try {
      await Request.Delete(`/calendar/agents/${agentId}/disconnect`)
      setCalendarConnected(false)
      setBookings([])
    } catch { /* ignore */ }
  }

  const fetchBookings = async () => {
    setCalendarLoading(true)
    try {
      const data = await Request.Get(`/calendar/agents/${agentId}/bookings`)
      setBookings(data)
    } catch { /* ignore */ }
    finally { setCalendarLoading(false) }
  }

  const checkAvailability = async (dateOverride?: string) => {
    const date = dateOverride || selectedDate
    if (!date) return
    try {
      const data = await Request.Post(`/calendar/agents/${agentId}/availability`, { date })
      setAvailableSlots(data)
    } catch { /* ignore */ }
  }

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
    fetchCalendarConnection()
    fetchWaNumbers()
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
    setPType('product')
    setPLink('')
    setPError(null)
    setShowProductForm(true)
  }

  const openProductEdit = (p: Product) => {
    setEditingProduct(p)
    setPName(p.name)
    setPDesc(p.description || '')
    setPPrice(p.price || '')
    setPType(p.type || 'product')
    setPLink(p.purchase_link || '')
    setPError(null)
    setShowProductForm(true)
  }

  const closeProductForm = () => {
    setShowProductForm(false)
    setEditingProduct(null)
    setPName('')
    setPDesc('')
    setPPrice('')
    setPType('product')
    setPLink('')
    setPError(null)
  }

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pName.trim()) { setPError('Name is required'); return }
    setPSaving(true)
    setPError(null)
    try {
      const payload = { name: pName.trim(), description: pDesc.trim() || null, price: pPrice.trim() || null, type: pType, purchase_link: pLink.trim() || null }
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
    const msg = chatMessage.trim()
    try {
      const data = await Request.Post(`/agents/${agentId}/chat`, { message: msg, history: chatHistory })
      setChatHistory(prev => [...prev, { role: 'user', content: msg }, { role: 'assistant', content: data.response }])
    } catch (err: any) {
      setChatError(err.response?.data?.detail || 'Failed to get AI response')
    } finally {
      setChatLoading(false)
      setChatMessage('')
    }
  }

  if (loading) return <Loading />
  if (!agent) return <p>Agent not found.</p>

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2.5 mb-2 gap-1.5 text-gray-500 hover:text-gray-700"
        onClick={onBack}
      >
        <ArrowLeft size={16} /> Back
      </Button>
      <div className="mb-1">
        <h2 className="m-0 text-xl font-bold text-gray-900">{agent.name}</h2>
      </div>
      {agent.description && <p className="text-gray-500 text-sm mt-1 mb-6 leading-relaxed">{agent.description}</p>}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="mb-4 w-full justify-start bg-transparent border-b border-gray-200 rounded-none h-auto p-0 overflow-x-auto overflow-y-hidden">
          <TabsTrigger
            value="config"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-none data-[state=active]:font-semibold px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 shrink-0"
          >
            Configuration
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-none data-[state=active]:font-semibold px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 shrink-0"
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            value="prompt"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-none data-[state=active]:font-semibold px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 shrink-0"
          >
            Prompt & Test
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-none data-[state=active]:font-semibold px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 shrink-0 gap-1.5"
          >
            <Calendar size={16} /> Calendar
          </TabsTrigger>
          <TabsTrigger
            value="whatsapp"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-none data-[state=active]:font-semibold px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 shrink-0 gap-1.5"
          >
            <Phone size={16} /> WhatsApp
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config">
          <Card>
            <CardContent className="p-5">
              {/* Save button at top */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-gray-900 m-0">Agent Configuration</h3>
                <div className="flex items-center gap-2">
                  {configMsg && (
                    <span className={`text-xs ${configMsg.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                      {configMsg}
                    </span>
                  )}
                  <Button size="sm" onClick={saveConfig} disabled={configSaving}>
                    {configSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="block text-xs font-medium text-gray-500 mb-1">Business Name</Label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Acme Corp" />
                </div>
                <div>
                  <Label className="block text-xs font-medium text-gray-500 mb-1">Industry</Label>
                  <Select value={industry} onValueChange={(v) => setIndustry(v || '')}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select industry..." /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="block text-xs font-medium text-gray-500 mb-1">Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v || 'professional')}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select tone..." /></SelectTrigger>
                    <SelectContent>
                      {TONES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-xs font-medium text-gray-500 mb-1">Custom Instructions</Label>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Special instructions for the AI agent..."
                    rows={3}
                    className="resize-y"
                  />
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <Label className="block text-xs font-medium text-gray-500 mb-1">Special Instruction (PDF)</Label>
                {sinstruction ? (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-green-600 font-medium">PDF loaded ({sinstruction.length} chars)</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-600" onClick={removeSinstruction}>
                        <X size={14} />
                      </Button>
                    </div>
                    <pre className="text-xs text-gray-500 max-h-24 overflow-auto whitespace-pre-wrap m-0">
                      {sinstruction.substring(0, 300)}{sinstruction.length > 300 ? '...' : ''}
                    </pre>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50/50">
                    <Upload size={18} className="text-gray-300 mb-1.5 mx-auto" />
                    <p className="text-xs text-gray-400 m-0 mb-2">Upload a PDF for special instructions</p>
                    <Label className={`inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors ${pdfUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                      {pdfUploading ? (
                        <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload size={12} />
                      )}
                      {pdfUploading ? 'Uploading...' : 'Choose PDF'}
                      <input type="file" accept="application/pdf" onChange={handlePdfUpload} disabled={pdfUploading} className="hidden" />
                    </Label>
                  </div>
                )}
                {pdfMsg && (
                  <span className={`block mt-1 text-xs ${pdfMsg.includes('Failed') || pdfMsg.includes('Only') ? 'text-red-600' : 'text-green-600'}`}>{pdfMsg}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider m-0">Products & Services</h3>
            {!showProductForm && (
              <Button size="sm" onClick={openProductCreate}><Plus size={14} /> Add</Button>
            )}
          </div>

          {showProductForm && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="m-0 mb-3 text-sm font-semibold text-gray-900">{editingProduct ? 'Edit' : 'Add Product / Service'}</h3>
                <form onSubmit={saveProduct}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <Label className="block text-xs font-medium text-gray-500 mb-1">Type</Label>
                      <Select value={pType} onValueChange={(v) => setPType(v || 'product')}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="block text-xs font-medium text-gray-500 mb-1">Name</Label>
                      <Input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Name" autoFocus />
                    </div>
                    <div>
                      <Label className="block text-xs font-medium text-gray-500 mb-1">Price</Label>
                      <Input type="number" step="0.01" min="0" value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="29.99" />
                    </div>
                    {pType === 'product' && (
                      <div>
                        <Label className="block text-xs font-medium text-gray-500 mb-1">Purchase Link</Label>
                        <Input value={pLink} onChange={(e) => setPLink(e.target.value)} placeholder="https://..." />
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <Label className="block text-xs font-medium text-gray-500 mb-1">Description</Label>
                    <Textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Description (optional)" className="resize-none h-16" />
                  </div>
                  {pError && <p className="text-red-600 text-xs mb-2">{pError}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={pSaving}>{pSaving ? 'Saving...' : editingProduct ? 'Update' : 'Add'}</Button>
                    <Button variant="outline" size="sm" type="button" onClick={closeProductForm}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {products.length === 0 ? (
            <Card className="py-8 text-center text-gray-400 text-sm">
              <p className="m-0">No products yet. Add your first product or service.</p>
            </Card>
          ) : (
            <Card>
              <div className="divide-y divide-gray-50">
                {products.map((p) => (
                  <div key={p.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <Package size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900 m-0 truncate">{p.name}</p>
                        <Badge variant="secondary" className={`text-xs rounded-full px-2 py-0 ${p.type === 'service' ? 'bg-violet-50 text-violet-600 border border-violet-100' : 'bg-sky-50 text-sky-600 border border-sky-100'}`}>
                          {p.type === 'service' ? 'Service' : 'Product'}
                        </Badge>
                        {p.price && <span className="text-xs font-semibold text-gray-500">${p.price}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.description && <p className="text-xs text-gray-400 m-0 truncate">{p.description}</p>}
                        {p.purchase_link && (
                          <a href={p.purchase_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 inline-flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <Link2 size={10} /> Link
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-blue-600" onClick={() => openProductEdit(p)}><Pencil size={13} /></Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-red-600" onClick={() => deleteProduct(p)}><Trash2 size={13} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Prompt & Test Tab */}
        <TabsContent value="prompt">
          {/* Chat Section — Primary */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="flex items-center gap-2 m-0 mb-3 text-sm font-semibold text-gray-900">
                <MessageSquare size={16} className="text-blue-500" /> Test Chat
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  className="flex-1"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message to test the agent..."
                  onKeyDown={(e) => e.key === 'Enter' && !chatLoading && sendChat()}
                />
                <Button size="sm" onClick={sendChat} disabled={chatLoading || !chatMessage.trim()}>
                  {chatLoading ? '...' : <><Send size={14} /> Send</>}
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {chatHistory.length === 0 && !chatError && !chatLoading && (
                  <p className="text-xs text-gray-400 text-center py-6 m-0">Send a message to test your agent</p>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`mt-2 py-2 px-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-50' : 'bg-green-50'}`}>
                    <p className={`text-xs font-semibold mb-0.5 ${msg.role === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
                      {msg.role === 'user' ? 'You' : 'AI'}
                    </p>
                    <p className="text-sm m-0 whitespace-pre-wrap break-words text-gray-800">{msg.content}</p>
                  </div>
                ))}
                {chatError && <p className="text-red-600 text-xs mt-2">{chatError}</p>}
                {chatLoading && <p className="text-gray-400 text-xs mt-2">Thinking...</p>}
              </div>
            </CardContent>
          </Card>

          {/* Prompt Section — Collapsible */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <h3 className="flex items-center gap-2 m-0 text-sm font-semibold text-gray-900">
                  <Sparkles size={16} className="text-blue-500" /> System Prompt
                </h3>
                <Button size="sm" variant="outline" onClick={generatePrompt} disabled={promptLoading}>
                  {promptLoading ? '...' : <><Sparkles size={14} /> Generate</>}
                </Button>
              </div>
              {generatedPrompt ? (
                <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-xs leading-relaxed whitespace-pre-wrap break-words m-0 mt-3 max-h-60 overflow-y-auto">
                  {generatedPrompt}
                </pre>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4 m-0">Click &quot;Generate&quot; to preview prompt</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <div className="max-w-full">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h3 className="m-0 flex items-center gap-2 text-base font-semibold text-gray-900">
                <Calendar size={18} className="text-blue-500" /> Google Calendar
              </h3>
              {calendarConnected ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { fetchBookings() }}
                    disabled={calendarLoading}
                  >
                    {calendarLoading ? 'Loading...' : 'Refresh'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={disconnectCalendar}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button onClick={connectCalendar}>
                  Connect Google Calendar
                </Button>
              )}
            </div>

            {!calendarConnected ? (
              <div className="text-center py-12 px-4 text-gray-400 text-sm leading-relaxed">
                <p>Connect your Google Calendar to let this agent book appointments.</p>
              </div>
            ) : (
              <>
                <Card className="mb-4">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-700"
                        onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else { setCalMonth(calMonth - 1) } }}
                      >
                        &lt;
                      </Button>
                      <h4 className="m-0 text-base font-semibold text-gray-900">
                        {new Date(calYear, calMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-700"
                        onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else { setCalMonth(calMonth + 1) } }}
                      >
                        &gt;
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center overflow-x-auto min-w-0">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-xs font-semibold text-gray-400 uppercase py-2">{d}</div>
                      ))}
                      {(() => {
                        const firstDay = new Date(calYear, calMonth, 1).getDay()
                        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
                        const today = new Date()
                        const cells = []
                        for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />)
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                          const dayBookings = bookings.filter(b => b.start && b.start.startsWith(dateStr))
                          const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day
                          const isSelected = selectedDate === dateStr
                          cells.push(
                            <div
                              key={day}
                              className={`relative flex items-center justify-center py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors duration-150 ${
                                isSelected
                                  ? 'bg-blue-500 text-white'
                                  : isToday
                                    ? 'bg-blue-50 text-blue-600 font-bold'
                                    : dayBookings.length > 0
                                      ? 'bg-green-50 text-gray-700'
                                      : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={() => { setSelectedDate(dateStr); checkAvailability(dateStr) }}
                            >
                              {day}
                              {dayBookings.length > 0 && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                              )}
                            </div>
                          )
                        }
                        return cells
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {selectedDate && (
                  <Card className="mb-4">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="m-0 text-base font-semibold text-gray-900">Availability &mdash; {selectedDate}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkAvailability()}
                        >
                          Check
                        </Button>
                      </div>
                      {availableSlots.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.map((slot, i) => (
                            <Badge key={i} variant="outline" className="py-1.5 px-3 bg-green-50 border-green-200 text-green-700 text-sm font-medium">
                              {slot.start} - {slot.end}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">Click &quot;Check&quot; to see available slots.</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-5">
                    <h4 className="m-0 mb-3 text-base font-semibold text-gray-900">
                      {selectedDate ? `Bookings \u2014 ${selectedDate}` : 'Upcoming Bookings'}
                    </h4>
                    {(() => {
                      const filtered = selectedDate
                        ? bookings.filter(b => b.start && b.start.startsWith(selectedDate))
                        : bookings
                      return filtered.length === 0 ? (
                        <div className="text-center py-12 px-4 text-gray-400 text-sm leading-relaxed"><p>No bookings{selectedDate ? ' on this date' : ''}.</p></div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {filtered.map((b) => (
                            <div key={b.event_id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors duration-150">
                              <p className="m-0 font-semibold text-gray-900 text-sm">{b.summary}</p>
                              <p className="m-0 mt-1 text-gray-500 text-xs">
                                {new Date(b.start).toLocaleString()} &mdash; {new Date(b.end).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp">
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="flex items-center gap-2 m-0 text-base font-semibold text-gray-900">
                <Phone size={18} className="text-green-500" /> WhatsApp Numbers
              </h3>
            </div>

            {/* Connected Numbers */}
            {waNumbers.length > 0 && (
              <div className="space-y-2 mb-6">
                {waNumbers.map((wn) => (
                  <Card key={wn.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                        <Phone size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 m-0">{wn.phone_number}</p>
                        <p className="text-xs text-gray-400 m-0">Connected</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => disconnectWaNumber(wn.id)}>
                      Disconnect
                    </Button>
                  </Card>
                ))}
              </div>
            )}

            {/* Acquire Number */}
            <Card>
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-gray-900 m-0 mb-3">Acquire a WhatsApp Number</h4>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <Input
                    className="w-24"
                    value={waCountry}
                    onChange={(e) => setWaCountry(e.target.value.toUpperCase())}
                    placeholder="US"
                    maxLength={2}
                  />
                  <Button variant="outline" size="sm" onClick={fetchAvailableNumbers} disabled={waLoading}>
                    {waLoading ? 'Searching...' : 'Search Numbers'}
                  </Button>
                </div>

                {waAvailable.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 m-0 mb-2">{waAvailable.length} numbers available</p>
                    {waAvailable.map((n) => (
                      <div key={n.phone_number} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-gray-900 m-0">{n.phone_number}</p>
                          {n.friendly_name && <p className="text-xs text-gray-400 m-0">{n.friendly_name}</p>}
                        </div>
                        <Button size="sm" onClick={() => connectWaNumber(n.phone_number)}>
                          Connect
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {waAvailable.length === 0 && !waLoading && (
                  <p className="text-sm text-gray-400 m-0">Enter a country code and search to find available numbers.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AgentDetail
