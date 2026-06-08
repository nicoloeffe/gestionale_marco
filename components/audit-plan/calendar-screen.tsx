'use client'

import { AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Download, MapPin, Plus, Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { DOW_IT, MONTHS_IT, fmtDate, fmtTime } from './date-utils'
import { EventDetailDrawer } from './event-detail-drawer'
import { EventFormDrawer } from './event-form-drawer'
import { StatusLegend } from './status-legend'
import { Btn, Card, Pill } from './ui'
import { type CalendarFilters, FilterBar, initialCalendarFilters } from './calendar/filter-bar'
import { MonthGrid, groupByDay } from './calendar/month-grid'
import { INITIAL_EVENTS, type CalendarEvent, auditorsOf, clientOf, standardsOf } from './calendar/data'
import { EventChip } from './calendar/event-chip'

type CalendarViewMode = 'mese' | 'settimana' | 'giorno' | 'programma'

function useFilteredEvents(events: CalendarEvent[], filters: CalendarFilters) {
  return useMemo(() => {
    return events.filter((event) => {
      if (filters.auditor !== 'all' && !event.auditorIds.includes(filters.auditor)) return false
      if (filters.client !== 'all' && event.clientId !== filters.client) return false
      if (filters.standard !== 'all' && !event.standardIds.includes(filters.standard)) return false
      if (filters.status !== 'all' && event.status !== filters.status) return false
      if (filters.performed === 'si' && !event.performed) return false
      if (filters.performed === 'no' && event.performed) return false

      if (filters.q) {
        const query = filters.q.toLowerCase()
        const client = clientOf(event)
        const standards = standardsOf(event).map((standard) => standard.code).join(' ')
        const auditors = auditorsOf(event).map((auditor) => auditor.name).join(' ')
        const haystack = `${client?.name ?? ''} ${standards} ${auditors} ${event.auditNumber} ${event.auditType}`.toLowerCase()

        if (!haystack.includes(query)) return false
      }

      return true
    })
  }, [events, filters])
}

export function CalendarScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS)
  const [filters, setFilters] = useState<CalendarFilters>(initialCalendarFilters)
  const [anchor, setAnchor] = useState(new Date(2026, 4, 1))
  const [viewMode, setViewMode] = useState<CalendarViewMode>('mese')
  const [selected, setSelected] = useState<CalendarEvent | null>(null)
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [creating, setCreating] = useState(false)
  const [presetDate, setPresetDate] = useState<Date | null>(null)
  const handledNewParam = useRef(false)

  const today = useMemo(() => new Date(2026, 4, 8), [])
  const filtered = useFilteredEvents(events, filters)
  const eventsByDay = useMemo(() => groupByDay(filtered), [filtered])

  const monthEvents = filtered.filter((event) => {
    const date = new Date(event.start)
    return date.getFullYear() === anchor.getFullYear() && date.getMonth() === anchor.getMonth()
  })
  const kpis = {
    total: monthEvents.length,
    planned: monthEvents.filter((event) => ['pianificato', 'confermato'].includes(event.status)).length,
    performed: monthEvents.filter((event) => event.performed).length,
    reschedule: monthEvents.filter((event) => event.status === 'da_riprogrammare').length,
  }

  const openNew = (date?: Date) => {
    setPresetDate(date ?? null)
    setCreating(true)
    setSelected(null)
    setEditing(null)
  }

  useEffect(() => {
    if (handledNewParam.current) return
    handledNewParam.current = true

    const params = new URLSearchParams(window.location.search)
    if (params.get('new') === '1') {
      openNew()
    }
  }, [])

  const openEdit = (event: CalendarEvent) => {
    setEditing(event)
    setSelected(null)
    setCreating(false)
  }

  const saveEvent = (event: CalendarEvent) => {
    setEvents((current) => {
      const exists = current.some((item) => item.id === event.id)
      return exists ? current.map((item) => (item.id === event.id ? event : item)) : [...current, event]
    })
    setCreating(false)
    setEditing(null)
    setPresetDate(null)
  }

  const cancelEvent = (event: CalendarEvent) => {
    setEvents((current) => current.map((item) => (item.id === event.id ? { ...item, status: 'annullato', performed: false } : item)))
    setSelected(null)
  }

  const goPrev = () =>
    setAnchor((current) => {
      if (viewMode === 'mese') return new Date(current.getFullYear(), current.getMonth() - 1, 1)
      if (viewMode === 'settimana' || viewMode === 'programma') return addDays(current, -7)
      return addDays(current, -1)
    })
  const goNext = () =>
    setAnchor((current) => {
      if (viewMode === 'mese') return new Date(current.getFullYear(), current.getMonth() + 1, 1)
      if (viewMode === 'settimana' || viewMode === 'programma') return addDays(current, 7)
      return addDays(current, 1)
    })
  const goToday = () => setAnchor(viewMode === 'mese' ? new Date(today.getFullYear(), today.getMonth(), 1) : today)

  const title =
    viewMode === 'mese'
      ? `${MONTHS_IT[anchor.getMonth()]} ${anchor.getFullYear()}`
      : viewMode === 'settimana'
        ? formatWeekTitle(anchor)
        : viewMode === 'giorno'
          ? fmtDate(anchor)
          : `Programma · ${formatWeekTitle(anchor)}`

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-4">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-ink-400">Pianificazione · Calendario</div>
            <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-ink-900">Pianificazione Audit</h1>
            <p className="mt-0.5 text-[12.5px] text-ink-500">Vista mensile per cliente, norma e auditor. Clicca un giorno per creare un evento.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Btn variant="secondary" icon={Upload} disabled title="Disponibile dopo la migrazione">
              Importa dati
            </Btn>
            <Btn variant="primary" icon={Plus} onClick={() => openNew()}>
              Nuovo evento
            </Btn>
          </div>
        </div>

        <Card padded={false} className="mb-2.5 overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-ink-100 md:grid-cols-4 md:divide-x md:divide-y-0">
            {[
              { label: 'Eventi del mese', value: kpis.total, hint: `${MONTHS_IT[anchor.getMonth()]} ${anchor.getFullYear()}`, icon: CalendarDays, tone: 'ink' },
              { label: 'Pianificati', value: kpis.planned, hint: '+4 vs Aprile', icon: MapPin, tone: 'brand' },
              { label: 'Effettuati', value: kpis.performed, hint: `${Math.round((kpis.performed / Math.max(kpis.total, 1)) * 100)}% del mese`, icon: CheckCircle2, tone: 'emerald' },
              { label: 'Da riprogrammare', value: kpis.reschedule, hint: 'Richiede azione', icon: AlertTriangle, tone: 'amber' },
            ].map((stat) => {
              const tone = {
                ink: 'bg-ink-100 text-ink-600',
                brand: 'bg-brand-50 text-brand-600',
                emerald: 'bg-emerald-50 text-emerald-600',
                amber: 'bg-amber-50 text-amber-600',
              }[stat.tone]
              const Icon = stat.icon

              return (
                <div key={stat.label} className="flex min-w-0 items-center gap-3 px-4 py-2.5">
                  <span className={cn('inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', tone)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[10.5px] font-medium uppercase tracking-wider text-ink-500">{stat.label}</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[20px] font-semibold leading-none tabular-nums text-ink-900">{stat.value}</span>
                      <span className="truncate text-[11px] text-ink-400">{stat.hint}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="mb-2.5">
          <FilterBar filters={filters} setFilters={setFilters} count={filtered.length} total={events.length} />
        </div>

        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Btn variant="secondary" size="sm" onClick={goToday}>
              Oggi
            </Btn>
            <div className="flex rounded-lg border border-ink-200 bg-white">
              <button onClick={goPrev} className="inline-flex h-8 w-8 items-center justify-center rounded-l-lg text-ink-600 hover:bg-ink-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={goNext} className="inline-flex h-8 w-8 items-center justify-center rounded-r-lg border-l border-ink-200 text-ink-600 hover:bg-ink-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <h3 className="ml-2 text-[18px] font-semibold tracking-tight text-ink-900">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5">
              {['Mese', 'Settimana', 'Giorno', 'Programma'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode.toLowerCase() as CalendarViewMode)}
                  className={cn(
                    'h-7 rounded-md px-3 text-[12.5px] font-medium transition-colors',
                    viewMode === mode.toLowerCase() ? 'bg-ink-800 text-white' : 'text-ink-600 hover:text-ink-800'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
            <Btn variant="ghost" size="sm" icon={Download}>
              Esporta
            </Btn>
          </div>
        </div>

        <CalendarView
          mode={viewMode}
          anchor={anchor}
          filteredEvents={filtered}
          eventsByDay={eventsByDay}
          onPickDate={(date) => openNew(date)}
          onPickEvent={setSelected}
          today={today}
        />

        <div className="mt-4 px-1">
          <StatusLegend />
        </div>
      </div>

      <EventDetailDrawer event={selected} onClose={() => setSelected(null)} onEdit={openEdit} onCancel={cancelEvent} />
      <EventFormDrawer
        open={creating || Boolean(editing)}
        mode={editing ? 'edit' : 'new'}
        initial={editing}
        presetDate={presetDate}
        onClose={() => {
          setCreating(false)
          setEditing(null)
          setPresetDate(null)
        }}
        onSave={saveEvent}
      />
    </>
  )
}

function CalendarView({
  mode,
  anchor,
  filteredEvents,
  eventsByDay,
  onPickDate,
  onPickEvent,
  today,
}: {
  mode: CalendarViewMode
  anchor: Date
  filteredEvents: CalendarEvent[]
  eventsByDay: Record<string, CalendarEvent[]>
  onPickDate: (date: Date) => void
  onPickEvent: (event: CalendarEvent) => void
  today: Date
}) {
  if (mode === 'mese') {
    return <MonthGrid anchor={anchor} eventsByDay={eventsByDay} onPickDate={onPickDate} onPickEvent={onPickEvent} today={today} />
  }

  if (mode === 'settimana') {
    return <WeekView anchor={anchor} eventsByDay={eventsByDay} onPickDate={onPickDate} onPickEvent={onPickEvent} today={today} />
  }

  if (mode === 'giorno') {
    return <DayView anchor={anchor} eventsByDay={eventsByDay} onPickDate={onPickDate} onPickEvent={onPickEvent} today={today} />
  }

  return <ProgramView anchor={anchor} events={filteredEvents} onPickEvent={onPickEvent} />
}

function WeekView({
  anchor,
  eventsByDay,
  onPickDate,
  onPickEvent,
  today,
}: {
  anchor: Date
  eventsByDay: Record<string, CalendarEvent[]>
  onPickDate: (date: Date) => void
  onPickEvent: (event: CalendarEvent) => void
  today: Date
}) {
  const days = weekDays(anchor)
  const todayIso = dayIso(today)

  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
      <div className="grid grid-cols-7 border-b border-ink-100 bg-ink-50">
        {days.map((day) => {
          const iso = dayIso(day)
          return (
            <div key={iso} className="px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{DOW_IT[(day.getDay() + 6) % 7]}</div>
              <div className={cn('mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold', iso === todayIso ? 'bg-brand-600 text-white' : 'text-ink-800')}>
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const iso = dayIso(day)
          const events = eventsByDay[iso] ?? []
          return (
            <div key={iso} className="min-h-[420px] border-r border-ink-100 p-2 last:border-r-0">
              <button onClick={() => onPickDate(day)} className="mb-2 inline-flex h-7 items-center rounded-md px-2 text-[12px] font-medium text-brand-700 hover:bg-brand-50">
                + Nuovo
              </button>
              <div className="space-y-1.5">
                {events.map((event) => (
                  <EventChip key={`${event.id}-${iso}`} event={event} onClick={onPickEvent} />
                ))}
                {events.length === 0 ? <div className="rounded-lg border border-dashed border-ink-200 px-2 py-6 text-center text-[12px] text-ink-400">Nessun audit</div> : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DayView({
  anchor,
  eventsByDay,
  onPickDate,
  onPickEvent,
  today,
}: {
  anchor: Date
  eventsByDay: Record<string, CalendarEvent[]>
  onPickDate: (date: Date) => void
  onPickEvent: (event: CalendarEvent) => void
  today: Date
}) {
  const iso = dayIso(anchor)
  const events = eventsByDay[iso] ?? []
  const isToday = iso === dayIso(today)

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50 px-5 py-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{DOW_IT[(anchor.getDay() + 6) % 7]}</div>
          <div className="mt-0.5 text-[18px] font-semibold text-ink-900">
            {fmtDate(anchor)} {isToday ? <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] text-brand-700 ring-1 ring-brand-100">Oggi</span> : null}
          </div>
        </div>
        <Btn variant="primary" size="sm" icon={Plus} onClick={() => onPickDate(anchor)}>
          Nuovo evento
        </Btn>
      </div>
      <div className="space-y-2 p-4">
        {events.map((event) => (
          <DayEventRow key={event.id} event={event} onPickEvent={onPickEvent} />
        ))}
        {events.length === 0 ? <div className="rounded-lg border border-dashed border-ink-200 px-6 py-14 text-center text-[13px] text-ink-500">Nessun audit pianificato per questo giorno.</div> : null}
      </div>
    </Card>
  )
}

function ProgramView({ anchor, events, onPickEvent }: { anchor: Date; events: CalendarEvent[]; onPickEvent: (event: CalendarEvent) => void }) {
  const [start, end] = weekRange(anchor)
  const programEvents = events
    .filter((event) => {
      const date = new Date(event.start)
      return date >= start && date <= end
    })
    .sort((left, right) => new Date(left.start).getTime() - new Date(right.start).getTime())

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="border-b border-ink-100 bg-ink-50 px-5 py-4">
        <h3 className="text-[14px] font-semibold text-ink-800">Programma settimanale</h3>
        <p className="mt-0.5 text-[12px] text-ink-500">
          Dal {fmtDate(start)} al {fmtDate(end)}
        </p>
      </div>
      <div className="divide-y divide-ink-100">
        {programEvents.map((event) => (
          <DayEventRow key={event.id} event={event} onPickEvent={onPickEvent} />
        ))}
        {programEvents.length === 0 ? <div className="px-6 py-12 text-center text-[13px] text-ink-500">Nessun audit nel programma selezionato.</div> : null}
      </div>
    </Card>
  )
}

function DayEventRow({ event, onPickEvent }: { event: CalendarEvent; onPickEvent: (event: CalendarEvent) => void }) {
  const client = clientOf(event)
  const standards = standardsOf(event).map((standard) => standard.code).join(' + ')
  const auditors = auditorsOf(event).map((auditor) => auditor.name).join(', ')
  const start = new Date(event.start)
  const end = new Date(event.end)

  return (
    <button onClick={() => onPickEvent(event)} className="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-brand-50/30">
      <div className="w-20 shrink-0 text-[12px] font-medium tabular-nums text-ink-600">
        {fmtTime(start)} - {fmtTime(end)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-ink-800">{client?.name ?? 'Senza azienda'}</span>
          <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[11px] text-indigo-800 ring-1 ring-indigo-100">{standards || '—'}</span>
        </div>
        <div className="mt-0.5 text-[12px] text-ink-500">
          {event.auditType} · {event.auditNumber} · {auditors || 'Auditor non assegnato'}
        </div>
      </div>
      <div className="shrink-0">
        <Pill status={event.status} size="sm" />
      </div>
    </button>
  )
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(date.getDate() + amount)
  return next
}

function dayIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function weekRange(date: Date) {
  const start = addDays(date, -((date.getDay() + 6) % 7))
  start.setHours(0, 0, 0, 0)
  const end = addDays(start, 6)
  end.setHours(23, 59, 59, 999)
  return [start, end] as const
}

function weekDays(date: Date) {
  const [start] = weekRange(date)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

function formatWeekTitle(date: Date) {
  const [start, end] = weekRange(date)
  return `${fmtDate(start)} - ${fmtDate(end)}`
}
