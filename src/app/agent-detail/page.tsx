import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Calendar, Phone, Globe } from 'lucide-react'
import Request from '../../lib/request'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Agent } from './types'
import ConfigTab from './tabs/ConfigTab'
import ProductsTab from './tabs/ProductsTab'
import PromptTab from './tabs/PromptTab'
import CalendarTab from './tabs/CalendarTab'
import WhatsappTab from './tabs/WhatsappTab'
import WebsiteTab from './tabs/WebsiteTab'

const TAB_CLASS =
  'rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none data-[state=active]:font-semibold px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 shrink-0 gap-1.5'

function AgentDetail({ agentId, onBack, onLogout }: { agentId: number; onBack: () => void; onLogout: () => void }) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('config')

  const fetchAgent = useCallback(async () => {
    try {
      const data = await Request.Get(`/agents/${agentId}`)
      setAgent(data)
    } catch (err) {
      if ((err as { response?: { status?: number } })?.response?.status === 401) onLogout()
    } finally {
      setLoading(false)
    }
  }, [agentId, onLogout])

  useEffect(() => { fetchAgent() }, [fetchAgent])

  if (loading) return <Loading />
  if (!agent) return <p>Agent not found.</p>

  return (
    <div>
      <Button variant="ghost" size="sm" className="-ml-2.5 mb-2 gap-1.5 text-gray-500 hover:text-gray-700" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </Button>
      <div className="mb-1">
        <h2 className="m-0 text-xl font-bold text-gray-900">{agent.name}</h2>
      </div>
      {agent.description && <p className="text-gray-500 text-sm mt-1 mb-6 leading-relaxed">{agent.description}</p>}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start bg-transparent border-b border-gray-200 rounded-none h-auto p-0 overflow-x-auto overflow-y-hidden">
          <TabsTrigger value="config" className={TAB_CLASS}>Configuration</TabsTrigger>
          <TabsTrigger value="products" className={TAB_CLASS}>Products</TabsTrigger>
          <TabsTrigger value="prompt" className={TAB_CLASS}>Prompt &amp; Test</TabsTrigger>
          <TabsTrigger value="calendar" className={TAB_CLASS}><Calendar size={16} /> Calendar</TabsTrigger>
          <TabsTrigger value="whatsapp" className={TAB_CLASS}><Phone size={16} /> WhatsApp</TabsTrigger>
          <TabsTrigger value="website" className={TAB_CLASS}><Globe size={16} /> Website</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <ConfigTab agent={agent} onSaved={fetchAgent} />
        </TabsContent>
        <TabsContent value="products">
          <ProductsTab agentId={agentId} />
        </TabsContent>
        <TabsContent value="prompt">
          <PromptTab agentId={agentId} initialPrompt={agent.prompt_template} />
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarTab agentId={agentId} />
        </TabsContent>
        <TabsContent value="whatsapp">
          <WhatsappTab agentId={agentId} />
        </TabsContent>
        <TabsContent value="website">
          <WebsiteTab agent={agent} onChanged={fetchAgent} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AgentDetail
