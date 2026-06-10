'use client'

import { Edit, Trash2, X } from 'lucide-react'
import { fmtDate, fmtTime } from './date-utils'
import { type CalendarEvent, auditorsOf, clientOf, standardsOf } from './calendar/data'
import { EventAttachmentsPanel } from './event-attachments-panel'
import { Avatar, Btn, Pill } from './ui'

function Drawer({
  open,
  onClose,
  width = 520,
  children,
  title,
  sub,
  badge,
  footer,
}: {
  open: boolean
  onClose: () => void
  width?: number
  children: React.ReactNode
  title: string
  sub?: string
  badge?: React.ReactNode
  footer?: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-900/30 fade-in" onClick={onClose} />
      <aside data-testid="event-detail-drawer" className="absolute right-0 top-0 flex h-full flex-col bg-white shadow-drawer slide-in" style={{ width }}>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-100 px-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[14.5px] font-semibold text-ink-900">{title}</h3>
              {badge}
            </div>
            {sub ? <div className="truncate text-[12px] text-ink-500">{sub}</div> : null}
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer ? <footer className="flex h-14 shrink-0 items-center justify-end gap-2 border-t border-ink-100 bg-white px-5">{footer}</footer> : null}
      </aside>
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-ink-100 py-2.5 last:border-b-0">
      <div className="text-[12.5px] text-ink-500">{label}</div>
      <div className="text-[13.5px] text-ink-800">{children}</div>
    </div>
  )
}

export function EventDetailDrawer({
  event,
  onClose,
  onEdit,
  onCancel,
  canMutate = true,
}: {
  event: CalendarEvent | null
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
  onCancel: (event: CalendarEvent) => void
  canMutate?: boolean
}) {
  if (!event) return null

  const client = clientOf(event)
  const auditors = auditorsOf(event)
  const standards = standardsOf(event)
  const start = new Date(event.start)
  const end = new Date(event.end)
  const sameDay = start.toDateString() === end.toDateString()

  return (
    <Drawer
      open={Boolean(event)}
      onClose={onClose}
      width={520}
      title={client ? client.name : 'Evento senza azienda'}
      sub={`${event.auditType} · ${standards.map((standard) => standard.code).join(' + ') || 'Norma non assegnata'}`}
      badge={<Pill status={event.status} size="sm" />}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>
            Chiudi
          </Btn>
          {canMutate ? (
            <>
              <Btn variant="danger_g" icon={Trash2} onClick={() => onCancel(event)}>
                Annulla
              </Btn>
              <Btn variant="primary" icon={Edit} onClick={() => onEdit(event)}>
                Modifica
              </Btn>
            </>
          ) : null}
        </>
      }
    >
      <div className="px-5 pb-2 pt-4">
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-ink-50 p-3">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-500">Data</div>
            <div className="mt-1 text-[13px] font-medium text-ink-800">{fmtDate(start)}</div>
            <div className="text-[11.5px] text-ink-500">{sameDay ? `${fmtTime(start)} - ${fmtTime(end)}` : `→ ${fmtDate(end)}`}</div>
          </div>
          <div className="rounded-lg bg-ink-50 p-3">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-500">Numero audit</div>
            <div className="mt-1 truncate font-mono text-[13px] font-medium text-ink-800">{event.auditNumber}</div>
            <div className="text-[11.5px] text-ink-500">{event.auditType}</div>
          </div>
          <div className="rounded-lg bg-ink-50 p-3">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-500">Effettuato</div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium">
              {event.performed ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Si
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-ink-300" />
                  Non ancora
                </>
              )}
            </div>
            <div className="text-[11.5px] text-ink-500">{event.performed ? 'Verbale ricevuto' : 'In sospeso'}</div>
          </div>
        </div>

        <h4 className="mb-1.5 mt-2 text-[12px] font-semibold uppercase tracking-wider text-ink-500">Dettagli</h4>
        <div className="rounded-lg border border-ink-100 px-3.5">
          <DetailRow label="Azienda / Cliente">
            {client ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-brand-100 to-brand-300 text-[10px] font-semibold text-brand-800">
                  {client.name.slice(0, 2).toUpperCase()}
                </span>
                <span>{client.name}</span>
                <span className="ml-1 text-[11px] text-ink-400">· {client.entity}</span>
              </div>
            ) : (
              <span className="italic text-ink-400">Non assegnata</span>
            )}
          </DetailRow>
          <DetailRow label="Auditor">
            {auditors.length ? (
              <div className="flex flex-wrap gap-2">
                {auditors.map((auditor) => (
                  <span key={auditor.id} className="inline-flex items-center gap-2 rounded-full bg-ink-50 py-1 pl-1 pr-2.5 ring-1 ring-ink-100">
                    <Avatar name={auditor.name} initials={auditor.initials} size="sm" />
                    <span className="text-[12.5px] text-ink-800">{auditor.name}</span>
                    <span className="text-[11px] text-ink-400">· {auditor.role}</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-amber-700">Auditor non assegnato</span>
            )}
          </DetailRow>
          <DetailRow label="Norma / Standard">
            <div className="flex flex-wrap gap-1.5">
              {standards.map((standard) => (
                <span key={standard.id} className="inline-flex h-6 items-center rounded bg-indigo-50 px-2 font-mono text-[11.5px] text-indigo-800 ring-1 ring-indigo-100">
                  {standard.code}
                </span>
              ))}
            </div>
          </DetailRow>
          <DetailRow label="Data inizio">{fmtDate(start)} · {fmtTime(start)}</DetailRow>
          <DetailRow label="Data fine">{fmtDate(end)} · {fmtTime(end)}</DetailRow>
          <DetailRow label="Stato">
            <Pill status={event.status} size="sm" />
          </DetailRow>
          <DetailRow label="Numero audit">
            <span className="font-mono">{event.auditNumber}</span>
          </DetailRow>
          <DetailRow label="Tipo audit">{event.auditType}</DetailRow>
        </div>

        <h4 className="mb-1.5 mt-5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">Note</h4>
        <div className="min-h-16 rounded-lg border border-ink-100 bg-ink-50/40 p-3.5 text-[13px] text-ink-700">
          {event.notes ? event.notes : <span className="italic text-ink-400">Nessuna nota.</span>}
        </div>

        <div className="mt-5">
          <EventAttachmentsPanel eventId={event.id} canMutate={canMutate} />
        </div>
      </div>
    </Drawer>
  )
}
