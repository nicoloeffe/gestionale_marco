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
  RefreshCw,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { canMutateOperationalData } from '@/lib/permissions'
import { DOW_IT, MONTHS_IT_SHORT } from './date-utils'
import { PageHeader } from './page-header'
import { Avatar, Btn, Card, KpiCard, Notice, Pill, SectionTitle } from './ui'
import { type CalendarCatalogs, type CalendarEvent, auditorsOf, clientOf, setCalendarCatalogs, standardsOf } from './calendar/data'
import { loadCalendarData } from './calendar/repository'

type DashboardProfile = {
  fullName: string
  email: string
}

const EMPTY_CATALOGS: CalendarCatalogs = { clients: [], auditors: [], standards: [] }
const dashboardMonth = new Date(2026, 4, 1)
const dashboardToday = new Date(2026, 4, 8)

function eventDate(event: CalendarEvent) {
  return new Date(event.start)
}

function monthEvents(events: CalendarEvent[]) {
  return events.filter((event) => {
    const date = eventDate(event)
    return date.getFullYear() === dashboardMonth.getFullYear() && date.getMonth() === dashboardMonth.getMonth()
  })
}

function TinyBar({ data, max }: { data: number[]; max: number }) {
  return (
    <div className="flex h-10 items-end gap-1">
      {data.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="flex-1 rounded-t"
          style={{ height: `${max > 0 ? (value / max) * 100 : 0}%`, background: index === data.length - 1 ? '#3b66ee' : '#dde8ff' }}
        />
      ))}
    </div>
  )
}

