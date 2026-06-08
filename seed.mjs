// seed.mjs
// Carica i JSON generati da import_excel.py su Supabase
// Uso: node seed.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function load(file) {
  return JSON.parse(readFileSync(`./output/${file}`, 'utf-8'))
}

async function insertBatch(table, rows, batchSize = 50) {
  let inserted = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from(table).insert(batch)
    if (error) {
      console.error(`Errore su ${table} batch ${i}:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\r  ${table}: ${inserted}/${rows.length}`)
    }
  }
  console.log()
}

async function main() {
  console.log('Caricamento dati su Supabase...\n')

  const auditors = load('auditors.json')
  const clients  = load('clients.json')
  const audits   = load('audits.json')
  const events   = load('calendar_events.json')

  console.log('Inserimento auditor...')
  await insertBatch('auditors', auditors)

  console.log('Inserimento clienti...')
  await insertBatch('clients', clients)

  console.log('Inserimento audit...')
  await insertBatch('audits', audits)

  console.log('Inserimento eventi calendario...')
  await insertBatch('calendar_events', events)

  console.log('\nFatto.')
}

main()
