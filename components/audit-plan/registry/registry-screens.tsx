'use client'

import { AlertTriangle, Building2, CheckCircle2, Edit, Plus, RefreshCw, Search, ShieldCheck, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { can } from '@/lib/permissions'
import { PageHeader } from '../page-header'
import { Avatar, Btn, Card, Field, Input, TextArea, Toggle } from '../ui'
import { getCurrentProfile } from '../calendar/repository'
import {
  listAuditors,
  listClients,
  listStandards,
  saveAuditor,
  saveClient,
  saveStandard,
  type AuditorInput,
  type AuditorRecord,
  type ClientInput,
  type ClientRecord,
  type StandardInput,
  type StandardRecord,
} from './repository'

type ScreenState<T> = {
  rows: T[]
  loading: boolean
  saving: boolean
  error: string | null
}

const emptyClient: ClientInput = {
  company_name: '',
  region: '',
  province: '',
  ea_code: '',
  referent_name: '',
  referent_email: '',
  referent_phone: '',
  active: true,
  notes: '',
}

const emptyAuditor: AuditorInput = {
  name: '',
  email: '',
  phone: '',
  color: '#3b66ee',
  active: true,
  notes: '',
}

const emptyStandard: StandardInput = {
  code: '',
  name: '',
  description: '',
  active: true,
}

function normalize(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={active ? 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-100' : 'inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-1 text-[12px] font-medium text-ink-600 ring-1 ring-ink-200'}>
      <span className={active ? 'h-1.5 w-1.5 rounded-full bg-emerald-500' : 'h-1.5 w-1.5 rounded-full bg-ink-400'} />
      {active ? 'Attivo' : 'Inattivo'}
    </span>
  )
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13.5px] text-rose-800">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        {message}
      </div>
      <Btn variant="danger_g" size="sm" onClick={onRetry}>
        Riprova
      </Btn>
    </div>
  )
}

function LoadingBanner({ label }: { label: string }) {
  return (
    <div className="mb-5 flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-3 text-[13.5px] text-ink-600 shadow-sm">
      <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
      {label}
    </div>
  )
}

