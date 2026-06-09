export type UserRole = 'admin' | 'operator' | 'viewer'

export type AuditStatus =
  | 'da_pianificare'
  | 'pianificato'
  | 'confermato'
  | 'svolto'
  | 'da_chiudere'
  | 'chiuso'
  | 'annullato'

export type CalendarEventStatus =
  | 'bozza'
  | 'pianificato'
  | 'confermato'
  | 'effettuato'
  | 'annullato'
  | 'da_riprogrammare'

export type PerformedStatus = 'yes' | 'no' | 'unknown'

export interface Profile {
  id: string
  user_id: string | null
  full_name: string | null
  role: UserRole
  ente: string
  sees_all: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  company_name: string
  region: string | null
  province: string | null
  ea_code: string | null
  address: string | null
  referent_name: string | null
  referent_email: string | null
  referent_phone: string | null
  pec: string | null
  vat_number: string | null
  active: boolean
  notes: string | null
  needs_review: boolean
  ente: string
  created_at: string
  updated_at: string
}

export interface Auditor {
  id: string
  name: string
  email: string | null
  phone: string | null
  color: string | null
  active: boolean
  notes: string | null
  ente: string
  created_at: string
  updated_at: string
}

export interface Standard {
  id: string
  code: string
  name: string
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Audit {
  id: string
  audit_number: string | null
  client_id: string | null
  consultant: string | null
  referrer: string | null
  region: string | null
  province: string | null
  ea_code: string | null
  cert_expiry: string | null
  audit_type: string | null
  planned_days: number | null
  planned_days_raw: string | null
  amount: number | null
  amount_raw: string | null
  already_invoiced: boolean
  status: AuditStatus
  notes: string | null
  import_month: string | null
  import_row: number | null
  needs_review: boolean
  ente: string
  created_at: string
  updated_at: string
}

export interface AuditStandard {
  audit_id: string
  standard_id: string
}

export interface ImportBatch {
  id: string
  filename: string | null
  source_type: string | null
  status: string
  rows_total: number
  rows_valid: number
  rows_error: number
  created_at: string
  updated_at: string
}

export interface ImportedRow {
  id: string
  import_batch_id: string | null
  row_number: number | null
  raw_data: Record<string, unknown> | null
  normalized_data: Record<string, unknown> | null
  status: string | null
  error_message: string | null
  created_at: string
}

export interface CalendarEvent {
  id: string
  audit_id: string | null
  auditor_id: string | null
  start_datetime: string
  end_datetime: string | null
  all_day: boolean
  activity_type: string | null
  location_type: string | null
  title: string
  status: CalendarEventStatus
  performed_status: PerformedStatus
  notes: string | null
  source: string | null
  external_reference: string | null
  raw_cell_value: string | null
  import_batch_id: string | null
  needs_review: boolean
  review_note: string | null
  ente: string
  created_at: string
  updated_at: string
}

export interface StandardSummary {
  id: string
  code: string
  name: string
}

export interface EventFull extends CalendarEvent {
  auditor_name: string | null
  auditor_color: string | null
  audit_number: string | null
  audit_type: string | null
  audit_status: AuditStatus | null
  client_id: string | null
  client_name: string | null
  client_region: string | null
  client_province: string | null
  standards: StandardSummary[]
  standards_codes: string[]
}

export interface AuditFull extends Audit {
  client_name: string | null
  client_region: string | null
  client_province: string | null
  standards: StandardSummary[]
  standards_codes: string[]
  events_count: number
  next_event_datetime: string | null
}
