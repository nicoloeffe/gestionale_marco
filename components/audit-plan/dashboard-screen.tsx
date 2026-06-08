'use client'

import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  List,
  MapPin,
  Plus,
  Upload,
} from 'lucide-react'
import { DOW_IT, MONTHS_IT_SHORT } from './date-utils'
import { PageHeader } from './page-header'
import { type EventStatus } from './status'
import { Avatar, Btn, Card, KpiCard, Notice, Pill, SectionTitle } from './ui'

type DashboardEvent = {
  id: string
  date: Date
  company: string
  standards: string[]
  auditors: string[]
  initials: string[]
  auditNumber: string
  type: string
  status: EventStatus
  performed: boolean
}

const upcomingEvents: DashboardEvent[] = [
  {
    id: 'e01',
    date: new Date(2026, 4, 11, 9),
    company: 'Kappa Solutions S.r.l.',
    standards: ['ISO 9001', 'ISO 27001'],
    auditors: ['Auditor Demo 1'],
    initials: ['A1'],
    auditNumber: 'AU-2026-022',
    type: 'Rinnovo',
    status: 'effettuato',
    performed: true,
  },
  {
    id: 'e02',
    date: new Date(2026, 4, 15, 9),
    company: 'Senza azienda',
    standards: ['ISO 27001'],
    auditors: ['Mario Rossi', 'Laura Bianchi', 'Auditor Demo 1'],
    initials: ['MR', 'LB', 'A1'],
    auditNumber: 'AU-2026-025',
    type: 'Stage 1',
    status: 'da_riprogrammare',
    performed: false,
  },
  {
    id: 'e03',
    date: new Date(2026, 4, 18, 9),
    company: 'Pi Holding S.p.A.',
    standards: ['ISO 45001'],
    auditors: ['Auditor Demo 6'],
    initials: ['A6'],
    auditNumber: 'AU-2026-026',
    type: 'Stage 2',
    status: 'pianificato',
    performed: false,
  },
  {
    id: 'e04',
    date: new Date(2026, 4, 22, 14),
    company: 'Beta Consulting S.r.l.',
    standards: ['ISO 27001'],
    auditors: ['Laura Bianchi'],
    initials: ['LB'],
    auditNumber: 'AU-2026-040',
    type: 'Stage 1',
    status: 'pianificato',
    performed: false,
  },
  {
    id: 'e05',
    date: new Date(2026, 4, 26, 9),
    company: 'Delta Ambiente S.r.l.',
    standards: ['ISO 9001'],
    auditors: ['Laura Bianchi'],
    initials: ['LB'],
    auditNumber: 'AU-2026-036',
    type: 'Sorveglianza',
    status: 'confermato',
    performed: false,
  },
  {
    id: 'e06',
    date: new Date(2026, 4, 29, 9),
    company: 'Zeta Logistica S.r.l.',
    standards: ['ISO 14001'],
    auditors: ['Auditor Demo 5'],
    initials: ['A5'],
    auditNumber: 'AU-2026-038',
    type: 'Sorveglianza',
    status: 'annullato',
    performed: false,
  },
]

const workload = [
  { name: 'Mario Rossi', initials: 'MR', hours: 42 },
  { name: 'Laura Bianchi', initials: 'LB', hours: 36 },
  { name: 'Auditor Demo 1', initials: 'A1', hours: 28 },
  { name: 'Auditor Demo 2', initials: 'A2', hours: 18 },
  { name: 'Auditor Demo 3', initials: 'A3', hours: 31 },
  { name: 'Auditor Demo 4', initials: 'A4', hours: 12 },
]

function TinyBar({ data, max }: { data: number[]; max: number }) {
  return (
    <div className="flex h-10 items-end gap-1">
      {data.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="flex-1 rounded-t"
          style={{ height: `${(value / max) * 100}%`, background: index === data.length - 1 ? '#3b66ee' : '#dde8ff' }}
        />
      ))}
    </div>
  )
}

