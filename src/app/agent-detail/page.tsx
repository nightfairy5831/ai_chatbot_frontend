'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Pencil, Trash2, Package, Sparkles, Send, MessageSquare, Upload, X, Calendar, Link2 } from 'lucide-react'
import Request from '../../lib/request'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  if (loading) return (
    <div className="flex items-center justify-center gap-3 min-h-60 text-gray-500 text-sm">
      <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      Loading...
    </div>
  )
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
        <TabsList className="mb-4 w-full justify-start bg-transparent border-b border-gray-200 rounded-none h-auto p-0 overflow-x-auto">
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
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config">
          <div className="max-w-full">
            <div className="mb-3">
              <Label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="mb-3">
              <Label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</Label>
              <Select value={industry} onValueChange={(v) => setIndustry(v || '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select industry..." />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(i => (
                    <SelectItem key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-3">
              <Label className="block text-sm font-medium text-gray-700 mb-1.5">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v || 'professional')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tone..." />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map(t => (
                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-3">
              <Label className="block text-sm font-medium text-gray-700 mb-1.5">Custom Instructions</Label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Special instructions for the AI agent..."
                rows={4}
                className="resize-y min-h-20"
              />
            </div>
            <div className="mb-3">
              <Label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instruction (PDF Upload)</Label>
              {sinstruction ? (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-green-600 font-medium">PDF content loaded ({sinstruction.length} characters)</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Remove"
                      onClick={removeSinstruction}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-600 max-h-36 overflow-auto whitespace-pre-wrap m-0">
                    {sinstruction.substring(0, 500)}{sinstruction.length > 500 ? '...' : ''}
                  </pre>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                  <Upload size={24} className="text-gray-400 mb-2 mx-auto" />
                  <p className="text-sm text-gray-500 mt-0 mb-3">
                    Upload a PDF file to add special instructions for this agent
                  </p>
                  <Label className={`inline-flex items-center gap-1.5 py-2.5 px-5 rounded-lg border-none bg-blue-500 text-white text-base font-semibold transition-colors duration-150 hover:bg-blue-600 ${pdfUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                    {pdfUploading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {pdfUploading ? 'Uploading...' : 'Choose PDF'}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      disabled={pdfUploading}
                      className="hidden"
                    />
                  </Label>
                </div>
              )}
              {pdfMsg && (
                <span className={`block mt-1 text-sm ${pdfMsg.includes('Failed') || pdfMsg.includes('Only') ? 'text-red-600' : 'text-green-600'}`}>
                  {pdfMsg}
                </span>
              )}
            </div>
            <div className="flex gap-3 mt-3">
              <Button
                onClick={saveConfig}
                disabled={configSaving}
              >
                {configSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
              {configMsg && (
                <span className={`text-sm self-center ${configMsg.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                  {configMsg}
                </span>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="max-w-full">
            <div className="mb-6">
              {!showProductForm && (
                <Button onClick={openProductCreate}>
                  <Plus size={16} /> Add Product
                </Button>
              )}
            </div>

            {showProductForm && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={saveProduct}>
                    <div className="mb-3">
                      <Label className="block text-sm font-medium text-gray-700 mb-1.5">Type</Label>
                      <Select value={pType} onValueChange={(v) => setPType(v || 'product')}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mb-3">
                      <Label className="block text-sm font-medium text-gray-700 mb-1.5">Name</Label>
                      <Input
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        placeholder="Product name"
                        autoFocus
                      />
                    </div>
                    <div className="mb-3">
                      <Label className="block text-sm font-medium text-gray-700 mb-1.5">Description</Label>
                      <Textarea
                        value={pDesc}
                        onChange={(e) => setPDesc(e.target.value)}
                        placeholder="Product description"
                        className="resize-y min-h-20"
                      />
                    </div>
                    <div className="mb-3">
                      <Label className="block text-sm font-medium text-gray-700 mb-1.5">Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={pPrice}
                        onChange={(e) => setPPrice(e.target.value)}
                        placeholder="29.99"
                      />
                    </div>
                    {pType === 'product' && (
                      <div className="mb-3">
                        <Label className="block text-sm font-medium text-gray-700 mb-1.5">Purchase Link</Label>
                        <Input
                          value={pLink}
                          onChange={(e) => setPLink(e.target.value)}
                          placeholder="https://your-store.com/product"
                        />
                      </div>
                    )}
                    {pError && <p className="text-red-600 text-sm mt-0 mb-2">{pError}</p>}
                    <div className="flex gap-3 mt-3">
                      <Button type="submit" disabled={pSaving}>
                        {pSaving ? 'Saving...' : editingProduct ? 'Update' : 'Add'}
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={closeProductForm}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {products.length === 0 ? (
              <div className="text-center py-12 px-4 text-gray-400 text-sm leading-relaxed"><p>No products yet. Add your first product or service.</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <Card key={p.id} className="flex flex-row items-center gap-8 p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-150">
                    <div className="flex flex-col gap-2 items-center shrink-0">
                      <div className="text-blue-500 flex items-center justify-center shrink-0">
                        <Package size={36} />
                      </div>
                      {p.price && (
                        <span className="py-1 px-3 rounded-md bg-blue-500/10 text-blue-500 text-base font-semibold whitespace-nowrap text-center">
                          ${p.price}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-start justify-center flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-gray-900 m-0">{p.name}</p>
                        <Badge variant={p.type === 'service' ? 'secondary' : 'default'} className={p.type === 'service' ? 'bg-violet-100 text-violet-600' : 'bg-sky-100 text-sky-700'}>
                          {p.type === 'service' ? 'SERVICE' : 'PRODUCT'}
                        </Badge>
                      </div>
                      {p.description && <p className="text-base text-gray-500 m-0 leading-snug line-clamp-2">{p.description}</p>}
                      {p.purchase_link && (
                        <a
                          href={p.purchase_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 inline-flex items-center gap-1"
                        >
                          <Link2 size={14} /> Purchase Link
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-center shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-700"
                        title="Edit"
                        onClick={() => openProductEdit(p)}
                      >
                        <Pencil size={17} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                        onClick={() => deleteProduct(p)}
                      >
                        <Trash2 size={17} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Prompt & Test Tab */}
        <TabsContent value="prompt">
          <div className="flex flex-col min-h-72">
            <div className="flex-[3] flex flex-col min-h-0 mb-4">
              <div className="flex justify-between items-center mb-3 shrink-0">
                <h3 className="flex items-center gap-2 m-0 text-base font-semibold text-gray-900">
                  <Sparkles size={18} className="text-blue-500" /> Generated Prompt
                </h3>
                <Button
                  onClick={generatePrompt}
                  disabled={promptLoading}
                >
                  {promptLoading ? 'Generating...' : <><Sparkles size={16} /> Generate Prompt</>}
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0 rounded-xl">
                {generatedPrompt ? (
                  <pre className="bg-gray-800 text-gray-200 p-5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap break-words m-0">
                    {generatedPrompt}
                  </pre>
                ) : (
                  <div className="text-center py-12 px-4 text-gray-400 text-sm leading-relaxed"><p>Click &quot;Generate Prompt&quot; to preview your agent&apos;s prompt.</p></div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex-[2] flex flex-col min-h-0">
              <h3 className="flex items-center gap-2 m-0 mb-3 text-base font-semibold text-gray-900 shrink-0">
                <MessageSquare size={18} className="text-blue-500" /> Test Chat
              </h3>
              <div className="flex gap-3 shrink-0">
                <Input
                  className="flex-1"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message to test the agent..."
                  onKeyDown={(e) => e.key === 'Enter' && !chatLoading && sendChat()}
                />
                <Button
                  onClick={sendChat}
                  disabled={chatLoading || !chatMessage.trim()}
                >
                  {chatLoading ? 'Sending...' : <><Send size={16} /> Send</>}
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0 mt-2">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`mt-2 py-2 px-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-50' : 'bg-green-50'}`}
                  >
                    <p className={`text-xs font-semibold mb-1 ${msg.role === 'user' ? 'text-blue-700' : 'text-green-600'}`}>
                      {msg.role === 'user' ? 'You' : 'AI'}
                    </p>
                    <p className="text-sm m-0 whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                ))}
                {chatError && <p className="text-red-600 text-sm mt-2">{chatError}</p>}
                {chatLoading && <p className="text-gray-500 text-sm mt-2">Thinking...</p>}
              </div>
            </div>
          </div>
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
      </Tabs>
    </div>
  )
}

export default AgentDetail
