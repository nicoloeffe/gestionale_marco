'use client'

import { Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { DOW_IT, MONTHS_IT } from '../date-utils'
import { type CalendarEvent } from './data'
import { EventChip } from './event-chip'

type DayCell = {
  date: Date
  inMonth: boolean
  iso: string
}

function dayIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function monthGrid(anchor: Date): DayCell[] {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const first = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - startDow)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)

    return {
      date,
      inMonth: date.getMonth() === month,
      iso: dayIso(date),
    }
  })
}

export function groupByDay(events: CalendarEvent[]) {
  const map: Record<string, CalendarEvent[]> = {}

  events.forEach((event) => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const current = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())

    while (current <= last) {
      const iso = dayIso(current)
      map[iso] = map[iso] ?? []
      map[iso].push(event)
      current.setDate(current.getDate() + 1)
    }
  })

  return map
}

export function MonthGrid({
  anchor,
  eventsByDay,
  onPickDate,
  onPickEvent,
  today,
  canCreate = true,
}: {
  anchor: Date
  eventsByDay: Record<string, CalendarEvent[]>
  onPickDate: (date: Date) => void
  onPickEvent: (event: CalendarEvent) => void
  today: Date
  canCreate?: boolean
}) {
  const cells = useMemo(() => monthGrid(anchor), [anchor])
  const todayIso = dayIso(today)
  const [expanded, setExpanded] = useState<{ iso: string; cell: DayCell; rect: DOMRect } | null>(null)

  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
      <div className="grid grid-cols-7 border-b border-ink-100 bg-ink-50">
        {DOW_IT.map((day) => (
          <div key={day} className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, index) => {
          const events = eventsByDay[cell.iso] ?? []
          const visible = events.slice(0, 3)
          const hidden = events.length - visible.length
          const isToday = cell.iso === todayIso
          const isWeekend = index % 7 >= 5

          return (
            <div
              key={`${cell.iso}-${index}`}
              data-day-cell=""
              className={cn(
                'group relative min-h-[112px] border-b border-r border-ink-100 px-1.5 py-1.5',
                !cell.inMonth && 'bg-ink-50/40',
                isWeekend && cell.inMonth && 'bg-[#fafbfd]',
                (index + 1) % 7 === 0 && 'border-r-0'
              )}
            >
              <div className="mb-1 flex items-center justify-between px-1">
                <span
                  className={cn(
                    'tabular-nums text-[11.5px]',
                    cell.inMonth ? 'text-ink-700' : 'text-ink-300',
                    isToday && 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 font-semibold text-white'
                  )}
                >
                  {cell.date.getDate()}
                </span>
                {cell.inMonth && canCreate ? (
                  <button
                    onClick={() => onPickDate(cell.date)}
                    className="inline-flex h-5 w-5 items-center justify-center rounded text-ink-500 opacity-0 hover:bg-ink-100 group-hover:opacity-100"
                    title="Nuovo evento in questa data"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <div className="space-y-1 px-0.5">
                {visible.map((event) => (
                  <EventChip key={`${event.id}-${cell.iso}`} event={event} onClick={onPickEvent} compact={events.length > 2} />
                ))}
                {hidden > 0 ? (
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      const rect = event.currentTarget.closest('[data-day-cell]')?.getBoundingClientRect()
                      if (rect) setExpanded({ iso: cell.iso, cell, rect })
                    }}
                    title={`Mostra tutti i ${events.length} audit del giorno`}
                    className="inline-flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-brand-700 hover:bg-brand-50 hover:text-brand-800 hover:ring-1 hover:ring-brand-100"
                  >
                    +{hidden} altri
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {expanded ? (
        <DayPopover
          cell={expanded.cell}
          events={eventsByDay[expanded.iso] ?? []}
          anchorRect={expanded.rect}
          onClose={() => setExpanded(null)}
          onPickEvent={onPickEvent}
        />
      ) : null}
    </div>
  )
}

function DayPopover({
  cell,
  events,
  onPickEvent,
  onClose,
  anchorRect,
}: {
  cell: DayCell
  events: CalendarEvent[]
  onPickEvent: (event: CalendarEvent) => void
  onClose: () => void
  anchorRect: DOMRect
}) {
  const position = useMemo(() => {
    const width = 280
    const left = Math.max(8, Math.min(anchorRect.left + anchorRect.width / 2 - width / 2, window.innerWidth - width - 8))
    const top = anchorRect.top + 4

    return { left, top, width }
  }, [anchorRect])

  return createPortal(
    <div className="fixed z-50 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-ink-200" style={position}>
      <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/60 px-3 py-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{DOW_IT[(cell.date.getDay() + 6) % 7]}</span>
          <span className="text-[15px] font-semibold tabular-nums text-ink-900">{cell.date.getDate()}</span>
          <span className="text-[12px] text-ink-500">{MONTHS_IT[cell.date.getMonth()]}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-ink-500">{events.length} audit</span>
          <button onClick={onClose} className="inline-flex h-6 w-6 items-center justify-center rounded text-ink-500 hover:bg-ink-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="max-h-[280px] space-y-1 overflow-auto p-2">
        {events.map((event) => (
          <EventChip
            key={event.id}
            event={event}
            onClick={(picked) => {
              onClose()
              onPickEvent(picked)
            }}
          />
        ))}
      </div>
    </div>,
    document.body
  )
}