export function DashboardScreen() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-6">
        <PageHeader
          breadcrumb="Operativo · Dashboard"
          title="Buongiorno, Pianificatore Demo"
          desc="Ecco un riepilogo del tuo mese di pianificazione: 2 audit oggi, 4 da assegnare e 3 da riprogrammare."
          secondary={
            <Btn variant="secondary" icon={CalendarDays} onClick={() => router.push('/calendario')}>
              Apri calendario
            </Btn>
          }
          primary={
            <Btn variant="primary" icon={Plus} onClick={() => router.push('/calendario?new=1')}>
              Nuovo evento
            </Btn>
          }
        />

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Eventi del mese" value={26} delta="+12% vs Aprile" deltaTone="up" icon={CalendarDays} hint="Maggio 2026" />
        <KpiCard label="Pianificati" value={13} icon={MapPin} accent="bg-brand-50 text-brand-600" hint="Pronti all'esecuzione" />
        <KpiCard label="Effettuati" value={8} delta="78% target" deltaTone="up" icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Da riprogrammare" value={3} icon={AlertTriangle} accent="bg-amber-50 text-amber-600" hint="Richiede azione" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" padded={false}>
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <div>
              <h3 className="text-[14px] font-semibold text-ink-800">Prossimi audit</h3>
              <p className="mt-0.5 text-[12px] text-ink-500">Ordinati per data, esclusi quelli già effettuati.</p>
            </div>
            <Btn variant="ghost" size="sm" iconRight={ChevronRight} onClick={() => router.push('/audit')}>
              Vedi tutti
            </Btn>
          </div>
          <ul className="divide-y divide-ink-100">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-brand-50/30">
                <div className="w-12 shrink-0 text-center">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wider text-brand-600">{MONTHS_IT_SHORT[event.date.getMonth()]}</div>
                  <div className="mt-0.5 text-[20px] font-semibold leading-none tabular-nums text-ink-900">{event.date.getDate()}</div>
                  <div className="mt-1 text-[10.5px] text-ink-400">{DOW_IT[(event.date.getDay() + 6) % 7]}</div>
                </div>
                <div className="h-10 w-px bg-ink-100" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-ink-800">{event.company}</span>
                    <Pill status={event.status} size="sm" />
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[12px] text-ink-500">
                    <span className="truncate font-mono">{event.standards.join(' + ')}</span>
                    <span className="text-ink-300">·</span>
                    <span>{event.type}</span>
                    <span className="text-ink-300">·</span>
                    <span className="font-mono text-[11.5px]">{event.auditNumber}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center -space-x-1.5">
                  {event.initials.slice(0, 3).map((initials, index) => (
                    <Avatar key={`${event.id}-${initials}`} name={event.auditors[index]} initials={initials} size="sm" />
                  ))}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
              </li>
            ))}
          </ul>
        </Card>

        <Card padded={false}>
          <div className="border-b border-ink-100 px-5 py-4">
            <h3 className="text-[14px] font-semibold text-ink-800">Da controllare</h3>
            <p className="mt-0.5 text-[12px] text-ink-500">Anomalie e azioni pendenti.</p>
          </div>
          <div className="space-y-3.5 px-5 py-4">
            <Notice tone="amber" title="Eventi senza auditor" text="4 eventi attendono un'assegnazione." action={<button className="shrink-0 text-[12px] font-medium text-amber-700 hover:underline">Risolvi</button>} />
            <Notice tone="brand" title="Audit da confermare" text="2 bozze pronte alla conferma." action={<button className="shrink-0 text-[12px] font-medium text-brand-700 hover:underline">Apri</button>} />
            <Notice tone="rose" title="Da riprogrammare" text="3 eventi richiedono nuova data." action={<button className="shrink-0 text-[12px] font-medium text-rose-700 hover:underline">Vedi</button>} />
            <Notice tone="ink" title="Dati importati incompleti" text="8 righe del foglio Excel del 22/04 da validare." action={<button className="shrink-0 text-[12px] font-medium text-ink-700 hover:underline">Apri</button>} />
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <SectionTitle title="Carico auditor — Maggio 2026" sub="Ore pianificate per auditor sul mese corrente." />
          <div className="space-y-2.5">
            {workload.map((auditor) => {
              const max = 48
              return (
                <div key={auditor.name} className="grid grid-cols-[180px_1fr_60px] items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={auditor.name} initials={auditor.initials} size="sm" />
                    <span className="text-[13px] text-ink-800">{auditor.name}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(auditor.hours / max) * 100}%`, background: auditor.hours > 40 ? '#d97706' : '#3b66ee' }}
                    />
                  </div>
                  <div className="text-right text-[12.5px] tabular-nums text-ink-700">
                    <b>{auditor.hours}</b>
                    <span className="text-ink-400">/{max}h</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Trend audit" sub="Ultimi 6 mesi" action={<button className="text-[12px] text-brand-700 hover:underline">6M</button>} />
          <div className="text-[28px] font-semibold tabular-nums tracking-tight text-ink-900">
            142 <span className="text-[13px] font-medium text-emerald-700">+18%</span>
          </div>
          <div className="mt-3">
            <TinyBar data={[18, 22, 19, 28, 31, 24]} max={32} />
          </div>
          <div className="mt-1.5 grid grid-cols-6 gap-1 text-center font-mono text-[10px] text-ink-400">
            <span>Dic</span>
            <span>Gen</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span className="font-semibold text-brand-600">Mag</span>
          </div>
        </Card>

        <Card className="xl:col-span-3" padded={false}>
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <div>
              <h3 className="text-[14px] font-semibold text-ink-800">Azioni rapide</h3>
              <p className="mt-0.5 text-[12px] text-ink-500">Comandi preparati per il prossimo collegamento dati.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 divide-y divide-ink-100 md:grid-cols-3 md:divide-x md:divide-y-0">
            <QuickAction icon={CalendarDays} title="Apri pianificazione" desc="Vai alla vista mensile degli audit." onClick={() => router.push('/calendario')} />
            <QuickAction icon={Upload} title="Import dati" desc="Controlla anteprima normalizzata." onClick={() => router.push('/import')} />
            <QuickAction icon={Download} title="Esporta report" desc="Genera un CSV operativo." onClick={() => router.push('/audit')} />
          </div>
        </Card>
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, title, desc, onClick }: { icon: typeof Clock; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 px-5 py-4 text-left hover:bg-ink-50">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink-800">{title}</span>
        <span className="block text-[12px] text-ink-500">{desc}</span>
      </span>
      <List className="ml-auto h-4 w-4 text-ink-300" />
    </button>
  )
}
