import { useState } from 'react'
import { Sparkles, Send, MessageSquare } from 'lucide-react'
import Request from '../../../lib/request'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { errorText } from '../types'

export default function PromptTab({ agentId, initialPrompt }: { agentId: number; initialPrompt: string | null }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{ role: string; content: string }[]>([])
  const [prompt, setPrompt] = useState<string | null>(initialPrompt)
  const [promptLoading, setPromptLoading] = useState(false)

  const generatePrompt = async () => {
    setPromptLoading(true)
    try {
      const data = await Request.Get(`/agents/${agentId}/generate-prompt`)
      setPrompt(data.prompt)
    } catch (err) {
      setPrompt(errorText(err, 'Failed to generate prompt.'))
    } finally {
      setPromptLoading(false)
    }
  }

  const send = async () => {
    const text = message.trim()
    if (!text) return
    setLoading(true)
    setError(null)
    setMessage('')
    try {
      const data = await Request.Post(`/agents/${agentId}/chat`, { message: text, history })
      setHistory(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: data.response }])
    } catch (err) {
      setError(errorText(err, 'Failed to get AI response'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <h3 className="flex items-center gap-2 m-0 mb-3 text-sm font-semibold text-gray-900">
            <MessageSquare size={16} className="text-brand" /> Test Chat
          </h3>
          <div className="flex gap-2 mb-3">
            <Input
              className="flex-1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message to test the agent..."
              onKeyDown={(e) => e.key === 'Enter' && !loading && send()}
            />
            <Button size="sm" onClick={send} disabled={loading || !message.trim()}>
              {loading ? '...' : <><Send size={14} /> Send</>}
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {history.length === 0 && !error && !loading && (
              <p className="text-xs text-gray-400 text-center py-6 m-0">Send a message to test your agent</p>
            )}
            {history.map((msg, i) => (
              <div key={i} className={`mt-2 py-2 px-3 rounded-lg ${msg.role === 'user' ? 'bg-brand-light' : 'bg-green-50'}`}>
                <p className={`text-xs font-semibold mb-0.5 ${msg.role === 'user' ? 'text-brand-dark' : 'text-green-600'}`}>
                  {msg.role === 'user' ? 'You' : 'AI'}
                </p>
                <p className="text-sm m-0 whitespace-pre-wrap break-words text-gray-800">{msg.content}</p>
              </div>
            ))}
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            {loading && <p className="text-gray-400 text-xs mt-2">Thinking...</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="flex items-center gap-2 m-0 text-sm font-semibold text-gray-900">
              <Sparkles size={16} className="text-brand" /> System Prompt
            </h3>
            <Button size="sm" variant="outline" onClick={generatePrompt} disabled={promptLoading}>
              {promptLoading ? '...' : <><Sparkles size={14} /> Generate</>}
            </Button>
          </div>
          {prompt ? (
            <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-xs leading-relaxed whitespace-pre-wrap break-words m-0 mt-3 max-h-60 overflow-y-auto">
              {prompt}
            </pre>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4 m-0">Click &quot;Generate&quot; to preview prompt</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
