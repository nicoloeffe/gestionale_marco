'use client'

import { Columns3, Search, SlidersHorizontal } from 'lucide-react'
import { AUDITORS, CLIENTS, STANDARDS } from '../calendar/data'
import { STATUSES } from '../status'
import { Btn, Card, Input, Select } from '../ui'
import { cn } from '@/lib/utils'

export type ListPeriod = 'all' | 'past' | 'week' | 'month' | 'future'

export type ListFilters = {
  q: string
  auditor: string
  client: string
  standard: string
  status: string
  performed: string
}

export const initialListFilters: ListFilters = {
  q: '',
  auditor: 'all',
  client: 'all',
  standard: 'all',
  status: 'all',
  performed: 'all',
}

const periods: { value: ListPeriod; label: string }[] = [
  { value: 'all', label: 'Tutti' },
  { value: 'past', label: 'Passati' },
  { value: 'week', label: 'Settimana' },
  { value: 'month', label: 'Mese' },
  { value: 'future', label: 'Futuri' },
]

export function ListFiltersPanel({
  filters,
  setFilters,
  period,
  setPeriod,
}: {
  filters: ListFilters
  setFilters: React.Dispatch<React.SetStateAction<ListFilters>>
  period: ListPeriod
  setPeriod: (period: ListPeriod) => void
}) {
  const setFilter = (key: keyof ListFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }))
  const hasFilters = Object.values(filters).some((value) => value && value !== 'all') || period !== 'all'

  return (
    <Card padded={false} className="overflow-visible">
      <div className="flex items-center gap-2 border-b border-ink-100 p-3">
        <Input
          icon={Search}
          placeholder="Cerca per azienda, auditor, n. audit, norma..."
          className="w-[340px]"
          value={filters.q}
          onChange={(event) => setFilter('q', event.target.value)}
        />
        <div className="mx-1 h-6 w-px bg-ink-200" />
        <div className="inline-flex rounded-lg bg-ink-100 p-0.5">
          {periods.map((item) => (
            <button
              key={item.value}
              onClick={() => setPeriod(item.value)}
              className={cn(
                'h-7 rounded-md px-3 text-[12.5px] font-medium',
                period === item.value ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-600 hover:text-ink-800'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Btn variant="ghost" size="sm" icon={Columns3}>
            Colonne
          </Btn>
          <Btn variant="ghost" size="sm" icon={SlidersHorizontal}>
            Ordinamento
          </Btn>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 bg-ink-50/40 p-3">
        <Select value={filters.auditor} onChange={(event) => setFilter('auditor', event.target.value)} className="w-[180px]">
          <option value="all">Tutti gli auditor</option>
          {AUDITORS.map((auditor) => (
            <option key={auditor.id} value={auditor.id}>
              {auditor.name}
            </option>
          ))}
        </Select>
        <Select value={filters.client} onChange={(event) => setFilter('client', event.target.value)} className="w-[220px]">
          <option value="all">Tutte le aziende</option>
          {CLIENTS.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
        <Select value={filters.standard} onChange={(event) => setFilter('standard', event.target.value)} className="w-[170px]">
          <option value="all">Tutte le norme</option>
          {STANDARDS.map((standard) => (
            <option key={standard.id} value={standard.id}>
              {standard.code}
            </option>
          ))}
        </Select>
        <Select value={filters.status} onChange={(event) => setFilter('status', event.target.value)} className="w-[170px]">
          <option value="all">Qualsiasi stato</option>
          {Object.values(STATUSES).map((status) => (
            <option key={status.id} value={status.id}>
              {status.label}
            </option>
          ))}
        </Select>
        <Select value={filters.performed} onChange={(event) => setFilter('performed', event.target.value)} className="w-[160px]">
          <option value="all">Effettuato (tutti)</option>
          <option value="si">Solo effettuati</option>
          <option value="no">Non effettuati</option>
        </Select>
        {hasFilters ? (
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters(initialListFilters)
              setPeriod('all')
            }}
          >
            Pulisci filtri
          </Btn>
        ) : null}
      </div>
    </Card>
  )
}
