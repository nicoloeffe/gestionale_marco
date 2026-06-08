import type { EventStatus } from '../status'

export type ImportStep = 'idle' | 'analyzing' | 'done'

export type ImportSummaryData = {
  rows: number
  valid: number
  errors: number
  newClients: number
  newAuditors: number
  duplicates: number
}

export type ImportPreviewRow = {
  row: string
  client: string
  auditor: string
  standard: string
  date: string
  status: EventStatus
  issue: null | 'new-client' | 'no-auditor' | 'no-client' | 'bad-date'
}

export const summary: ImportSummaryData = {
  rows: 142,
  valid: 128,
  errors: 8,
  newClients: 11,
  newAuditors: 3,
  duplicates: 6,
}

export const previewRows: ImportPreviewRow[] = [
  { row: '12', client: 'Azienda Alfa S.r.l.', auditor: 'Mario Rossi', standard: 'ISO 27001', date: '27/04/2026 09:00', status: 'effettuato', issue: null },
  { row: '13', client: 'Azienda Alfa S.r.l.', auditor: 'Laura Bianchi', standard: 'ISO 22301', date: '27/04/2026 09:00', status: 'effettuato', issue: null },
  { row: '14', client: 'Beta Consulting S.r.l.', auditor: 'Auditor Demo 1', standard: 'ISO 14001', date: '04/05/2026 09:00', status: 'effettuato', issue: null },
  { row: '15', client: 'Gamma Service S.p.A. (NUOVO)', auditor: 'Auditor Demo 2', standard: 'ISO 9001', date: '30/04/2026 14:00', status: 'pianificato', issue: 'new-client' },
  { row: '16', client: 'Delta Ambiente S.r.l.', auditor: '(vuoto)', standard: 'ISO 14001', date: '29/05/2026 09:00', status: 'annullato', issue: 'no-auditor' },
  { row: '17', client: '(non riconosciuto)', auditor: 'Mario Rossi', standard: 'ISO 9001', date: '21/05/2026 09:00', status: 'da_riprogrammare', issue: 'no-client' },
  { row: '18', client: 'Omega Industries S.p.A.', auditor: 'Mario Rossi', standard: 'ISO 9001', date: '??/??/????', status: 'pianificato', issue: 'bad-date' },
  { row: '19', client: 'Omega Industries S.p.A.', auditor: 'Mario Rossi', standard: 'ISO 9001', date: '22/05/2026 09:00', status: 'da_riprogrammare', issue: null },
  { row: '20', client: 'Epsilon Tech S.r.l.', auditor: 'Laura Bianchi', standard: 'ISO 9001', date: '22/05/2026 14:00', status: 'pianificato', issue: null },
]

export const issueLabels = {
  'new-client': { text: 'Azienda nuova', tone: 'amber' },
  'no-auditor': { text: 'Auditor mancante', tone: 'amber' },
  'no-client': { text: 'Azienda non riconosciuta', tone: 'rose' },
  'bad-date': { text: 'Data non valida', tone: 'rose' },
} as const
