import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const STANDARD_SEED = [
  { code: 'ISO 9001', name: 'ISO 9001' },
  { code: 'ISO 14001', name: 'ISO 14001' },
  { code: 'ISO 45001', name: 'ISO 45001' },
  { code: 'ISO 27001', name: 'ISO 27001' },
  { code: 'ISO 22000', name: 'ISO 22000' },
  { code: 'ISO 20000', name: 'ISO 20000' },
  { code: 'ISO 22301', name: 'ISO 22301' },
  { code: 'ISO 27017', name: 'ISO 27017' },
  { code: 'ISO 27018', name: 'ISO 27018' },
  { code: 'PDR 125', name: 'PDR 125' },
]

const LEGACY_STANDARD_FLAGS = [
  ['std_9001', 'ISO 9001'],
  ['std_14001', 'ISO 14001'],
  ['std_45001', 'ISO 45001'],
  ['std_27001', 'ISO 27001'],
]

const AUDIT_STATUSES = new Set([
  'da_pianificare',
  'pianificato',
  'confermato',
  'svolto',
  'da_chiudere',
  'chiuso',
  'annullato',
])

const EVENT_STATUSES = new Set([
  'bozza',
  'pianificato',
  'confermato',
  'effettuato',
  'annullato',
  'da_riprogrammare',
])

function load(file) {
  return JSON.parse(readFileSync(`./output/${file}`, 'utf-8'))
}

function omitLegacyStandards(audit) {
  const {
    std_9001,
    std_14001,
    std_integrated,
    std_45001,
    std_27001,
    ...cleanAudit
  } = audit

  return {
    ...cleanAudit,
    status: AUDIT_STATUSES.has(cleanAudit.status) ? cleanAudit.status : 'da_pianificare',
    already_invoiced: Boolean(cleanAudit.already_invoiced),
    needs_review: Boolean(cleanAudit.needs_review),
  }
}

function toDateTime(value) {
  if (!value) return null
  return `${value}T00:00:00+00:00`
}

function normalizeEvent(event) {
  const startDatetime = toDateTime(event.date_start)
  const endDatetime = toDateTime(event.date_end)
  const status = EVENT_STATUSES.has(event.status) ? event.status : 'pianificato'

  return {
    id: event.id,
    audit_id: event.audit_id,
    auditor_id: event.auditor_id,
    start_datetime: startDatetime,
    end_datetime: endDatetime,
    all_day: true,
    activity_type: event.activity_type ?? null,
    location_type: event.location_type ?? null,
    title: event.title || event.raw_cell_value || 'Evento',
    status,
    performed_status: 'unknown',
    notes: event.notes ?? null,
    source: 'legacy_json',
    external_reference: null,
    raw_cell_value: event.raw_cell_value ?? null,
    import_batch_id: null,
    needs_review: false,
    review_note: null,
  }
}

async function upsertBatch(table, rows, options = {}) {
  if (rows.length === 0) return 0

  const batchSize = options.batchSize ?? 100
  let processed = 0

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase
      .from(table)
      .upsert(batch, {
        onConflict: options.onConflict ?? 'id',
        ignoreDuplicates: options.ignoreDuplicates ?? false,
      })

    if (error) {
      throw new Error(`${table} batch ${i}: ${error.message}`)
    }

    processed += batch.length
    process.stdout.write(`\r  ${table}: ${processed}/${rows.length}`)
  }

  process.stdout.write('\n')
  return processed
}

async function seedStandards() {
  const { data, error } = await supabase
    .from('standards')
    .upsert(STANDARD_SEED, { onConflict: 'code' })
    .select('id, code')

  if (error) {
    throw new Error(`standards: ${error.message}`)
  }

  return new Map((data ?? []).map((standard) => [standard.code, standard.id]))
}

function buildAuditStandards(audits, standardIdsByCode) {
  const rows = []

  for (const audit of audits) {
    for (const [flag, code] of LEGACY_STANDARD_FLAGS) {
      if (!audit[flag]) continue

      const standardId = standardIdsByCode.get(code)
      if (!standardId) {
        throw new Error(`Missing standard id for ${code}`)
      }

      rows.push({
        audit_id: audit.id,
        standard_id: standardId,
      })
    }
  }

  return rows
}

async function main() {
  console.log('Seeding Supabase v1 schema...\n')

  const auditors = load('auditors.json')
  const clients = load('clients.json')
  const legacyAudits = load('audits.json')
  const legacyEvents = load('calendar_events.json')

  console.log('Upsert standards...')
  const standardIdsByCode = await seedStandards()

  console.log('Upsert clients...')
  const clientsCount = await upsertBatch('clients', clients)

  console.log('Upsert auditors...')
  const auditorsCount = await upsertBatch('auditors', auditors)

  console.log('Upsert audits...')
  const audits = legacyAudits.map(omitLegacyStandards)
  const auditsCount = await upsertBatch('audits', audits)

  const integratedLegacyCount = legacyAudits.filter((audit) => audit.std_integrated === true).length
  console.log(`Legacy std_integrated=true audit count: ${integratedLegacyCount}`)
  console.log('std_integrated is not a standard in v1 and does not create standards/audit_standards rows.')

  console.log('Upsert audit_standards...')
  const auditStandards = buildAuditStandards(legacyAudits, standardIdsByCode)
  const auditStandardsCount = await upsertBatch('audit_standards', auditStandards, {
    onConflict: 'audit_id,standard_id',
  })

  console.log('Upsert calendar_events...')
  const events = legacyEvents.map(normalizeEvent).filter((event) => event.start_datetime)
  const eventsCount = await upsertBatch('calendar_events', events)

  console.log('\nSummary')
  console.log(`  clients inseriti/upserted: ${clientsCount}`)
  console.log(`  auditors inseriti/upserted: ${auditorsCount}`)
  console.log(`  standards inseriti/upserted: ${standardIdsByCode.size}`)
  console.log(`  audits inseriti/upserted: ${auditsCount}`)
  console.log(`  audit_standards inseriti/upserted: ${auditStandardsCount}`)
  console.log(`  calendar_events inseriti/upserted: ${eventsCount}`)
  console.log(`  audit integrati legacy contati: ${integratedLegacyCount}`)
}

main().catch((error) => {
  console.error('\nSeed failed:')
  console.error(error)
  process.exit(1)
})
