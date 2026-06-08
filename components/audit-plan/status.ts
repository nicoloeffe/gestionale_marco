export type EventStatus =
  | 'bozza'
  | 'pianificato'
  | 'confermato'
  | 'effettuato'
  | 'annullato'
  | 'da_riprogrammare'

export const STATUSES: Record<
  EventStatus,
  {
    id: EventStatus
    label: string
    dot: string
    bg: string
    text: string
    ring: string
    barBg: string
    barText: string
    barBorder: string
  }
> = {
  bozza: {
    id: 'bozza',
    label: 'Bozza',
    dot: '#94a3b8',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    ring: 'ring-slate-200',
    barBg: 'bg-slate-200',
    barText: 'text-slate-700',
    barBorder: 'border-slate-300',
  },
  pianificato: {
    id: 'pianificato',
    label: 'Pianificato',
    dot: '#3b66ee',
    bg: 'bg-brand-50',
    text: 'text-brand-700',
    ring: 'ring-brand-100',
    barBg: 'bg-brand-100',
    barText: 'text-brand-800',
    barBorder: 'border-brand-200',
  },
  confermato: {
    id: 'confermato',
    label: 'Confermato',
    dot: '#1f3585',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    ring: 'ring-indigo-100',
    barBg: 'bg-indigo-100',
    barText: 'text-indigo-800',
    barBorder: 'border-indigo-200',
  },
  effettuato: {
    id: 'effettuato',
    label: 'Effettuato',
    dot: '#16a34a',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-100',
    barBg: 'bg-emerald-100',
    barText: 'text-emerald-800',
    barBorder: 'border-emerald-200',
  },
  annullato: {
    id: 'annullato',
    label: 'Annullato',
    dot: '#e11d48',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    ring: 'ring-rose-100',
    barBg: 'bg-rose-100',
    barText: 'text-rose-800',
    barBorder: 'border-rose-200',
  },
  da_riprogrammare: {
    id: 'da_riprogrammare',
    label: 'Da riprogrammare',
    dot: '#d97706',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    ring: 'ring-amber-200',
    barBg: 'bg-amber-100',
    barText: 'text-amber-900',
    barBorder: 'border-amber-200',
  },
}
