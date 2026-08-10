import { useState, useEffect, useCallback } from 'react'
import { Calendar, Trash2 } from 'lucide-react'
import Request, { showToast } from '../../../lib/request'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type Booking, type TimeSlot, errorText } from '../types'

export default function CalendarTab({ agentId }: { agentId: number }) {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      setBookings(await Request.Get(`/calendar/agents/${agentId}/bookings`))
    } catch (err) {
      showToast(errorText(err, 'Could not load bookings'))
    } finally {
      setLoading(false)
    }
  }, [agentId])

  const fetchConnection = useCallback(async () => {
    try {
      const data = await Request.Get(`/calendar/agents/${agentId}/connection`)
      const isConnected = !!data
      setConnected(isConnected)
      if (isConnected) fetchBookings()
    } catch {
      setConnected(false)
    }
  }, [agentId, fetchBookings])

  useEffect(() => { fetchConnection() }, [fetchConnection])

  useEffect(() => {
    const onMessage = (e: MessageEvent) => { if (e.data === 'calendar-connected') fetchConnection() }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [fetchConnection])

  const connect = async () => {
    try {
      const data = await Request.Get(`/calendar/connect/${agentId}`)
      window.open(data.auth_url, '_blank')
    } catch (err) {
      showToast(errorText(err, 'Could not start Google Calendar connection'))
    }
  }

  const disconnect = async () => {
    if (!confirm('Disconnect Google Calendar?')) return
    try {
      await Request.Delete(`/calendar/agents/${agentId}/disconnect`)
      setConnected(false)
      setBookings([])
    } catch (err) {
      showToast(errorText(err, 'Could not disconnect'))
    }
  }

  const checkAvailability = async (dateOverride?: string) => {
    const date = dateOverride || selectedDate
    if (!date) return
    try {
      setSlots(await Request.Post(`/calendar/agents/${agentId}/availability`, { date }))
    } catch (err) {
      setSlots([])
      showToast(errorText(err, 'Could not check availability'))
    }
  }

  const cancelBooking = async (booking: Booking) => {
    if (!confirm(`Cancel "${booking.summary}"?`)) return
    try {
      await Request.Delete(`/calendar/agents/${agentId}/bookings/${booking.event_id}`)
      showToast('Appointment cancelled')
      await fetchBookings()
      if (selectedDate) await checkAvailability()
    } catch (err) {
      showToast(errorText(err, 'Could not cancel the appointment'))
    }
  }

  const visibleBookings = selectedDate ? bookings.filter(b => b.start && b.start.startsWith(selectedDate)) : bookings

  return (
    <div className="max-w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h3 className="m-0 flex items-center gap-2 text-base font-semibold text-gray-900">
          <Calendar size={18} className="text-brand" /> Google Calendar
        </h3>
        {connected ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchBookings} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</Button>
            <Button variant="outline" onClick={disconnect}>Disconnect</Button>
          </div>
        ) : (
          <Button onClick={connect}>Connect Google Calendar</Button>
        )}
      </div>

      {!connected ? (
        <div className="text-center py-12 px-4 text-gray-400 text-sm leading-relaxed">
          <p>Connect your Google Calendar to let this agent book appointments.</p>
        </div>
      ) : (
        <>
          <Card className="mb-4">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700"
                  onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }}
                >&lt;</Button>
                <h4 className="m-0 text-base font-semibold text-gray-900">
                  {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h4>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700"
                  onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }}
                >&gt;</Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center overflow-x-auto min-w-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-xs font-semibold text-gray-400 uppercase py-2">{d}</div>
                ))}
                {(() => {
                  const firstDay = new Date(year, month, 1).getDay()
                  const daysInMonth = new Date(year, month + 1, 0).getDate()
                  const today = new Date()
                  const cells = []
                  for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />)
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const dayBookings = bookings.filter(b => b.start && b.start.startsWith(dateStr))
                    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
                    const isSelected = selectedDate === dateStr
                    cells.push(
                      <div
                        key={day}
                        className={`relative flex items-center justify-center py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors duration-150 ${
                          isSelected ? 'bg-brand text-white'
                            : isToday ? 'bg-brand-light text-brand-dark font-bold'
                              : dayBookings.length > 0 ? 'bg-green-50 text-gray-700'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => { setSelectedDate(dateStr); checkAvailability(dateStr) }}
                      >
                        {day}
                        {dayBookings.length > 0 && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand" />
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
                  <Button variant="outline" size="sm" onClick={() => checkAvailability()}>Check</Button>
                </div>
                {slots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot, i) => (
                      <Badge key={i} variant="outline" className="py-1.5 px-3 bg-green-50 border-green-200 text-green-700 text-sm font-medium">
                        {slot.start} - {slot.end}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm m-0">No free slots for this date inside the agent&apos;s booking window.</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <h4 className="m-0 mb-3 text-base font-semibold text-gray-900">
                {selectedDate ? `Bookings — ${selectedDate}` : 'Upcoming Bookings'}
              </h4>
              {visibleBookings.length === 0 ? (
                <div className="text-center py-12 px-4 text-gray-400 text-sm leading-relaxed">
                  <p>No bookings{selectedDate ? ' on this date' : ''}.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {visibleBookings.map((b) => (
                    <div key={b.event_id} className="flex items-start justify-between gap-3 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors duration-150">
                      <div className="min-w-0">
                        <p className="m-0 font-semibold text-gray-900 text-sm truncate">{b.summary}</p>
                        <p className="m-0 mt-1 text-gray-500 text-xs">
                          {new Date(b.start).toLocaleString()} &mdash; {new Date(b.end).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost" size="sm"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                        onClick={() => cancelBooking(b)}
                      >
                        <Trash2 size={14} className="mr-1" /> Cancel
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
