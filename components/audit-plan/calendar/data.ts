import type { EventStatus } from '../status'

export type CalendarClient = {
  id: string
  name: string
  entity: string
}

export type CalendarAuditor = {
  id: string
  name: string
  role: string
  initials: string
}

export type CalendarStandard = {
  id: string
  code: string
  description: string
}

export type CalendarEvent = {
  id: string
  auditId: string | null
  title?: string
  clientId: string | null
  auditorId: string | null
  auditorIds: string[]
  standardIds: string[]
  start: string
  end: string
  allDay: boolean
  status: EventStatus
  performed: boolean
  auditNumber: string
  auditType: string
  notes: string
}

export type CalendarCatalogs = {
  clients: CalendarClient[]
  auditors: CalendarAuditor[]
  standards: CalendarStandard[]
}

export const AUDIT_TYPES = ['Stage 1', 'Stage 2', 'Sorveglianza', 'Rinnovo', 'Pre-audit', 'Follow-up']

export let CLIENTS: CalendarClient[] = []
export let AUDITORS: CalendarAuditor[] = []
export let STANDARDS: CalendarStandard[] = []
export const INITIAL_EVENTS: CalendarEvent[] = []

export function setCalendarCatalogs(catalogs: CalendarCatalogs) {
  CLIENTS = catalogs.clients
  AUDITORS = catalogs.auditors
  STANDARDS = catalogs.standards
}

export function byId<T extends { id: string }>(items: T[], id: string | null | undefined) {
  return items.find((item) => item.id === id)
}

export function clientOf(eventItem: CalendarEvent) {
  return byId(CLIENTS, eventItem.clientId)
}

export function auditorsOf(eventItem: CalendarEvent) {
  return eventItem.auditorIds.map((id) => byId(AUDITORS, id)).filter((item): item is CalendarAuditor => Boolean(item))
}

export function standardsOf(eventItem: CalendarEvent) {
  return eventItem.standardIds.map((id) => byId(STANDARDS, id)).filter((item): item is CalendarStandard => Boolean(item))
}
