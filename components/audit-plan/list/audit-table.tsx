'use client'

import { AlertTriangle, ChevronDown, Edit, FileText, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fmtDate, fmtTime } from '../date-utils'
import { Avatar, Btn, Card, Pill } from '../ui'
import { type CalendarEvent, auditorsOf, clientOf, standardsOf } from '../calendar/data'

export type SortState = {
  key: keyof CalendarEvent
  dir: 'asc' | 'desc'
}

export function AuditTable({
  events,
  total,
  sort,
  setSort,
  onPickEvent,
  onEdit,
  onCancel,
}: {
  events: CalendarEvent[]
  total: number
  sort: SortState
  setSort: React.Dispatch<React.SetStateAction<SortState>>
  onPickEvent: (event: CalendarEvent) => void
  onEdit: (event: CalendarEvent) => void
  onCancel: (event: CalendarEvent) => void
}) {
  const SortHeader = ({ sortKey, label }: { sortKey: keyof CalendarEvent; label: string }) => (
    <button
      onClick={() => setSort((current) => ({ key: sortKey, dir: current.key === sortKey && current.dir === 'asc' ? 'desc' : 'asc' }))}
      className="group inline-flex items-center gap-1 hover:text-ink-800"
    >
      {label}
      <ChevronDown className={cn('h-3 w-3 text-ink-300', sort.key === sortKey && 'text-ink-600', sort.key === sortKey && sort.dir === 'desc' && 'rotate-180')} />
    </button>
  )

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200 bg-white text-left text-[11.5px] font-semibold uppercase tracking-wider text-ink-500">
              <th className="w-8 px-3 py-2.5">
                <input type="checkbox" className="rounded border-ink-300" />
              </th>
              <th className="px-3 py-2.5">
                <SortHeader sortKey="start" label="Data inizio" />
              </th>
              <th className="px-3 py-2.5">
                <SortHeader sortKey="end" label="Data fine" />
              </th>
              <th className="px-3 py-2.5">
                <SortHeader sortKey="clientId" label="Azienda" />
              </th>
              <th className="px-3 py-2.5">Auditor</th>
              <th className="px-3 py-2.5">Norma</th>
              <th className="px-3 py-2.5">N. audit</th>
              <th className="px-3 py-2.5">Tipo</th>
              <th className="px-3 py-2.5">
                <SortHeader sortKey="status" label="Stato" />
              </th>
              <th className="px-3 py-2.5">Eff.</th>
              <th className="w-20 px-3 py-2.5 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {events.map((event) => {
              const client = clientOf(event)
              const auditors = auditorsOf(event)
              const standards = standardsOf(event)
              const start = new Date(event.start)
              const end = new Date(event.end)

              return (
                <tr key={event.id} className="group hover:bg-brand-50/30">
                  <td className="px-3 py-2.5">
                    <input type="checkbox" className="rounded border-ink-300" />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <div className="font-medium tabular-nums text-ink-800">{fmtDate(start)}</div>
                    <div className="text-[11.5px] tabular-nums text-ink-500">{fmtTime(start)}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <div className="tabular-nums text-ink-700">{fmtDate(end)}</div>
                    <div className="text-[11.5px] tabular-nums text-ink-500">{fmtTime(end)}</div>
                  </td>
                  <td className="max-w-[260px] px-3 py-2.5">
                    {client ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gradient-to-br from-brand-100 to-brand-300 text-[10px] font-semibold text-brand-800">
                          {client.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-ink-800">{client.name}</div>
                          <div className="text-[11.5px] text-ink-500">{client.entity}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="italic text-ink-400">— Senza azienda</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {auditors.length ? (
                      <div className="flex items-center -space-x-1.5">
                        {auditors.slice(0, 3).map((auditor) => (
                          <Avatar key={auditor.id} name={auditor.name} initials={auditor.initials} size="sm" />
                        ))}
                        {auditors.length > 3 ? <span className="ml-2 text-[11.5px] text-ink-500">+{auditors.length - 3}</span> : null}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5" /> non assegnato
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {standards.slice(0, 2).map((standard) => (
                        <span key={standard.id} className="inline-flex h-5 items-center rounded bg-indigo-50 px-1.5 font-mono text-[11px] text-indigo-800 ring-1 ring-indigo-100">
                          {standard.code}
                        </span>
                      ))}
                      {standards.length > 2 ? <span className="text-[11.5px] text-ink-500">+{standards.length - 2}</span> : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[12px] text-ink-700">{event.auditNumber}</td>
                  <td className="px-3 py-2.5 text-ink-700">{event.auditType}</td>
                  <td className="px-3 py-2.5">
                    <Pill status={event.status} size="sm" />
                  </td>
                  <td className="px-3 py-2.5">
                    {event.performed ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Si
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] text-ink-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-ink-300" /> No
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="inline-flex items-center gap-0.5 opacity-60 group-hover:opacity-100">
                      <button onClick={() => onPickEvent(event)} title="Apri" className="inline-flex h-7 w-7 items-center justify-center rounded text-ink-500 hover:bg-ink-100">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button onClick={() => onEdit(event)} title="Modifica" className="inline-flex h-7 w-7 items-center justify-center rounded text-ink-500 hover:bg-ink-100">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onCancel(event)} title="Annulla / Elimina" className="inline-flex h-7 w-7 items-center justify-center rounded text-ink-500 hover:bg-rose-50 hover:text-rose-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {events.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-ink-500">
                  <div className="inline-flex flex-col items-center gap-2">
                    <Search className="h-6 w-6 text-ink-300" />
                    <div className="text-[13.5px] font-medium text-ink-700">Nessun evento corrisponde ai filtri</div>
                    <div className="text-[12.5px]">Prova a modificare i criteri o azzera i filtri.</div>
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 px-3 py-2.5 text-[12.5px] text-ink-500">
        <div>
          Mostrati <b className="text-ink-700">{events.length}</b> di {total} eventi
        </div>
        <div className="flex items-center gap-1">
          <button className="h-7 rounded px-2.5 text-ink-500 hover:bg-ink-100">‹ Precedente</button>
          <span className="inline-flex h-7 items-center rounded bg-ink-100 px-2.5 font-medium text-ink-700">1</span>
          <span className="inline-flex h-7 cursor-pointer items-center rounded px-2.5 text-ink-500 hover:bg-ink-100">2</span>
          <span className="inline-flex h-7 cursor-pointer items-center rounded px-2.5 text-ink-500 hover:bg-ink-100">3</span>
          <button className="h-7 rounded px-2.5 text-ink-500 hover:bg-ink-100">Successivo ›</button>
        </div>
      </div>
    </Card>
  )
}
