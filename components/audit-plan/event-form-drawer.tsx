'use client'

import { Check, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AUDITORS, AUDIT_TYPES, CLIENTS, STANDARDS, type CalendarEvent, byId } from './calendar/data'
import { STATUSES, type EventStatus } from './status'
import { Btn, Field, Input, Pill, Select, TextArea, Toggle } from './ui'
import { cn } from '@/lib/utils'

type EventFormValue = Omit<CalendarEvent, 'id'>

function toLocalInput(value: string) {
  const date = new Date(value)
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromLocalInput(value: string) {
  return new Date(value).toISOString()
}

function blankEvent(presetDate: Date | null): EventFormValue {
  const start = presetDate ? new Date(presetDate.getFullYear(), presetDate.getMonth(), presetDate.getDate(), 9, 0) : new Date(2026, 4, 15, 9, 0)
  const end = presetDate ? new Date(presetDate.getFullYear(), presetDate.getMonth(), presetDate.getDate(), 17, 0) : new Date(2026, 4, 15, 17, 0)

  return {
    title: '',
    clientId: '',
    auditorIds: [],
    standardIds: [],
    start: start.toISOString(),
    end: end.toISOString(),
    allDay: false,
    status: 'pianificato',
    performed: false,
    auditNumber: '',
    auditType: 'Sorveglianza',
    notes: '',
  }
}

export function EventFormDrawer({
  open,
  mode,
  initial,
  presetDate,
  onClose,
  onSave,
}: {
  open: boolean
  mode: 'new' | 'edit'
  initial: CalendarEvent | null
  presetDate: Date | null
  onClose: () => void
  onSave: (event: CalendarEvent) => void
}) {
  const seed = useMemo<EventFormValue>(() => {
    if (!initial) return blankEvent(presetDate)

    const { id: _id, ...rest } = initial
    return rest
  }, [initial, presetDate])
  const [value, setValue] = useState<EventFormValue>(seed)

  useEffect(() => {
    setValue(seed)
  }, [seed, open])

  if (!open) return null

  const set = <K extends keyof EventFormValue>(key: K, next: EventFormValue[K]) => setValue((current) => ({ ...current, [key]: next }))
  const client = byId(CLIENTS, value.clientId)

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-900/30 fade-in" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-[760px] max-w-[calc(100vw-24px)] flex-col bg-white shadow-drawer slide-in">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-100 px-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[14.5px] font-semibold text-ink-900">{mode === 'edit' ? 'Modifica evento audit' : 'Nuovo evento audit'}</h3>
              <Pill status={value.status} size="sm" />
            </div>
            <div className="truncate text-[12px] text-ink-500">
              {mode === 'edit' ? `Audit ${value.auditNumber || '—'}` : 'Compila le sezioni principali del mock MVP'}
            </div>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-ink-50/40">
          <FormSection title="Informazioni principali" desc="Identifica audit, cliente e auditor coinvolti.">
            <Field label="Titolo evento" hint="Opzionale">
              <Input placeholder="Es. Sorveglianza ISO 9001 - Azienda Alfa S.r.l." value={value.title ?? ''} onChange={(event) => set('title', event.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Azienda / Cliente" required>
                <Select value={value.clientId ?? ''} onChange={(event) => set('clientId', event.target.value)}>
                  <option value="">— Seleziona —</option>
                  {CLIENTS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
                {client ? (
                  <div className="mt-1 text-[11.5px] text-ink-500">
                    Ente: <b>{client.entity}</b>
                  </div>
                ) : null}
              </Field>
              <Field label="Tipo audit" required>
                <Select value={value.auditType} onChange={(event) => set('auditType', event.target.value)}>
                  {AUDIT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Auditor" hint={`${value.auditorIds.length} selezionati`} required>
              <MultiSelectChips
                options={AUDITORS}
                value={value.auditorIds}
                onChange={(ids) => set('auditorIds', ids)}
                getLabel={(id) => byId(AUDITORS, id)?.name ?? id}
                placeholder="Nessun auditor assegnato"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Norma / Standard" required>
                <MultiSelectChips
                  options={STANDARDS}
                  value={value.standardIds}
                  onChange={(ids) => set('standardIds', ids)}
                  getLabel={(id) => byId(STANDARDS, id)?.code ?? id}
                  placeholder="Nessuna norma"
                />
              </Field>
              <Field label="Numero audit" hint="Codice interno">
                <Input placeholder="AU-2026-040" value={value.auditNumber} onChange={(event) => set('auditNumber', event.target.value)} className="font-mono" />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Pianificazione" desc="Definisci data, durata e modalita.">
            <div className="flex items-center justify-between">
              <Toggle checked={value.allDay} onChange={(checked) => set('allDay', checked)} label="Tutto il giorno" />
              <span className="text-[11.5px] text-ink-500">Fuso: Europe/Rome</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data inizio" required>
                <Input type="datetime-local" value={toLocalInput(value.start)} onChange={(event) => set('start', fromLocalInput(event.target.value))} />
              </Field>
              <Field label="Data fine" required>
                <Input type="datetime-local" value={toLocalInput(value.end)} onChange={(event) => set('end', fromLocalInput(event.target.value))} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Stato" desc="Stato corrente dell'audit e check completamento.">
            <Field label="Stato evento">
              <div className="grid grid-cols-3 gap-1.5">
                {Object.values(STATUSES).map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => set('status', status.id)}
                    className={cn(
                      'flex h-9 items-center gap-2 rounded-lg px-2.5 text-[12.5px] font-medium ring-1 transition-colors',
                      value.status === status.id ? `${status.bg} ${status.text} ${status.ring}` : 'bg-white text-ink-600 ring-ink-200 hover:bg-ink-50'
                    )}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: status.dot }} />
                    {status.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Effettuato">
              <div className="inline-flex rounded-lg bg-ink-100 p-0.5">
                {[
                  { value: false, label: 'No, non ancora' },
                  { value: true, label: 'Si, completato' },
                ].map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => set('performed', option.value)}
                    className={cn(
                      'h-7 rounded-md px-3 text-[12.5px] font-medium transition-colors',
                      value.performed === option.value ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-600 hover:text-ink-800'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>
          </FormSection>

          <FormSection title="Note" desc="Annotazioni interne, non ufficiali.">
            <Field label="Note interne" hint={`${value.notes.length}/500`}>
              <TextArea rows={4} placeholder="Eventuali dettagli operativi..." value={value.notes} maxLength={500} onChange={(event) => set('notes', event.target.value)} />
            </Field>
          </FormSection>
        </div>

        <footer className="flex h-14 shrink-0 items-center justify-end gap-2 border-t border-ink-100 bg-white px-5">
          <Btn variant="ghost" onClick={onClose}>
            Annulla
          </Btn>
          <Btn
            variant="secondary"
            onClick={() => onSave({ ...value, id: initial?.id ?? `draft-${Date.now()}`, status: 'bozza' })}
          >
            Salva come bozza
          </Btn>
          <Btn icon={Check} variant="primary" onClick={() => onSave({ ...value, id: initial?.id ?? `evt-${Date.now()}` })}>
            {mode === 'edit' ? 'Salva modifiche' : 'Crea evento'}
          </Btn>
        </footer>
      </aside>
    </div>
  )
}

function FormSection({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-ink-100 px-5 py-5 last:border-b-0">
      <div className="grid grid-cols-[200px_1fr] gap-6">
        <div>
          <h4 className="text-[13px] font-semibold text-ink-800">{title}</h4>
          <p className="mt-1 text-[12px] leading-snug text-ink-500">{desc}</p>
        </div>
        <div className="space-y-3.5">{children}</div>
      </div>
    </section>
  )
}

function MultiSelectChips<T extends { id: string }>({
  options,
  value,
  onChange,
  getLabel,
  placeholder,
}: {
  options: T[]
  value: string[]
  onChange: (value: string[]) => void
  getLabel: (id: string) => string
  placeholder: string
}) {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id])

  return (
    <div className="flex min-h-10 flex-wrap gap-1.5 rounded-lg border border-ink-200 bg-white p-1.5">
      {value.length === 0 ? <span className="px-1.5 py-1 text-[12.5px] text-ink-400">{placeholder}</span> : null}
      {value.map((id) => (
        <span key={id} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-brand-50 pl-2 pr-1 text-[12.5px] font-medium text-brand-700 ring-1 ring-brand-100">
          {getLabel(id)}
          <button type="button" onClick={() => toggle(id)} className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-brand-100">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <details className="relative ml-auto">
        <summary className="inline-flex h-7 cursor-pointer list-none items-center gap-1 rounded-md px-2 text-[12.5px] text-ink-600 hover:bg-ink-50">
          <Plus className="h-3.5 w-3.5" /> Aggiungi
        </summary>
        <div className="absolute right-0 top-9 z-10 max-h-[260px] w-[260px] overflow-y-auto rounded-lg bg-white p-1 shadow-pop ring-1 ring-ink-200">
          {options.map((option) => (
            <button key={option.id} type="button" onClick={() => toggle(option.id)} className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[13px] hover:bg-ink-50">
              <span className={cn('h-4 w-4 rounded border', value.includes(option.id) ? 'inline-flex items-center justify-center border-brand-600 bg-brand-600 text-white' : 'border-ink-300')}>
                {value.includes(option.id) ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
              </span>
              {getLabel(option.id)}
            </button>
          ))}
        </div>
      </details>
    </div>
  )
}
