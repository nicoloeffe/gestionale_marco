import { supabase } from '@/lib/supabase'
import { getCurrentProfile } from '../calendar/repository'

export type ClientRecord = {
  id: string
  company_name: string
  region: string | null
  province: string | null
  ea_code: string | null
  referent_name: string | null
  referent_email: string | null
  referent_phone: string | null
  active: boolean
  notes: string | null
  ente: string
}

export type AuditorRecord = {
  id: string
  name: string
  email: string | null
  phone: string | null
  color: string | null
  active: boolean
  notes: string | null
  ente: string
}

export type StandardRecord = {
  id: string
  code: string
  name: string
  description: string | null
  active: boolean
}

export type ClientInput = Omit<ClientRecord, 'id' | 'ente'>
export type AuditorInput = Omit<AuditorRecord, 'id' | 'ente'>
export type StandardInput = Omit<StandardRecord, 'id'>

export async function listClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, region, province, ea_code, referent_name, referent_email, referent_phone, active, notes, ente')
    .order('company_name')
    .returns<ClientRecord[]>()

  if (error) throw error
  return data ?? []
}

export async function saveClient(input: ClientInput, id?: string) {
  const profile = await getCurrentProfile()
  const payload = { ...input, ente: profile.ente }

  if (id) {
    const { data, error } = await supabase
      .from('clients')
      .update(payload)
      .eq('id', id)
      .select('id, company_name, region, province, ea_code, referent_name, referent_email, referent_phone, active, notes, ente')
      .single<ClientRecord>()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select('id, company_name, region, province, ea_code, referent_name, referent_email, referent_phone, active, notes, ente')
    .single<ClientRecord>()
  if (error) throw error
  return data
}

export async function listAuditors() {
  const { data, error } = await supabase
    .from('auditors')
    .select('id, name, email, phone, color, active, notes, ente')
    .order('name')
    .returns<AuditorRecord[]>()

  if (error) throw error
  return data ?? []
}

export async function saveAuditor(input: AuditorInput, id?: string) {
  const profile = await getCurrentProfile()
  const payload = { ...input, ente: profile.ente }

  if (id) {
    const { data, error } = await supabase
      .from('auditors')
      .update(payload)
      .eq('id', id)
      .select('id, name, email, phone, color, active, notes, ente')
      .single<AuditorRecord>()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('auditors')
    .insert(payload)
    .select('id, name, email, phone, color, active, notes, ente')
    .single<AuditorRecord>()
  if (error) throw error
  return data
}

export async function listStandards() {
  const { data, error } = await supabase
    .from('standards')
    .select('id, code, name, description, active')
    .order('code')
    .returns<StandardRecord[]>()

  if (error) throw error
  return data ?? []
}

export async function saveStandard(input: StandardInput, id?: string) {
  if (id) {
    const { data, error } = await supabase
      .from('standards')
      .update(input)
      .eq('id', id)
      .select('id, code, name, description, active')
      .single<StandardRecord>()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('standards')
    .insert(input)
    .select('id, code, name, description, active')
    .single<StandardRecord>()
  if (error) throw error
  return data
}
