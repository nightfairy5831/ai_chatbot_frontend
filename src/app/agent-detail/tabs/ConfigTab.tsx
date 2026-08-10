import { useState } from 'react'
import { Upload, X, Clock } from 'lucide-react'
import Request from '../../../lib/request'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type Agent, INDUSTRIES, TONES, TIMEZONES, WEEKDAYS, errorText } from '../types'

export default function ConfigTab({ agent, onSaved }: { agent: Agent; onSaved: () => void }) {
  const [businessName, setBusinessName] = useState(agent.business_name || '')
  const [industry, setIndustry] = useState(agent.industry || '')
  const [tone, setTone] = useState(agent.tone || 'professional')
  const [instructions, setInstructions] = useState(agent.instructions || '')
  const [timezone, setTimezone] = useState(agent.timezone || '')
  const [workStart, setWorkStart] = useState(agent.work_start || '09:00')
  const [workEnd, setWorkEnd] = useState(agent.work_end || '17:00')
  const [workDays, setWorkDays] = useState<number[]>(
    (agent.work_days || '1,2,3,4,5').split(',').map(Number).filter(Boolean)
  )
  const [slotMinutes, setSlotMinutes] = useState(String(agent.slot_minutes || 60))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const [sinstruction, setSinstruction] = useState<string | null>(agent.sinstruction)
  const [pdfUploading, setPdfUploading] = useState(false)
  const [pdfMsg, setPdfMsg] = useState<string | null>(null)

  const toggleDay = (day: number) =>
    setWorkDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort())

  const saveConfig = async () => {
    setSaving(true)
    setMsg(null)
    try {
      await Request.Patch(`/agents/${agent.id}`, {
        business_name: businessName.trim() || null,
        industry: industry || null,
        tone: tone || null,
        instructions: instructions.trim() || null,
        timezone: timezone || null,
        work_start: workStart || null,
        work_end: workEnd || null,
        work_days: workDays.length ? workDays.join(',') : null,
        slot_minutes: Number(slotMinutes) || 60,
      })
      setMsg('Configuration saved!')
      onSaved()
      setTimeout(() => setMsg(null), 3000)
    } catch (err) {
      setMsg(errorText(err, 'Failed to save'))
    } finally {
      setSaving(false)
    }
  }

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
      const data = await Request.Upload(`/agents/${agent.id}/upload-sinstruction`, file)
      setSinstruction(data.sinstruction)
      setPdfMsg('PDF uploaded successfully!')
    } catch (err) {
      setPdfMsg(errorText(err, 'Failed to upload PDF'))
    } finally {
      setPdfUploading(false)
      e.target.value = ''
      setTimeout(() => setPdfMsg(null), 3000)
    }
  }

  const removeSinstruction = async () => {
    try {
      await Request.Delete(`/agents/${agent.id}/sinstruction`)
      setSinstruction(null)
      setPdfMsg('Special instruction removed')
    } catch (err) {
      setPdfMsg(errorText(err, 'Failed to remove'))
    } finally {
      setTimeout(() => setPdfMsg(null), 3000)
    }
  }

  const isError = (text: string) => text.toLowerCase().includes('fail') || text.startsWith('Only')

  return (
    <>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900 m-0">Agent Configuration</h3>
            <div className="flex items-center gap-2">
              {msg && <span className={`text-xs ${isError(msg) ? 'text-red-600' : 'text-green-600'}`}>{msg}</span>}
              <Button size="sm" onClick={saveConfig} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
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
                <Label className={`inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full text-xs font-medium bg-brand text-white hover:bg-brand-dark transition-colors ${pdfUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                  {pdfUploading
                    ? <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Upload size={12} />}
                  {pdfUploading ? 'Uploading...' : 'Choose PDF'}
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} disabled={pdfUploading} className="hidden" />
                </Label>
              </div>
            )}
            {pdfMsg && <span className={`block mt-1 text-xs ${isError(pdfMsg) ? 'text-red-600' : 'text-green-600'}`}>{pdfMsg}</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 m-0 mb-1 flex items-center gap-2">
            <Clock size={16} className="text-brand" /> Booking Window
          </h3>
          <p className="text-xs text-gray-400 m-0 mb-4">
            The agent only offers appointments inside these hours, in this timezone.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1">Timezone</Label>
              <Select value={timezone} onValueChange={(v) => setTimezone(v || '')}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Server default" /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1">Appointment Length</Label>
              <Select value={slotMinutes} onValueChange={(v) => setSlotMinutes(v || '60')}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['15', '30', '45', '60', '90', '120'].map(m => <SelectItem key={m} value={m}>{m} minutes</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1">Opens</Label>
              <Input type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} />
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1">Closes</Label>
              <Input type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} />
            </div>
          </div>

          <Label className="block text-xs font-medium text-gray-500 mb-1.5">Open Days</Label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  workDays.includes(d.value)
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