export function ClientsScreen() {
  const [state, setState] = useState<ScreenState<ClientRecord>>({ rows: [], loading: true, saving: false, error: null })
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<ClientRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<ClientInput>(emptyClient)
  const [canMutate, setCanMutate] = useState(false)

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const [profile, rows] = await Promise.all([getCurrentProfile(), listClients()])
      setCanMutate(can(profile.role, 'manageRegistries'))
      setState((current) => ({ ...current, rows, loading: false }))
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : 'Non riesco a caricare i clienti.' }))
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return state.rows
    return state.rows.filter((client) => `${client.company_name} ${client.region ?? ''} ${client.province ?? ''} ${client.ea_code ?? ''}`.toLowerCase().includes(needle))
  }, [query, state.rows])

  const openCreate = () => {
    setForm(emptyClient)
    setEditing(null)
    setCreating(true)
  }

  const openEdit = (client: ClientRecord) => {
    setForm({
      company_name: client.company_name,
      region: client.region ?? '',
      province: client.province ?? '',
      ea_code: client.ea_code ?? '',
      referent_name: client.referent_name ?? '',
      referent_email: client.referent_email ?? '',
      referent_phone: client.referent_phone ?? '',
      active: client.active,
      notes: client.notes ?? '',
    })
    setEditing(client)
    setCreating(false)
  }

  const submit = async () => {
    if (!form.company_name.trim()) return
    setState((current) => ({ ...current, saving: true, error: null }))
    try {
      const saved = await saveClient(
        {
          ...form,
          company_name: form.company_name.trim(),
          region: normalize(form.region),
          province: normalize(form.province),
          ea_code: normalize(form.ea_code),
          referent_name: normalize(form.referent_name),
          referent_email: normalize(form.referent_email),
          referent_phone: normalize(form.referent_phone),
          notes: normalize(form.notes),
        },
        editing?.id
      )
      setState((current) => ({
        ...current,
        saving: false,
        rows: current.rows.some((row) => row.id === saved.id) ? current.rows.map((row) => (row.id === saved.id ? saved : row)) : [...current.rows, saved],
      }))
      setCreating(false)
      setEditing(null)
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error: error instanceof Error ? error.message : 'Errore durante il salvataggio cliente.' }))
    }
  }

  return (
    <RegistryShell
      title="Aziende"
      description="Anagrafica clienti collegata a Supabase e filtrata dalla RLS del tuo ente."
      countLabel={`${filtered.length} clienti`}
      query={query}
      setQuery={setQuery}
      queryPlaceholder="Cerca azienda, provincia, regione..."
      loading={state.loading}
      loadingLabel="Caricamento clienti..."
      error={state.error}
      reload={reload}
      primaryLabel="Nuovo cliente"
      onCreate={openCreate}
      canMutate={canMutate}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
        <Card padded={false} className="overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-200 bg-white text-left text-[11.5px] font-semibold uppercase tracking-wider text-ink-500">
                <th className="px-4 py-3">Azienda</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Referente</th>
                <th className="px-4 py-3">Stato</th>
                <th className="px-4 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((client) => (
                <tr key={client.id} data-testid="client-row" className="hover:bg-brand-50/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-800">{client.company_name}</div>
                    <div className="text-[11.5px] text-ink-500">{client.ente}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{[client.region, client.province, client.ea_code ? `EA ${client.ea_code}` : null].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="px-4 py-3 text-ink-600">
                    <div>{client.referent_name ?? '—'}</div>
                    <div className="text-[11.5px] text-ink-400">{client.referent_email ?? client.referent_phone ?? ''}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge active={client.active} /></td>
                  <td className="px-4 py-3 text-right">
                    {canMutate ? (
                      <button title="Modifica" onClick={() => openEdit(client)} className="inline-flex h-8 w-8 items-center justify-center rounded text-ink-500 hover:bg-ink-100">
                        <Edit className="h-4 w-4" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {!state.loading && filtered.length === 0 ? <EmptyRow colSpan={5} label="Nessun cliente trovato" /> : null}
            </tbody>
          </table>
        </Card>

        {canMutate && (creating || editing) ? (
          <ClientForm form={form} setForm={setForm} saving={state.saving} editing={Boolean(editing)} onCancel={() => { setCreating(false); setEditing(null) }} onSubmit={submit} />
        ) : (
          <EmptyForm icon={<Building2 className="h-5 w-5" />} title={canMutate ? 'Seleziona o crea un cliente' : 'Consultazione clienti'} text={canMutate ? "Le nuove aziende saranno salvate con l'ente del tuo profilo." : 'Il tuo ruolo consente la sola lettura.'} />
        )}
      </div>
    </RegistryShell>
  )
}

function ClientForm({ form, setForm, saving, editing, onCancel, onSubmit }: { form: ClientInput; setForm: React.Dispatch<React.SetStateAction<ClientInput>>; saving: boolean; editing: boolean; onCancel: () => void; onSubmit: () => void }) {
  const set = <K extends keyof ClientInput>(key: K, value: ClientInput[K]) => setForm((current) => ({ ...current, [key]: value }))
  return (
    <Card>
      <FormTitle title={editing ? 'Modifica cliente' : 'Nuovo cliente'} />
      <div className="space-y-3">
        <Field label="Ragione sociale" required><Input value={form.company_name} onChange={(event) => set('company_name', event.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Regione"><Input value={form.region ?? ''} onChange={(event) => set('region', event.target.value)} /></Field>
          <Field label="Provincia"><Input value={form.province ?? ''} onChange={(event) => set('province', event.target.value)} /></Field>
        </div>
        <Field label="Codice EA"><Input value={form.ea_code ?? ''} onChange={(event) => set('ea_code', event.target.value)} /></Field>
        <Field label="Referente"><Input value={form.referent_name ?? ''} onChange={(event) => set('referent_name', event.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email"><Input type="email" value={form.referent_email ?? ''} onChange={(event) => set('referent_email', event.target.value)} /></Field>
          <Field label="Telefono"><Input value={form.referent_phone ?? ''} onChange={(event) => set('referent_phone', event.target.value)} /></Field>
        </div>
        <Field label="Note"><TextArea value={form.notes ?? ''} onChange={(event) => set('notes', event.target.value)} /></Field>
        <Toggle checked={form.active} onChange={(checked) => set('active', checked)} label="Cliente attivo" />
        <FormActions saving={saving} onCancel={onCancel} onSubmit={onSubmit} submitLabel={editing ? 'Salva modifiche' : 'Crea cliente'} />
      </div>
    </Card>
  )
}

export function AuditorsScreen() {
  const [state, setState] = useState<ScreenState<AuditorRecord>>({ rows: [], loading: true, saving: false, error: null })
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<AuditorRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<AuditorInput>(emptyAuditor)
  const [canMutate, setCanMutate] = useState(false)

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const [profile, rows] = await Promise.all([getCurrentProfile(), listAuditors()])
      setCanMutate(can(profile.role, 'manageRegistries'))
      setState((current) => ({ ...current, rows, loading: false }))
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : 'Non riesco a caricare gli auditor.' }))
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return state.rows
    return state.rows.filter((auditor) => `${auditor.name} ${auditor.email ?? ''} ${auditor.phone ?? ''}`.toLowerCase().includes(needle))
  }, [query, state.rows])

  const openCreate = () => {
    setForm(emptyAuditor)
    setEditing(null)
    setCreating(true)
  }

  const openEdit = (auditor: AuditorRecord) => {
    setForm({
      name: auditor.name,
      email: auditor.email ?? '',
      phone: auditor.phone ?? '',
      color: auditor.color ?? '#3b66ee',
      active: auditor.active,
      notes: auditor.notes ?? '',
    })
    setEditing(auditor)
    setCreating(false)
  }

  const submit = async () => {
    if (!form.name.trim()) return
    setState((current) => ({ ...current, saving: true, error: null }))
    try {
      const saved = await saveAuditor(
        {
          ...form,
          name: form.name.trim(),
          email: normalize(form.email),
          phone: normalize(form.phone),
          color: normalize(form.color),
          notes: normalize(form.notes),
        },
        editing?.id
      )
      setState((current) => ({
        ...current,
        saving: false,
        rows: current.rows.some((row) => row.id === saved.id) ? current.rows.map((row) => (row.id === saved.id ? saved : row)) : [...current.rows, saved],
      }))
      setCreating(false)
      setEditing(null)
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error: error instanceof Error ? error.message : 'Errore durante il salvataggio auditor.' }))
    }
  }

  return (
    <RegistryShell
      title="Auditor"
      description="Anagrafica auditor collegata a Supabase e filtrata dalla RLS del tuo ente."
      countLabel={`${filtered.length} auditor`}
      query={query}
      setQuery={setQuery}
      queryPlaceholder="Cerca auditor, email, telefono..."
      loading={state.loading}
      loadingLabel="Caricamento auditor..."
      error={state.error}
      reload={reload}
      primaryLabel="Nuovo auditor"
      onCreate={openCreate}
      canMutate={canMutate}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((auditor) => (
            <Card key={auditor.id} padded={false} className="p-4" data-testid="auditor-row">
              <div className="flex items-center gap-3">
                <Avatar name={auditor.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-ink-800">{auditor.name}</div>
                  <div className="truncate text-[12px] text-ink-500">{auditor.email ?? auditor.phone ?? auditor.ente}</div>
                </div>
                <StatusBadge active={auditor.active} />
                {canMutate ? (
                  <button title="Modifica" onClick={() => openEdit(auditor)} className="inline-flex h-8 w-8 items-center justify-center rounded text-ink-500 hover:bg-ink-100">
                    <Edit className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </Card>
          ))}
          {!state.loading && filtered.length === 0 ? <Card className="md:col-span-2"><div className="text-center text-[13px] text-ink-500">Nessun auditor trovato</div></Card> : null}
        </div>
        {canMutate && (creating || editing) ? (
          <AuditorForm form={form} setForm={setForm} saving={state.saving} editing={Boolean(editing)} onCancel={() => { setCreating(false); setEditing(null) }} onSubmit={submit} />
        ) : (
          <EmptyForm icon={<Users className="h-5 w-5" />} title={canMutate ? 'Seleziona o crea un auditor' : 'Consultazione auditor'} text={canMutate ? "I nuovi auditor saranno salvati con l'ente del tuo profilo." : 'Il tuo ruolo consente la sola lettura.'} />
        )}
      </div>
    </RegistryShell>
  )
}

function AuditorForm({ form, setForm, saving, editing, onCancel, onSubmit }: { form: AuditorInput; setForm: React.Dispatch<React.SetStateAction<AuditorInput>>; saving: boolean; editing: boolean; onCancel: () => void; onSubmit: () => void }) {
  const set = <K extends keyof AuditorInput>(key: K, value: AuditorInput[K]) => setForm((current) => ({ ...current, [key]: value }))
  return (
    <Card>
      <FormTitle title={editing ? 'Modifica auditor' : 'Nuovo auditor'} />
      <div className="space-y-3">
        <Field label="Nome" required><Input value={form.name} onChange={(event) => set('name', event.target.value)} /></Field>
        <Field label="Email"><Input type="email" value={form.email ?? ''} onChange={(event) => set('email', event.target.value)} /></Field>
        <Field label="Telefono"><Input value={form.phone ?? ''} onChange={(event) => set('phone', event.target.value)} /></Field>
        <Field label="Colore"><Input type="color" value={form.color ?? '#3b66ee'} onChange={(event) => set('color', event.target.value)} className="h-10 p-1" /></Field>
        <Field label="Note"><TextArea value={form.notes ?? ''} onChange={(event) => set('notes', event.target.value)} /></Field>
        <Toggle checked={form.active} onChange={(checked) => set('active', checked)} label="Auditor attivo" />
        <FormActions saving={saving} onCancel={onCancel} onSubmit={onSubmit} submitLabel={editing ? 'Salva modifiche' : 'Crea auditor'} />
      </div>
    </Card>
  )
}

export function StandardsScreen() {
  const [state, setState] = useState<ScreenState<StandardRecord>>({ rows: [], loading: true, saving: false, error: null })
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<StandardRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<StandardInput>(emptyStandard)
  const [canMutate, setCanMutate] = useState(false)

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const [profile, rows] = await Promise.all([getCurrentProfile(), listStandards()])
      setCanMutate(can(profile.role, 'manageRegistries'))
      setState((current) => ({ ...current, rows, loading: false }))
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : 'Non riesco a caricare le norme.' }))
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return state.rows
    return state.rows.filter((standard) => `${standard.code} ${standard.name} ${standard.description ?? ''}`.toLowerCase().includes(needle))
  }, [query, state.rows])

  const openCreate = () => {
    setForm(emptyStandard)
    setEditing(null)
    setCreating(true)
  }

  const openEdit = (standard: StandardRecord) => {
    setForm({
      code: standard.code,
      name: standard.name,
      description: standard.description ?? '',
      active: standard.active,
    })
    setEditing(standard)
    setCreating(false)
  }

  const submit = async () => {
    if (!form.code.trim() || !form.name.trim()) return
    setState((current) => ({ ...current, saving: true, error: null }))
    try {
      const saved = await saveStandard(
        {
          code: form.code.trim(),
          name: form.name.trim(),
          description: normalize(form.description),
          active: form.active,
        },
        editing?.id
      )
      setState((current) => ({
        ...current,
        saving: false,
        rows: current.rows.some((row) => row.id === saved.id) ? current.rows.map((row) => (row.id === saved.id ? saved : row)) : [...current.rows, saved],
      }))
      setCreating(false)
      setEditing(null)
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error: error instanceof Error ? error.message : 'Errore durante il salvataggio norma.' }))
    }
  }

  return (
    <RegistryShell
      title="Norme"
      description="Standard certificabili globali disponibili nei form evento."
      countLabel={`${filtered.length} norme`}
      query={query}
      setQuery={setQuery}
      queryPlaceholder="Cerca codice, nome, descrizione..."
      loading={state.loading}
      loadingLabel="Caricamento norme..."
      error={state.error}
      reload={reload}
      primaryLabel="Nuova norma"
      onCreate={openCreate}
      canMutate={canMutate}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
        <Card padded={false} className="overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-200 bg-white text-left text-[11.5px] font-semibold uppercase tracking-wider text-ink-500">
                <th className="px-4 py-3">Codice</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Stato</th>
                <th className="px-4 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((standard) => (
                <tr key={standard.id} data-testid="standard-row" className="hover:bg-brand-50/30">
                  <td className="px-4 py-3 font-mono text-ink-800">{standard.code}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-800">{standard.name}</div>
                    <div className="text-[11.5px] text-ink-500">{standard.description ?? ''}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge active={standard.active} /></td>
                  <td className="px-4 py-3 text-right">
                    {canMutate ? (
                      <button title="Modifica" onClick={() => openEdit(standard)} className="inline-flex h-8 w-8 items-center justify-center rounded text-ink-500 hover:bg-ink-100">
                        <Edit className="h-4 w-4" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {!state.loading && filtered.length === 0 ? <EmptyRow colSpan={4} label="Nessuna norma trovata" /> : null}
            </tbody>
          </table>
        </Card>
        {canMutate && (creating || editing) ? (
          <StandardForm form={form} setForm={setForm} saving={state.saving} editing={Boolean(editing)} onCancel={() => { setCreating(false); setEditing(null) }} onSubmit={submit} />
        ) : (
          <EmptyForm icon={<ShieldCheck className="h-5 w-5" />} title={canMutate ? 'Seleziona o crea una norma' : 'Consultazione norme'} text={canMutate ? "Le norme sono globali e non dipendono dall'ente." : 'Il tuo ruolo consente la sola lettura.'} />
        )}
      </div>
    </RegistryShell>
  )
}

function StandardForm({ form, setForm, saving, editing, onCancel, onSubmit }: { form: StandardInput; setForm: React.Dispatch<React.SetStateAction<StandardInput>>; saving: boolean; editing: boolean; onCancel: () => void; onSubmit: () => void }) {
  const set = <K extends keyof StandardInput>(key: K, value: StandardInput[K]) => setForm((current) => ({ ...current, [key]: value }))
  return (
    <Card>
      <FormTitle title={editing ? 'Modifica norma' : 'Nuova norma'} />
      <div className="space-y-3">
        <Field label="Codice" required><Input value={form.code} onChange={(event) => set('code', event.target.value)} className="font-mono" /></Field>
        <Field label="Nome" required><Input value={form.name} onChange={(event) => set('name', event.target.value)} /></Field>
        <Field label="Descrizione"><TextArea value={form.description ?? ''} onChange={(event) => set('description', event.target.value)} /></Field>
        <Toggle checked={form.active} onChange={(checked) => set('active', checked)} label="Norma attiva" />
        <FormActions saving={saving} onCancel={onCancel} onSubmit={onSubmit} submitLabel={editing ? 'Salva modifiche' : 'Crea norma'} />
      </div>
    </Card>
  )
}

function RegistryShell({
  title,
  description,
  countLabel,
  query,
  setQuery,
  queryPlaceholder,
  loading,
  loadingLabel,
  error,
  reload,
  primaryLabel,
  onCreate,
  canMutate,
  children,
}: {
  title: string
  description: string
  countLabel: string
  query: string
  setQuery: (value: string) => void
  queryPlaceholder: string
  loading: boolean
  loadingLabel: string
  error: string | null
  reload: () => void
  primaryLabel: string
  onCreate: () => void
  canMutate: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-6">
      <PageHeader
        breadcrumb="Anagrafiche"
        title={title}
        desc={description}
        primary={canMutate ? <Btn variant="primary" icon={Plus} onClick={onCreate} disabled={loading}>{primaryLabel}</Btn> : undefined}
      />
      {loading ? <LoadingBanner label={loadingLabel} /> : null}
      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
      <Card className="mb-4" padded={false}>
        <div className="flex items-center gap-3 p-3">
          <Input icon={Search} placeholder={queryPlaceholder} value={query} onChange={(event) => setQuery(event.target.value)} className="w-[360px]" />
          <div className="ml-auto inline-flex items-center gap-2 text-[13px] text-ink-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {countLabel}
          </div>
        </div>
      </Card>
      {children}
    </div>
  )
}

function FormTitle({ title }: { title: string }) {
  return <h3 className="mb-4 text-[14px] font-semibold text-ink-800">{title}</h3>
}

function FormActions({ saving, onCancel, onSubmit, submitLabel }: { saving: boolean; onCancel: () => void; onSubmit: () => void; submitLabel: string }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Btn variant="ghost" onClick={onCancel} disabled={saving}>Annulla</Btn>
      <Btn variant="primary" onClick={onSubmit} disabled={saving}>{saving ? 'Salvataggio...' : submitLabel}</Btn>
    </div>
  )
}

function EmptyForm({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card>
      <div className="flex items-start gap-3 text-ink-600">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
        <div>
          <div className="font-medium text-ink-800">{title}</div>
          <div className="mt-1 text-[13px] leading-snug text-ink-500">{text}</div>
        </div>
      </div>
    </Card>
  )
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-[13px] text-ink-500">{label}</td>
    </tr>
  )
}
