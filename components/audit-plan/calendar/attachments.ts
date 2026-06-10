import { canMutateOperationalData } from '@/lib/permissions'
import { supabase } from '@/lib/supabase'
import { getCurrentProfile } from './repository'

export const ATTACHMENT_BUCKET = 'event-attachments'

export const ATTACHMENT_CATEGORIES = ['rapporto', 'fattura', 'fattura_auditor', 'lettera_audit'] as const

export type AttachmentCategory = (typeof ATTACHMENT_CATEGORIES)[number]

export type EventAttachment = {
  id: string
  event_id: string
  ente: string
  categoria: AttachmentCategory
  nome_file: string
  storage_path: string
  created_at: string
}

type CalendarEventRow = {
  id: string
  ente: string
}

export const attachmentCategoryLabels: Record<AttachmentCategory, string> = {
  rapporto: 'Rapporto',
  fattura: 'Fattura',
  fattura_auditor: 'Fattura auditor',
  lettera_audit: 'Lettera audit',
}

function safeFileName(name: string) {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return cleaned || 'allegato'
}

async function getEventForAttachment(eventId: string) {
  const { data, error } = await supabase.from('calendar_events').select('id, ente').eq('id', eventId).single<CalendarEventRow>()
  if (error) throw error
  return data
}

export async function loadEventAttachments(eventId: string) {
  const { data, error } = await supabase
    .from('event_attachments')
    .select('id, event_id, ente, categoria, nome_file, storage_path, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .returns<EventAttachment[]>()

  if (error) throw error
  return data ?? []
}

export async function uploadEventAttachment(eventId: string, categoria: AttachmentCategory, file: File) {
  const [profile, event] = await Promise.all([getCurrentProfile(), getEventForAttachment(eventId)])

  if (!canMutateOperationalData(profile.role) || profile.ente !== event.ente) {
    throw new Error('Non hai i permessi per caricare allegati su questo evento.')
  }

  const storagePath = `${event.ente}/${event.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`
  const { error: uploadError } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) throw uploadError

  const { data, error: insertError } = await supabase
    .from('event_attachments')
    .insert({
      event_id: event.id,
      ente: event.ente,
      categoria,
      nome_file: file.name,
      storage_path: storagePath,
    })
    .select('id, event_id, ente, categoria, nome_file, storage_path, created_at')
    .single<EventAttachment>()

  if (insertError) {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove([storagePath])
    throw insertError
  }

  return data
}

export async function downloadEventAttachment(attachment: EventAttachment) {
  const { data, error } = await supabase.storage.from(ATTACHMENT_BUCKET).createSignedUrl(attachment.storage_path, 60, {
    download: attachment.nome_file,
  })
  if (error) throw error
  if (!data?.signedUrl) throw new Error('Impossibile generare il link di download.')

  window.location.assign(data.signedUrl)
}

export async function deleteEventAttachment(attachment: EventAttachment) {
  const { error: storageError } = await supabase.storage.from(ATTACHMENT_BUCKET).remove([attachment.storage_path])
  if (storageError) throw storageError

  const { error } = await supabase.from('event_attachments').delete().eq('id', attachment.id)
  if (error) throw error
}
