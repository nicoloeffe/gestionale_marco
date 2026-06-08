'use client'

import { AlertTriangle, CheckCircle2, Download, List, MapPin, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from './page-header'
import { EventDetailDrawer } from './event-detail-drawer'
import { EventFormDrawer } from './event-form-drawer'
import { Btn, KpiCard } from './ui'
import { INITIAL_EVENTS, type CalendarEvent, auditorsOf, clientOf, standardsOf } from './calendar/data'
import { AuditTable, type SortState } from './list/audit-table'
import { initialListFilters, ListFiltersPanel, type ListFilters, type ListPeriod } from './list/list-filters'

function applyFilters(events: CalendarEvent[], filters: ListFilters, period: ListPeriod) {
  const today = new Date(2026, 4, 8)

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

    if (period !== 'all') {
      const date = new Date(event.start)
      if (period === 'week') {
        const diffDays = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays < -3 || diffDays > 7) return false
      }
      if (period === 'month' && (date.getMonth() !== today.getMonth() || date.getFullYear() !== today.getFullYear())) return false
      if (period === 'past' && date >= today) return false
      if (period === 'future' && date < today) return false
    }

    return true
  })
}

function sortEvents(events: CalendarEvent[], sort: SortState) {
  return [...events].sort((left, right) => {
    const leftValue = String(left[sort.key] ?? '')
    const rightValue = String(right[sort.key] ?? '')
    const comparison = leftValue > rightValue ? 1 : leftValue < rightValue ? -1 : 0
    return sort.dir === 'asc' ? comparison : -comparison
  })
}

export function ListScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS)
  const [filters, setFilters] = useState<ListFilters>(initialListFilters)
  const [period, setPeriod] = useState<ListPeriod>('all')
  const [sort, setSort] = useState<SortState>({ key: 'start', dir: 'asc' })
  const [selected, setSelected] = useState<CalendarEvent | null>(null)
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => sortEvents(applyFilters(events, filters, period), sort), [events, filters, period, sort])
  const stats = {
    total: filtered.length,
    planned: filtered.filter((event) => ['pianificato', 'confermato'].includes(event.status)).length,
    performed: filtered.filter((event) => event.performed).length,
    reschedule: filtered.filter((event) => event.status === 'da_riprogrammare').length,
  }

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
    setEditing(null)
    setCreating(false)
  }

  const cancelEvent = (event: CalendarEvent) => {
    setEvents((current) => current.map((item) => (item.id === event.id ? { ...item, status: 'annullato', performed: false } : item)))
    setSelected(null)
  }

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-6">
        <PageHeader
          breadcrumb="Pianificazione · Audit / Eventi"
          title="Eventi audit"
          desc="Tutti gli eventi audit con filtri avanzati per periodo, auditor, azienda, norma e stato. Apri un evento per vederne il dettaglio o modificarlo."
          secondary={
            <Btn variant="secondary" icon={Download}>
              Esporta CSV
            </Btn>
          }
          primary={
            <Btn variant="primary" icon={Plus} onClick={() => setCreating(true)}>
              Nuovo evento
            </Btn>
          }
        />

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Risultati filtro" value={stats.total} hint={`su ${events.length} totali`} icon={List} />
          <KpiCard label="Pianificati" value={stats.planned} icon={MapPin} accent="bg-brand-50 text-brand-600" />
          <KpiCard label="Effettuati" value={stats.performed} icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" />
          <KpiCard label="Da riprogrammare" value={stats.reschedule} icon={AlertTriangle} accent="bg-amber-50 text-amber-600" />
        </div>

        <div className="space-y-0">
          <ListFiltersPanel filters={filters} setFilters={setFilters} period={period} setPeriod={setPeriod} />
          <AuditTable
            events={filtered}
            total={events.length}
            sort={sort}
            setSort={setSort}
            onPickEvent={setSelected}
            onEdit={openEdit}
            onCancel={cancelEvent}
          />
        </div>
      </div>

      <EventDetailDrawer event={selected} onClose={() => setSelected(null)} onEdit={openEdit} onCancel={cancelEvent} />
      <EventFormDrawer
        open={creating || Boolean(editing)}
        mode={editing ? 'edit' : 'new'}
        initial={editing}
        presetDate={null}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSave={saveEvent}
      />
    </>
  )
}
