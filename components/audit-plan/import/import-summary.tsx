import { CheckCircle2, Table } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, Pill, SectionTitle } from '../ui'
import type { ImportStep, ImportSummaryData } from './import-data'
import type { PickedFile } from './upload-card'

export function ImportSummary({
  step,
  file,
  summary,
}: {
  step: ImportStep
  file: PickedFile | null
  summary: ImportSummaryData
}) {
  return (
    <Card className="col-span-2">
      <SectionTitle
        title="2. Riepilogo import"
        sub={step === 'done' ? `File "${file?.name}" analizzato con successo.` : 'Carica e analizza un file per vedere il riepilogo.'}
        action={step === 'done' ? <Pill status="effettuato" size="sm" /> : null}
      />
      {step !== 'done' ? (
        <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 px-6 py-12 text-center">
          <Table className="mx-auto h-8 w-8 text-ink-300" />
          <div className="mt-2 text-[13px] text-ink-600">Il riepilogo apparira qui dopo l'analisi.</div>
          <div className="mt-1 text-[12px] text-ink-400">Stima: circa 2 secondi per 1.000 righe.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Righe lette', value: summary.rows, tone: 'ink' },
              { label: 'Eventi validi', value: summary.valid, tone: 'emerald' },
              { label: 'Righe con errore', value: summary.errors, tone: 'rose' },
              { label: 'Aziende nuove', value: summary.newClients, tone: 'amber' },
              { label: 'Auditor nuovi', value: summary.newAuditors, tone: 'amber' },
              { label: 'Duplicati skippati', value: summary.duplicates, tone: 'ink' },
            ].map((item) => {
              const tones = {
                ink: 'bg-ink-50 text-ink-700 ring-ink-200',
                emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
                rose: 'bg-rose-50 text-rose-800 ring-rose-200',
                amber: 'bg-amber-50 text-amber-900 ring-amber-200',
              }[item.tone]

              return (
                <div key={item.label} className={cn('rounded-lg p-3 ring-1', tones)}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{item.label}</div>
                  <div className="mt-0.5 text-[24px] font-semibold tabular-nums tracking-tight">{item.value}</div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div className="text-[12.5px] text-emerald-900">
              <b>{summary.valid} eventi pronti all'import.</b> Risolvi le {summary.errors} righe con errore per portarli a {summary.rows - summary.duplicates}.
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
