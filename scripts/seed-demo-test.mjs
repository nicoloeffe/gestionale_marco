import { createClient } from '@supabase/supabase-js'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local', quiet: true })

const url = process.env.TEST_SUPABASE_URL
const serviceRoleKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY
const targetEmail = process.env.DEMO_USER_EMAIL
const ente = process.env.DEMO_ENTE || 'ENTE_TEST'

if (!url || !serviceRoleKey) {
  console.error('Missing TEST_SUPABASE_URL or TEST_SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function getDemoUser() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 })
  if (error) throw error

  const users = data.users.filter((user) => user.email)
  const user =
    (targetEmail ? users.find((item) => item.email === targetEmail) : null) ??
    users.find((item) => !item.email?.endsWith('@example.invalid')) ??
    users[0]

  if (!user?.email) {
    throw new Error('No auth user found in TEST Supabase. Create one from Authentication > Users first.')
  }

  return user
}

async function one(table, select, match, insert) {
  const { data: existing, error: selectError } = await supabase.from(table).select(select).match(match).maybeSingle()
  if (selectError) throw selectError
  if (existing) return existing

  const { data, error } = await supabase.from(table).insert(insert).select(select).single()
  if (error) throw error
  return data
}

async function upsertAudit({ auditNumber, clientId, auditType, status = 'pianificato' }) {
  const auditStatus =
    status === 'confermato' ? 'confermato' :
    status === 'annullato' ? 'annullato' :
    status === 'effettuato' ? 'svolto' :
    status === 'bozza' ? 'da_pianificare' :
    'pianificato'
  const match = { audit_number: auditNumber, ente }
  const { data: existing, error: selectError } = await supabase.from('audits').select('id').match(match).maybeSingle()
  if (selectError) throw selectError
  if (existing) {
    const { error } = await supabase
      .from('audits')
      .update({ client_id: clientId, audit_type: auditType, status: auditStatus, ente })
      .eq('id', existing.id)
    if (error) throw error
    return existing
  }

  const { data, error } = await supabase
    .from('audits')
    .insert({ audit_number: auditNumber, client_id: clientId, audit_type: auditType, status: auditStatus, ente })
    .select('id')
    .single()
  if (error) throw error
  return data
}

async function replaceStandards(auditId, standardIds) {
  const { error: deleteError } = await supabase.from('audit_standards').delete().eq('audit_id', auditId)
  if (deleteError) throw deleteError

  const { error } = await supabase.from('audit_standards').insert(
    standardIds.map((standardId) => ({
      audit_id: auditId,
      standard_id: standardId,
    }))
  )
  if (error) throw error
}

async function upsertEvent({ auditId, auditorId, title, start, end, status = 'pianificato', performed = 'no' }) {
  const { data: existing, error: selectError } = await supabase
    .from('calendar_events')
    .select('id')
    .eq('audit_id', auditId)
    .eq('title', title)
    .maybeSingle()
  if (selectError) throw selectError

  const payload = {
    audit_id: auditId,
    auditor_id: auditorId,
    title,
    start_datetime: start,
    end_datetime: end,
    all_day: false,
    status,
    performed_status: performed,
    ente,
  }

  if (existing) {
    const { error } = await supabase.from('calendar_events').update(payload).eq('id', existing.id)
    if (error) throw error
    return existing
  }

  const { data, error } = await supabase.from('calendar_events').insert(payload).select('id').single()
  if (error) throw error
  return data
}

async function main() {
  const user = await getDemoUser()

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Demo Operatore',
      role: 'operator',
      ente,
      sees_all: false,
    },
    { onConflict: 'user_id' }
  )
  if (profileError) throw profileError

  const clients = await Promise.all([
    one('clients', 'id, company_name', { company_name: 'Alfa Qualita S.r.l.', ente }, { company_name: 'Alfa Qualita S.r.l.', province: 'MI', ente, active: true }),
    one('clients', 'id, company_name', { company_name: 'Beta Consulting S.r.l.', ente }, { company_name: 'Beta Consulting S.r.l.', province: 'BO', ente, active: true }),
    one('clients', 'id, company_name', { company_name: 'Delta Ambiente S.r.l.', ente }, { company_name: 'Delta Ambiente S.r.l.', province: 'TO', ente, active: true }),
  ])

  const auditors = await Promise.all([
    one('auditors', 'id, name', { name: 'Mario Rossi', ente }, { name: 'Mario Rossi', email: 'mario.rossi@test.local', ente, active: true }),
    one('auditors', 'id, name', { name: 'Laura Bianchi', ente }, { name: 'Laura Bianchi', email: 'laura.bianchi@test.local', ente, active: true }),
  ])

  const standards = await Promise.all([
    one('standards', 'id, code', { code: 'ISO 9001' }, { code: 'ISO 9001', name: 'ISO 9001', description: 'Qualita', active: true }),
    one('standards', 'id, code', { code: 'ISO 14001' }, { code: 'ISO 14001', name: 'ISO 14001', description: 'Ambiente', active: true }),
    one('standards', 'id, code', { code: 'ISO 45001' }, { code: 'ISO 45001', name: 'ISO 45001', description: 'Salute e sicurezza', active: true }),
  ])

  const demoAudits = [
    {
      auditNumber: 'DEMO-2026-001',
      clientId: clients[0].id,
      auditType: 'Sorveglianza',
      auditorId: auditors[0].id,
      standardIds: [standards[0].id],
      title: 'Sorveglianza ISO 9001',
      start: '2026-05-11T09:00:00.000Z',
      end: '2026-05-11T17:00:00.000Z',
      status: 'confermato',
    },
    {
      auditNumber: 'DEMO-2026-002',
      clientId: clients[1].id,
      auditType: 'Rinnovo',
      auditorId: auditors[1].id,
      standardIds: [standards[0].id, standards[1].id],
      title: 'Rinnovo integrato',
      start: '2026-05-15T09:00:00.000Z',
      end: '2026-05-15T17:00:00.000Z',
      status: 'pianificato',
    },
    {
      auditNumber: 'DEMO-2026-003',
      clientId: clients[2].id,
      auditType: 'Stage 2',
      auditorId: auditors[0].id,
      standardIds: [standards[2].id],
      title: 'Stage 2 ISO 45001',
      start: '2026-05-18T09:00:00.000Z',
      end: '2026-05-18T16:00:00.000Z',
      status: 'da_riprogrammare',
    },
    {
      auditNumber: 'DEMO-2026-004',
      clientId: clients[0].id,
      auditType: 'Sorveglianza',
      auditorId: auditors[1].id,
      standardIds: [standards[1].id],
      title: 'Sorveglianza ISO 14001',
      start: '2026-05-22T09:00:00.000Z',
      end: '2026-05-22T13:00:00.000Z',
      status: 'bozza',
    },
  ]

  for (const item of demoAudits) {
    const audit = await upsertAudit(item)
    await replaceStandards(audit.id, item.standardIds)
    await upsertEvent({ ...item, auditId: audit.id })
  }

  console.log(`Seed demo completato su ${url}`)
  console.log(`Utente profilo: ${user.email}`)
  console.log(`Ente: ${ente}`)
  console.log(`Clienti: ${clients.length}, auditor: ${auditors.length}, norme: ${standards.length}, eventi: ${demoAudits.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
