import type { EventStatus } from '../status'
import type { CalendarEvent } from './data'

export type EventsFullRow = {
  id: string
  audit_id: string | null
  auditor_id: string | null
  start_datetime: string
  end_datetime: string | null
  all_day: boolean
  title: string
  status: EventStatus
  performed_status: 'yes' | 'no' | 'unknown'
  notes: string | null
  audit_number: string | null
  audit_type: string | null
  client_id: string | null
  standards: Array<{ id: string; code: string; name?: string | null }> | null
}

export function performedStatusToBoolean(status: EventsFullRow['performed_status']) {
  return status === 'yes'
}

export function booleanToPerformedStatus(performed: boolean): EventsFullRow['performed_status'] {
  return performed ? 'yes' : 'no'
}

export function mapEventsFullRowToCalendarEvent(row: EventsFullRow): CalendarEvent {
  return {
    id: row.id,
    auditId: row.audit_id,
    title: row.title,
    clientId: row.client_id,
    auditorId: row.auditor_id,
    auditorIds: row.auditor_id ? [row.auditor_id] : [],
    standardIds: (row.standards ?? []).map((standard) => standard.id),
    start: row.start_datetime,
    end: row.end_datetime ?? row.start_datetime,
    allDay: row.all_day,
    status: row.status,
    performed: performedStatusToBoolean(row.performed_status),
    auditNumber: row.audit_number ?? '',
    auditType: row.audit_type ?? 'Sorveglianza',
    notes: row.notes ?? '',
  }
}
