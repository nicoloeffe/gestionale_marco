'use client'

import { cn } from '@/lib/utils'
import { STATUSES } from '../status'
import { type CalendarEvent, auditorsOf, clientOf, standardsOf } from './data'

export function EventChip({
  event,
  onClick,
  compact,
}: {
  event: CalendarEvent
  onClick: (event: CalendarEvent) => void
  compact?: boolean
}) {
  const status = STATUSES[event.status]
  const client = clientOf(event)
  const standards = standardsOf(event).map((standard) => standard.code).join('+')
  const auditor = auditorsOf(event)[0]

  return (
    <button
      onClick={() => onClick(event)}
      className={cn(
        'ev w-full truncate rounded-md border-l-2 px-1.5 py-1 text-left ring-1 ring-transparent transition hover:-translate-y-px hover:shadow-sm',
        status.barBg,
        status.barText,
        status.barBorder
      )}
      title={`${client?.name ?? 'Senza azienda'} · ${standards || '—'} · ${auditor?.name ?? '—'}`}
    >
      <div className="flex items-center gap-1">
        <span className="truncate font-semibold">{client ? client.name : 'Senza azienda'}</span>
      </div>
      {!compact ? (
        <div className="mt-0.5 flex items-center justify-between gap-1 opacity-90">
          <span className="truncate font-mono text-[10px]">{standards || '—'}</span>
          <span className="truncate text-[10.5px]">{auditor ? auditor.initials : '—'}</span>
        </div>
      ) : null}
    </button>
  )
}
