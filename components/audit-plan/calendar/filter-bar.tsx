'use client'

import { Search } from 'lucide-react'
import { Btn, Card, Input, Select } from '../ui'
import { STATUSES } from '../status'
import { AUDITORS, CLIENTS, STANDARDS } from './data'

export type CalendarFilters = {
  q: string
  auditor: string
  client: string
  standard: string
  status: string
  performed: string
}

export const initialCalendarFilters: CalendarFilters = {
  q: '',
  auditor: 'all',
  client: 'all',
  standard: 'all',
  status: 'all',
  performed: 'all',
}

export function FilterBar({
  filters,
  setFilters,
  count,
  total,
}: {
  filters: CalendarFilters
  setFilters: React.Dispatch<React.SetStateAction<CalendarFilters>>
  count: number
  total: number
}) {
  const setFilter = (key: keyof CalendarFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }))
  const active = Object.entries(filters).filter(([key, value]) => value && value !== 'all' && (key !== 'q' || value))

  return (
    <Card padded={false} className="overflow-visible">
      <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-2">
        <Input
          icon={Search}
          placeholder="Cerca evento, azienda, auditor, n. audit..."
          className="h-8 w-[260px] text-[12.5px]"
          value={filters.q}
          onChange={(event) => setFilter('q', event.target.value)}
        />
        <div className="mx-0.5 h-5 w-px bg-ink-200" />
        <Select value={filters.auditor} onChange={(event) => setFilter('auditor', event.target.value)} className="h-8 w-[150px] text-[12.5px]">
          <option value="all">Tutti gli auditor</option>
          {AUDITORS.map((auditor) => (
            <option key={auditor.id} value={auditor.id}>
              {auditor.name}
            </option>
          ))}
        </Select>
        <Select value={filters.client} onChange={(event) => setFilter('client', event.target.value)} className="h-8 w-[180px] text-[12.5px]">
          <option value="all">Tutte le aziende</option>
          {CLIENTS.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
        <Select value={filters.standard} onChange={(event) => setFilter('standard', event.target.value)} className="h-8 w-[140px] text-[12.5px]">
          <option value="all">Tutte le norme</option>
          {STANDARDS.map((standard) => (
            <option key={standard.id} value={standard.id}>
              {standard.code}
            </option>
          ))}
        </Select>
        <Select value={filters.status} onChange={(event) => setFilter('status', event.target.value)} className="h-8 w-[150px] text-[12.5px]">
          <option value="all">Qualsiasi stato</option>
          {Object.values(STATUSES).map((status) => (
            <option key={status.id} value={status.id}>
              {status.label}
            </option>
          ))}
        </Select>
        <Select value={filters.performed} onChange={(event) => setFilter('performed', event.target.value)} className="h-8 w-[140px] text-[12.5px]">
          <option value="all">Effettuato (tutti)</option>
          <option value="si">Solo effettuati</option>
          <option value="no">Non effettuati</option>
        </Select>
        <div className="ml-auto flex items-center gap-2 pr-1">
          <span className="text-[11.5px] text-ink-500">
            <b className="tabular-nums text-ink-700">{count}</b>/{total} eventi
          </span>
          {active.length > 0 ? (
            <Btn variant="ghost" size="sm" onClick={() => setFilters(initialCalendarFilters)}>
              Pulisci
            </Btn>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
