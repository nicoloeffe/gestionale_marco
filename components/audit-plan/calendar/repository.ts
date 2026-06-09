import { supabase } from '@/lib/supabase'
import type { EventStatus } from '../status'
import type { CalendarAuditor, CalendarCatalogs, CalendarClient, CalendarEvent, CalendarStandard } from './data'
import { booleanToPerformedStatus, mapEventsFullRowToCalendarEvent, type EventsFullRow } from './db-mapping'

type ProfileRow = {
  user_id: string
  full_name: string | null
  role: 'admin' | 'operator' | 'viewer'
  ente: string
  sees_all: boolean
  email?: string
}

type ClientRow = {
  id: string
  company_name: string
  ente: string
}

type AuditorRow = {
  id: string
  name: string
  notes: string | null
}

type StandardRow = {
  id: string
  code: string
  description: string | null
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AU'
}

function mapClient(row: ClientRow): CalendarClient {
  return {
    id: row.id,
    name: row.company_name,
    entity: row.ente,
  }
}

function mapAuditor(row: AuditorRow): CalendarAuditor {
  return {
    id: row.id,
    name: row.name,
    role: row.notes ?? 'Auditor',
    initials: initials(row.name),
  }
}

function mapStandard(row: StandardRow): CalendarStandard {
  return {
    id: row.id,
    code: row.code,
    description: row.description ?? row.code,
  }
}

export async function getCurrentProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('Sessione non valida.')

  const { data, error } = await supabase.from('profiles').select('user_id, full_name, role, ente, sees_all').eq('user_id', user.id).maybeSingle<ProfileRow>()
  if (error) throw error
  if (!data) throw new Error('Profilo utente non configurato: crea una riga in public.profiles per questo utente.')

  return { ...data, email: user.email }
}

export async function loadCalendarData(): Promise<{ events: CalendarEvent[]; catalogs: CalendarCatalogs; profile: ProfileRow }> {
  const profile = await getCurrentProfile()
  const [eventsResult, clientsResult, auditorsResult, standardsResult] = await Promise.all([
    supabase.from('events_full').select('*').order('start_datetime', { ascending: true }).returns<EventsFullRow[]>(),
    supabase.from('clients').select('id, company_name, ente').eq('active', true).order('company_name').returns<ClientRow[]>(),
    supabase.from('auditors').select('id, name, notes').eq('active', true).order('name').returns<AuditorRow[]>(),
    supabase.from('standards').select('id, code, description').eq('active', true).order('code').returns<StandardRow[]>(),
  ])

  if (eventsResult.error) throw eventsResult.error
  if (clientsResult.error) throw clientsResult.error
  if (auditorsResult.error) throw auditorsResult.error
  if (standardsResult.error) throw standardsResult.error

  return {
    profile,
    events: (eventsResult.data ?? []).map(mapEventsFullRowToCalendarEvent),
    catalogs: {
      clients: (clientsResult.data ?? []).map(mapClient),
      auditors: (auditorsResult.data ?? []).map(mapAuditor),
      standards: (standardsResult.data ?? []).map(mapStandard),
    },
  }
}

async function loadEvent(eventId: string) {
  const { data, error } = await supabase.from('events_full').select('*').eq('id', eventId).single<EventsFullRow>()
  if (error) throw error
  return mapEventsFullRowToCalendarEvent(data)
}

async function upsertAudit(event: CalendarEvent, ente: string) {
  const auditPayload = {
    audit_number: event.auditNumber || null,
    client_id: event.clientId || null,
    audit_type: event.auditType || null,
    status: event.status === 'annullato' ? 'annullato' : event.status === 'effettuato' ? 'svolto' : 'pianificato',
    notes: event.notes || null,
    ente,
  }

  if (event.auditId) {
    const { data, error } = await supabase.from('audits').update(auditPayload).eq('id', event.auditId).select('id').single<{ id: string }>()
    if (error) throw error
    return data.id
  }

  const { data, error } = await supabase.from('audits').insert(auditPayload).select('id').single<{ id: string }>()
  if (error) throw error
  return data.id
}

async function replaceAuditStandards(auditId: string, standardIds: string[]) {
  const { error: deleteError } = await supabase.from('audit_standards').delete().eq('audit_id', auditId)
  if (deleteError) throw deleteError

  if (standardIds.length === 0) return

  const { error: insertError } = await supabase.from('audit_standards').insert(
    standardIds.map((standardId) => ({
      audit_id: auditId,
      standard_id: standardId,
    }))
  )
  if (insertError) throw insertError
}

export async function saveCalendarEvent(event: CalendarEvent) {
  const profile = await getCurrentProfile()
  const auditId = await upsertAudit(event, profile.ente)
  await replaceAuditStandards(auditId, event.standardIds)

  const eventPayload = {
    audit_id: auditId,
    auditor_id: event.auditorId || null,
    start_datetime: event.start,
    end_datetime: event.end,
    all_day: event.allDay,
    title: event.title || event.auditType || 'Evento audit',
    status: event.status as EventStatus,
    performed_status: booleanToPerformedStatus(event.performed),
    notes: event.notes || null,
    ente: profile.ente,
  }

  if (event.id.startsWith('draft-') || event.id.startsWith('evt-')) {
    const { data, error } = await supabase.from('calendar_events').insert(eventPayload).select('id').single<{ id: string }>()
    if (error) throw error
    return loadEvent(data.id)
  }

  const { error } = await supabase.from('calendar_events').update(eventPayload).eq('id', event.id)
  if (error) throw error
  return loadEvent(event.id)
}

export async function cancelCalendarEvent(event: CalendarEvent) {
  const { error } = await supabase
    .from('calendar_events')
    .update({ status: 'annullato', performed_status: 'no' })
    .eq('id', event.id)

  if (error) throw error
  return loadEvent(event.id)
}
