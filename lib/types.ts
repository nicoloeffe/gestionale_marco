export type AuditStatus =
  | 'da_pianificare'
  | 'pianificato'
  | 'confermato'
  | 'svolto'
  | 'da_chiudere'
  | 'chiuso'
  | 'annullato'

export type AuditType = 'S' | 'R' | 'C' | 'P' | 'M' | 'E' | 'EST'

export type ActivityType =
  | 'audit'
  | 'ferie'
  | 'remoto'
  | 'non_disponibile'
  | 'formazione'
  | 'altro'

export type LocationType = 'presenza' | 'remoto' | 'misto'

export type UserRole = 'admin' | 'operator'

export interface Auditor {
  id: string
  name: string
  email: string | null
  phone: string | null
  color: string
  active: boolean
  notes: string | null
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
  vat_number: string | null
  active: boolean
  notes: string | null
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
  std_9001: boolean
  std_14001: boolean
  std_integrated: boolean
  std_45001: boolean
  std_27001: boolean
  audit_type: AuditType | null
  planned_days: number | null
  planned_days_raw: string | null
  amount: number | null
  amount_raw: string | null
  already_invoiced: boolean
  status: AuditStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  audit_id: string | null
  auditor_id: string | null
  date_start: string
  date_end: string
  activity_type: ActivityType
  location_type: LocationType | null
  title: string | null
  notes: string | null
  status: string | null
  created_at: string
  updated_at: string
}

export interface EventFull extends CalendarEvent {
  auditor_name: string | null
  auditor_color: string | null
  audit_number: string | null
  audit_type: AuditType | null
  audit_status: AuditStatus | null
  client_name: string | null
}

export interface AuditWithClient extends Audit {
  company_name: string | null
  client_region: string | null
  client_province: string | null
}
