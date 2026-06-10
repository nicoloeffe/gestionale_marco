'use client'

import { Download, FileText, RefreshCw, Trash2, Upload } from 'lucide-react'
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ATTACHMENT_CATEGORIES,
  attachmentCategoryLabels,
  deleteEventAttachment,
  downloadEventAttachment,
  type AttachmentCategory,
  type EventAttachment,
  loadEventAttachments,
  uploadEventAttachment,
} from './calendar/attachments'
import { Btn, Field, Select } from './ui'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function EventAttachmentsPanel({ eventId, canMutate }: { eventId: string; canMutate: boolean }) {
  const [attachments, setAttachments] = useState<EventAttachment[]>([])
  const [category, setCategory] = useState<AttachmentCategory>('rapporto')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputId = useMemo(() => `attachment-upload-${eventId}`, [eventId])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      setAttachments(await loadEventAttachments(eventId))
    } catch (err) {
      console.error(err)
      setError('Non riesco a caricare gli allegati.')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    // TODO: move attachment loading into a route-level data boundary when drawers become server-driven.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload()
  }, [reload])

  const handleUpload = async (changeEvent: ChangeEvent<HTMLInputElement>) => {
    const file = changeEvent.target.files?.[0]
    changeEvent.target.value = ''
    if (!file) return

    setBusy(true)
    setError(null)

    try {
      const attachment = await uploadEventAttachment(eventId, category, file)
      setAttachments((current) => [attachment, ...current])
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Errore durante il caricamento dell'allegato.")
    } finally {
      setBusy(false)
    }
  }

  const handleDownload = async (attachment: EventAttachment) => {
    setBusy(true)
    setError(null)

    try {
      await downloadEventAttachment(attachment)
    } catch (err) {
      console.error(err)
      setError('Non riesco a generare il download.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (attachment: EventAttachment) => {
    setBusy(true)
    setError(null)

    try {
      await deleteEventAttachment(attachment)
      setAttachments((current) => current.filter((item) => item.id !== attachment.id))
    } catch (err) {
      console.error(err)
      setError("Errore durante l'eliminazione dell'allegato.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section data-testid="event-attachments-panel">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">Allegati</h4>
          <p className="mt-0.5 text-[11.5px] text-ink-400">File privati accessibili solo via sessione.</p>
        </div>
        <Btn variant="ghost" size="sm" icon={RefreshCw} onClick={() => void reload()} disabled={loading || busy} title="Ricarica allegati">
          Ricarica
        </Btn>
      </div>

      {canMutate ? (
        <div className="mb-3 grid grid-cols-[1fr_auto] gap-2 rounded-lg border border-ink-100 bg-ink-50/40 p-3">
          <Field label="Categoria">
            <Select value={category} onChange={(event) => setCategory(event.target.value as AttachmentCategory)} disabled={busy}>
              {ATTACHMENT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {attachmentCategoryLabels[item]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <input id={inputId} className="sr-only" type="file" onChange={handleUpload} disabled={busy} />
            <Btn icon={Upload} onClick={() => document.getElementById(inputId)?.click()} disabled={busy}>
              Carica
            </Btn>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12.5px] text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="rounded-lg border border-ink-100">
        {loading ? (
          <div className="flex items-center gap-2 px-3 py-4 text-[12.5px] text-ink-500">
            <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
            Caricamento allegati...
          </div>
        ) : attachments.length === 0 ? (
          <div className="px-3 py-4 text-[12.5px] text-ink-500">
            Nessun allegato caricato.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="flex items-center gap-3 px-3 py-2.5" data-testid="event-attachment-row">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink-800">{attachment.nome_file}</div>
                  <div className="mt-0.5 flex gap-2 text-[11.5px] text-ink-400">
                    <span>{attachmentCategoryLabels[attachment.categoria]}</span>
                    <span>·</span>
                    <span>{formatDateTime(attachment.created_at)}</span>
                  </div>
                </div>
                <Btn variant="ghost" size="sm" icon={Download} onClick={() => void handleDownload(attachment)} disabled={busy} title="Scarica allegato">
                  Scarica
                </Btn>
                {canMutate ? (
                  <Btn variant="ghost" size="sm" icon={Trash2} onClick={() => void handleDelete(attachment)} disabled={busy} title="Elimina allegato">
                    Elimina
                  </Btn>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
