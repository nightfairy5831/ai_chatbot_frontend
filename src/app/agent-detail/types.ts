export interface Product {
  id: number
  name: string
  description: string | null
  price: string | null
  type: string
  purchase_link: string | null
  agent_id: number
}

export interface Booking {
  event_id: string
  summary: string
  start: string
  end: string
  status: string
}

export interface TimeSlot {
  start: string
  end: string
}

export interface WhatsappNumber {
  id: number
  phone_number: string
  provider_mode: string
  is_active: boolean
}

export interface Agent {
  id: number
  name: string
  description: string | null
  business_name: string | null
  industry: string | null
  tone: string | null
  instructions: string | null
  sinstruction: string | null
  prompt_template: string | null
  timezone: string | null
  work_start: string | null
  work_end: string | null
  work_days: string | null
  slot_minutes: number | null
  public_key: string | null
  public_chat_enabled: boolean
  allowed_origins: string | null
  products: Product[]
}

export const INDUSTRIES = ['retail', 'healthcare', 'finance', 'education', 'technology', 'food', 'travel', 'real-estate', 'other']
export const TONES = ['professional', 'friendly', 'casual', 'formal']

export const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
]

// Common IANA zones — the API accepts any valid zone name.
export const TIMEZONES = [
  'America/Sao_Paulo', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Mexico_City', 'America/Bogota', 'America/Buenos_Aires', 'Europe/Lisbon', 'Europe/London',
  'Europe/Madrid', 'Europe/Paris', 'Europe/Berlin', 'Africa/Lagos', 'Asia/Dubai', 'Asia/Riyadh',
  'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'UTC',
]

export function errorText(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length && typeof detail[0]?.msg === 'string') return detail[0].msg
  return fallback
}
