import { STATUSES } from './status'

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="text-[12px] font-medium text-ink-500">Legenda stati:</span>
      {Object.values(STATUSES).map((status) => (
        <span key={status.id} className="inline-flex items-center gap-1.5 text-[12px] text-ink-700">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: status.dot }} />
          {status.label}
        </span>
      ))}
    </div>
  )
}
