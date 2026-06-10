import { createClient } from '@supabase/supabase-js'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local', quiet: true })

const url = process.env.PROD_SUPABASE_URL
const key = process.env.PROD_SUPABASE_ANON_KEY || process.env.PROD_SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing PROD_SUPABASE_URL and PROD_SUPABASE_ANON_KEY/PROD_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const candidates = [
  'profiles',
  'user_profiles',
  'clients',
  'auditors',
  'standards',
  'audits',
  'audit_standards',
  'calendar_events',
  'import_batches',
  'imported_rows',
  'events_full',
  'audits_full',
  'audits_with_client',
]

const societyHints = [
  'ente',
  'societa',
  'società',
  'company',
  'azienda',
  'client',
  'cliente',
  'auditor',
  'consultant',
  'consulente',
  'referrer',
  'referente',
  'segnalatore',
  'source',
  'import_month',
  'import_batch_id',
]

async function getOpenApi() {
  const response = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
    },
  })

  if (!response.ok) return { error: `${response.status} ${response.statusText}` }
  return response.json()
}

function schemaFor(openapi, name) {
  return openapi?.definitions?.[name] || openapi?.components?.schemas?.[name] || null
}

async function countAndSample(table) {
  const countResult = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (countResult.error) {
    return {
      table,
      exists: false,
      error: `${countResult.error.code || ''} ${countResult.error.message}`.trim(),
    }
  }

  const sampleResult = await supabase.from(table).select('*').limit(5)
  const sample = sampleResult.data || []
  const columns = Array.from(new Set(sample.flatMap((row) => Object.keys(row)))).sort()
  const hintColumns = columns.filter((column) => societyHints.some((hint) => column.toLowerCase().includes(hint)))
  const hintValues = {}

  for (const column of hintColumns) {
    hintValues[column] = Array.from(
      new Set(
        sample
          .map((row) => row[column])
          .filter((value) => value !== null && value !== undefined)
          .map((value) => (typeof value === 'object' ? JSON.stringify(value).slice(0, 120) : String(value).slice(0, 120)))
      )
    ).slice(0, 8)
  }

  return {
    table,
    exists: true,
    count: countResult.count,
    columns,
    hintColumns,
    hintValues,
    sampleError: sampleResult.error ? sampleResult.error.message : null,
  }
}

const openapi = await getOpenApi()
const exposed = openapi.paths ? Object.keys(openapi.paths).map((path) => path.replace(/^\//, '')).filter(Boolean).sort() : []
const names = Array.from(new Set([...candidates, ...exposed])).filter(Boolean)
const results = []

for (const table of names) {
  results.push(await countAndSample(table))
}

const schemas = {}
for (const name of names) {
  const schema = schemaFor(openapi, name)
  if (schema?.properties) {
    schemas[name] = Object.fromEntries(
      Object.entries(schema.properties).map(([column, value]) => [
        column,
        {
          type: value.type || null,
          format: value.format || null,
          description: value.description || null,
        },
      ])
    )
  }
}

console.log(JSON.stringify({
  projectRef: url.match(/^https:\/\/([^.]+)/)?.[1] ?? null,
  keyKind: key.startsWith('sb_publi') ? 'publishable/anon-like' : key.startsWith('sb_secret') ? 'secret-like' : 'jwt-like',
  openapiError: openapi.error || null,
  exposed,
  results,
  schemas,
}, null, 2))