export function DashboardScreen() {
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [catalogs, setCatalogs] = useState<CalendarCatalogs>(EMPTY_CATALOGS)
  const [profile, setProfile] = useState<DashboardProfile>({ fullName: 'Utente', email: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canMutate, setCanMutate] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await loadCalendarData()
      setCalendarCatalogs(data.catalogs)
      setCatalogs(data.catalogs)
      setEvents(data.events)
      setProfile({
        fullName: data.profile.full_name ?? data.profile.email ?? 'Utente',
        email: data.profile.email ?? '',
      })
      setCanMutate(canMutateOperationalData(data.profile.role))
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Non riesco a caricare la dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // TODO: move this fetch to a route-level data boundary when dashboard leaves prototype shell.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload()
  }, [reload])

  const visibleMonthEvents = useMemo(() => monthEvents(events), [events])
  const upcomingEvents = useMemo(
    () =>
      [...events]
        .filter((event) => !event.performed && event.status !== 'annullato' && eventDate(event) >= dashboardToday)
        .sort((left, right) => eventDate(left).getTime() - eventDate(right).getTime())
        .slice(0, 6),
    [events]
  )
  const unassigned = events.filter((event) => !event.auditorId).length
  const drafts = events.filter((event) => event.status === 'bozza').length
  const reschedule = events.filter((event) => event.status === 'da_riprogrammare').length
  const workload = catalogs.auditors
    .map((auditor) => {
      const plannedEvents = visibleMonthEvents.filter((event) => event.auditorId === auditor.id)
      return {
        ...auditor,
        hours: plannedEvents.length * 8,
      }
    })
    .filter((auditor) => auditor.hours > 0)
    .sort((left, right) => right.hours - left.hours)
    .slice(0, 6)
  const trend = [0, 0, 0, 0, 0, visibleMonthEvents.length]
  const maxTrend = Math.max(...trend, 1)

  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-6">
      <PageHeader
        breadcrumb="Operativo · Dashboard"
        title={`Buongiorno, ${profile.fullName}`}
        desc={
          loading
            ? 'Caricamento riepilogo operativo...'
            : `Ecco un riepilogo reale di ${MONTHS_IT_SHORT[dashboardMonth.getMonth()]} ${dashboardMonth.getFullYear()}: ${visibleMonthEvents.length} eventi, ${reschedule} da riprogrammare.`
        }
        secondary={
          <Btn variant="secondary" icon={CalendarDays} onClick={() => router.push('/calendario')}>
            Apri calendario
          </Btn>
        }
        primary={canMutate ?
          <Btn variant="primary" icon={Plus} onClick={() => router.push('/calendario?new=1')} disabled={loading}>
            Nuovo evento
          </Btn> : undefined
        }
      />

      {error ? (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13.5px] text-rose-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
          <Btn variant="danger_g" size="sm" onClick={() => void reload()}>
            Riprova
          </Btn>
        </div>
      ) : null}

      {loading ? (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-3 text-[13.5px] text-ink-600 shadow-sm">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
          Caricamento dashboard...
        </div>
      ) : null}

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Eventi del mese" value={visibleMonthEvents.length} icon={CalendarDays} hint={`${MONTHS_IT_SHORT[dashboardMonth.getMonth()]} ${dashboardMonth.getFullYear()}`} />
        <KpiCard label="Pianificati" value={visibleMonthEvents.filter((event) => ['pianificato', 'confermato'].includes(event.status)).length} icon={MapPin} accent="bg-brand-50 text-brand-600" hint="Pronti all'esecuzione" />
        <KpiCard label="Effettuati" value={visibleMonthEvents.filter((event) => event.performed).length} icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Da riprogrammare" value={reschedule} icon={AlertTriangle} accent="bg-amber-50 text-amber-600" hint="Richiede azione" />
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
            {upcomingEvents.map((event) => {
              const date = eventDate(event)
              const client = clientOf(event)
              const standards = standardsOf(event).map((standard) => standard.code)
              const auditors = auditorsOf(event)

              return (
                <li key={event.id} className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-brand-50/30" onClick={() => router.push('/audit')}>
                  <div className="w-12 shrink-0 text-center">
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-brand-600">{MONTHS_IT_SHORT[date.getMonth()]}</div>
                    <div className="mt-0.5 text-[20px] font-semibold leading-none tabular-nums text-ink-900">{date.getDate()}</div>
                    <div className="mt-1 text-[10.5px] text-ink-400">{DOW_IT[(date.getDay() + 6) % 7]}</div>
                  </div>
                  <div className="h-10 w-px bg-ink-100" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-ink-800">{client?.name ?? 'Senza azienda'}</span>
                      <Pill status={event.status} size="sm" />
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[12px] text-ink-500">
                      <span className="truncate font-mono">{standards.join(' + ') || 'Norma non assegnata'}</span>
                      <span className="text-ink-300">·</span>
                      <span>{event.auditType}</span>
                      <span className="text-ink-300">·</span>
                      <span className="font-mono text-[11.5px]">{event.auditNumber || 'Senza numero'}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center -space-x-1.5">
                    {auditors.slice(0, 3).map((auditor) => (
                      <Avatar key={`${event.id}-${auditor.id}`} name={auditor.name} initials={auditor.initials} size="sm" />
                    ))}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
                </li>
              )
            })}
            {!loading && upcomingEvents.length === 0 ? (
              <li className="px-5 py-8 text-center text-[13px] text-ink-500">Nessun audit pianificato nei prossimi giorni.</li>
            ) : null}
          </ul>
        </Card>

        <Card padded={false}>
          <div className="border-b border-ink-100 px-5 py-4">
            <h3 className="text-[14px] font-semibold text-ink-800">Da controllare</h3>
            <p className="mt-0.5 text-[12px] text-ink-500">Anomalie e azioni pendenti sui dati reali.</p>
          </div>
          <div className="space-y-3.5 px-5 py-4">
            <Notice tone="amber" title="Eventi senza auditor" text={`${unassigned} eventi attendono un'assegnazione.`} action={<button onClick={() => router.push('/audit')} className="shrink-0 text-[12px] font-medium text-amber-700 hover:underline">Risolvi</button>} />
            <Notice tone="brand" title="Audit da confermare" text={`${drafts} bozze pronte alla conferma.`} action={<button onClick={() => router.push('/audit')} className="shrink-0 text-[12px] font-medium text-brand-700 hover:underline">Apri</button>} />
            <Notice tone="rose" title="Da riprogrammare" text={`${reschedule} eventi richiedono nuova data.`} action={<button onClick={() => router.push('/audit')} className="shrink-0 text-[12px] font-medium text-rose-700 hover:underline">Vedi</button>} />
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <SectionTitle title={`Carico auditor - ${MONTHS_IT_SHORT[dashboardMonth.getMonth()]} ${dashboardMonth.getFullYear()}`} sub="Ore pianificate per auditor sul mese corrente." />
          <div className="space-y-2.5">
            {workload.map((auditor) => {
              const max = 48
              return (
                <div key={auditor.id} className="grid grid-cols-[180px_1fr_60px] items-center gap-3">
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
            {!loading && workload.length === 0 ? <div className="text-[13px] text-ink-500">Nessun carico pianificato.</div> : null}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Trend audit" sub="Ultimi 6 mesi" />
          <div className="text-[28px] font-semibold tabular-nums tracking-tight text-ink-900">{visibleMonthEvents.length}</div>
          <div className="mt-3">
            <TinyBar data={trend} max={maxTrend} />
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
              <p className="mt-0.5 text-[12px] text-ink-500">Comandi operativi sui dati collegati.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 divide-y divide-ink-100 md:grid-cols-2 md:divide-x md:divide-y-0">
            <QuickAction icon={CalendarDays} title="Apri pianificazione" desc="Vai alla vista mensile degli audit." onClick={() => router.push('/calendario')} />
            <QuickAction icon={Download} title="Esporta report" desc="Apri la lista eventi filtrabile." onClick={() => router.push('/audit')} />
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
