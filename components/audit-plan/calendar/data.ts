import type { EventStatus } from '../status'

export type MockClient = {
  id: string
  name: string
  entity: string
}

export type MockAuditor = {
  id: string
  name: string
  role: string
  initials: string
}

export type MockStandard = {
  id: string
  code: string
  description: string
}

export type CalendarEvent = {
  id: string
  title?: string
  clientId: string | null
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

export const CLIENTS: MockClient[] = [
  { id: 'a1', name: 'Azienda Alfa S.r.l.', entity: 'DEMO ENTE A' },
  { id: 'a2', name: 'Beta Consulting S.r.l.', entity: 'DEMO ENTE A' },
  { id: 'a3', name: 'Gamma Service S.p.A.', entity: 'DEMO ENTE A' },
  { id: 'a4', name: 'Delta Ambiente S.r.l.', entity: 'DEMO ENTE B' },
  { id: 'a5', name: 'Omega Industries S.p.A.', entity: 'DEMO ENTE A' },
  { id: 'a6', name: 'Epsilon Tech S.r.l.', entity: 'DEMO ENTE A' },
  { id: 'a7', name: 'Zeta Logistica S.r.l.', entity: 'DEMO ENTE A' },
  { id: 'a8', name: 'Eta Software S.r.l.', entity: 'DEMO ENTE C' },
  { id: 'a9', name: 'Theta Engineering S.r.l.', entity: 'DEMO ENTE A' },
  { id: 'a10', name: 'Iota Group S.p.A.', entity: 'DEMO ENTE A' },
  { id: 'a11', name: 'Kappa Solutions S.r.l.', entity: 'DEMO ENTE D' },
  { id: 'a12', name: 'Lambda Trading S.r.l.', entity: 'DEMO ENTE B' },
  { id: 'a13', name: 'Mu Servizi S.r.l.', entity: 'DEMO ENTE A' },
  { id: 'a14', name: 'Nu Manufacturing S.p.A.', entity: 'DEMO ENTE A' },
  { id: 'a15', name: 'Xi Demo S.r.l.', entity: 'DEMO ENTE C' },
  { id: 'a16', name: 'Omicron Demo S.r.l.', entity: 'DEMO ENTE A' },
  { id: 'a17', name: 'Pi Holding S.p.A.', entity: 'DEMO ENTE D' },
  { id: 'a18', name: 'Rho Demo S.r.l.', entity: 'DEMO ENTE A' },
  { id: 'a19', name: 'Sigma Industria S.r.l.', entity: 'DEMO ENTE A' },
]

export const AUDITORS: MockAuditor[] = [
  { id: 'u1', name: 'Mario Rossi', role: 'Lead Auditor', initials: 'MR' },
  { id: 'u2', name: 'Laura Bianchi', role: 'Auditor', initials: 'LB' },
  { id: 'u3', name: 'Auditor Demo 1', role: 'Lead Auditor', initials: 'A1' },
  { id: 'u4', name: 'Auditor Demo 2', role: 'Auditor Junior', initials: 'A2' },
  { id: 'u5', name: 'Auditor Demo 3', role: 'Auditor', initials: 'A3' },
  { id: 'u6', name: 'Auditor Demo 4', role: 'Auditor', initials: 'A4' },
  { id: 'u7', name: 'Auditor Demo 5', role: 'Lead Auditor', initials: 'A5' },
  { id: 'u8', name: 'Auditor Demo 6', role: 'Auditor', initials: 'A6' },
]

export const STANDARDS: MockStandard[] = [
  { id: 'n1', code: 'ISO 9001', description: 'Sistemi di gestione per la qualita' },
  { id: 'n2', code: 'ISO 14001', description: 'Sistemi di gestione ambientale' },
  { id: 'n3', code: 'ISO 45001', description: 'Salute e sicurezza sul lavoro' },
  { id: 'n4', code: 'ISO 27001', description: 'Sicurezza delle informazioni' },
  { id: 'n5', code: 'ISO 22301', description: 'Continuita operativa' },
  { id: 'n6', code: 'ISO 13485', description: 'Dispositivi medici' },
  { id: 'n7', code: 'ISO 22000', description: 'Sicurezza alimentare' },
]

export const AUDIT_TYPES = ['Stage 1', 'Stage 2', 'Sorveglianza', 'Rinnovo', 'Pre-audit', 'Follow-up']

const Y = 2026
const M = 4

function iso(day: number, hour: number) {
  return new Date(Y, M, day, hour, 0).toISOString()
}

function event(
  id: string,
  day: number,
  durationDays: number,
  hour: number,
  clientId: string | null,
  auditorIds: string[],
  standardIds: string[],
  status: EventStatus,
  performed: boolean,
  auditNumber: string,
  auditType: string,
  notes = ''
): CalendarEvent {
  return {
    id,
    title: '',
    clientId,
    auditorIds,
    standardIds,
    start: iso(day, hour),
    end: iso(day + durationDays, hour + 7),
    allDay: false,
    status,
    performed,
    auditNumber,
    auditType,
    notes,
  }
}

export const INITIAL_EVENTS: CalendarEvent[] = [
  event('e01', 27, 1, 9, 'a1', ['u3', 'u4'], ['n4', 'n5'], 'effettuato', true, '27017-27018-22301', 'Sorveglianza', 'Demo: in remoto.'),
  event('e02', 30, 0, 9, 'a16', ['u1'], ['n1'], 'effettuato', true, 'AU-2026-019', 'Sorveglianza', '0,5 in remoto per mantenimento qualifica.'),
  event('e03', 30, 0, 14, 'a15', ['u2'], ['n1'], 'pianificato', false, 'AU-2026-020', 'Stage 2'),
  event('e04', 4, 1, 9, 'a10', ['u5'], ['n2'], 'effettuato', true, 'AU-2026-021', 'Sorveglianza'),
  event('e05', 11, 0, 9, 'a11', ['u3'], ['n1', 'n4'], 'effettuato', true, 'AU-2026-022', 'Rinnovo'),
  event('e06', 12, 0, 9, 'a12', ['u6'], ['n1'], 'effettuato', true, 'AU-2026-023', 'Sorveglianza'),
  event('e07', 13, 0, 9, 'a5', ['u7'], ['n1'], 'effettuato', true, 'AU-2026-024', 'Sorveglianza'),
  event('e08', 15, 0, 9, null, ['u1', 'u2', 'u3', 'u4'], ['n4'], 'da_riprogrammare', false, 'AU-2026-025', 'Stage 1', 'In attesa conferma cliente.'),
  event('e09', 18, 1, 9, 'a17', ['u8'], ['n3'], 'pianificato', false, 'AU-2026-026', 'Stage 2', 'Day 1 in remoto.'),
  event('e10', 19, 0, 9, 'a13', ['u5'], ['n1'], 'pianificato', false, 'AU-2026-027', 'Sorveglianza'),
  event('e11', 20, 0, 9, 'a13', ['u5'], ['n1'], 'pianificato', false, 'AU-2026-028', 'Sorveglianza'),
  event('e12', 21, 0, 9, 'a14', ['u7'], ['n1'], 'da_riprogrammare', false, 'AU-2026-029', 'Stage 2', 'Cliente ha richiesto rinvio.'),
  event('e13', 22, 0, 9, 'a14', ['u7'], ['n1'], 'da_riprogrammare', false, 'AU-2026-030', 'Stage 2'),
  event('e14', 22, 0, 14, 'a11', ['u3'], ['n1'], 'pianificato', false, 'AU-2026-031', 'Sorveglianza'),
  event('e15', 22, 0, 11, 'a2', ['u2'], ['n4'], 'pianificato', false, 'AU-2026-040', 'Stage 1'),
  event('e16', 22, 0, 16, 'a9', ['u6'], ['n3'], 'confermato', false, 'AU-2026-041', 'Sorveglianza'),
  event('e17', 22, 0, 17, 'a18', ['u8'], ['n2'], 'bozza', false, '—', 'Pre-audit'),
  event('e18', 23, 0, 9, 'a11', ['u3'], ['n1'], 'pianificato', false, 'AU-2026-032', 'Sorveglianza'),
  event('e19', 6, 0, 9, 'a2', ['u1', 'u3'], ['n4'], 'confermato', false, 'AU-2026-033', 'Stage 1'),
  event('e20', 7, 1, 9, 'a3', ['u4'], ['n2', 'n3'], 'confermato', false, 'AU-2026-034', 'Sorveglianza'),
  event('e21', 14, 0, 9, 'a18', ['u6'], ['n1'], 'bozza', false, '—', 'Pre-audit', 'Bozza, mancano date definitive.'),
  event('e22', 25, 0, 9, 'a19', ['u8'], ['n7'], 'pianificato', false, 'AU-2026-035', 'Stage 2'),
  event('e23', 26, 0, 9, 'a4', ['u2'], ['n1'], 'confermato', false, 'AU-2026-036', 'Sorveglianza'),
  event('e24', 28, 0, 9, 'a6', ['u5'], ['n3'], 'pianificato', false, 'AU-2026-037', 'Sorveglianza'),
  event('e25', 29, 0, 9, 'a7', ['u7'], ['n2'], 'annullato', false, 'AU-2026-038', 'Sorveglianza', 'Annullato dal cliente, contratto in revisione.'),
  event('e26', 5, 0, 14, 'a8', ['u1'], ['n1', 'n2'], 'effettuato', true, 'AU-2026-039', 'Rinnovo'),
]

export function byId<T extends { id: string }>(items: T[], id: string | null | undefined) {
  return items.find((item) => item.id === id)
}

export function clientOf(eventItem: CalendarEvent) {
  return byId(CLIENTS, eventItem.clientId)
}

export function auditorsOf(eventItem: CalendarEvent) {
  return eventItem.auditorIds.map((id) => byId(AUDITORS, id)).filter((item): item is MockAuditor => Boolean(item))
}

export function standardsOf(eventItem: CalendarEvent) {
  return eventItem.standardIds.map((id) => byId(STANDARDS, id)).filter((item): item is MockStandard => Boolean(item))
}
