import { AlertTriangle, Check, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Btn, Card, Pill } from '../ui'
import type { ImportPreviewRow, ImportStep, ImportSummaryData } from './import-data'
import { issueLabels } from './import-data'

export function ImportPreviewTable({
  step,
  rows,
  summary,
}: {
  step: ImportStep
  rows: ImportPreviewRow[]
  summary: ImportSummaryData
}) {
  return (
    <Card className="col-span-3" padded={false}>
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <div>
          <h3 className="text-[14px] font-semibold text-ink-800">3. Anteprima dati normalizzati</h3>
          <p className="mt-0.5 text-[12px] text-ink-500">Solo lettura - nessun dato e stato scritto. Le righe rosse richiedono mappatura prima di confermare.</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="ghost" size="sm" icon={Filter}>
            Solo errori
          </Btn>
          <Btn variant="secondary" size="sm" disabled={step !== 'done'}>
            Esporta report
          </Btn>
          <Btn variant="primary" size="sm" icon={Check} disabled={step !== 'done'}>
            Conferma e importa
          </Btn>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              <th className="w-14 px-3 py-2">Riga</th>
              <th className="px-3 py-2">Azienda</th>
              <th className="px-3 py-2">Auditor</th>
              <th className="px-3 py-2">Norma</th>
              <th className="px-3 py-2">Data / Ora</th>
              <th className="px-3 py-2">Stato</th>
              <th className="px-3 py-2">Anomalie</th>
              <th className="w-32 px-3 py-2 text-right">Azione</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((row) => {
              const issue = row.issue ? issueLabels[row.issue] : null
              const tone = issue?.tone === 'rose' ? 'bg-rose-50/30' : issue?.tone === 'amber' ? 'bg-amber-50/30' : ''
              const issueClass = issue?.tone === 'rose' ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-amber-50 text-amber-800 ring-amber-200'

              return (
                <tr key={row.row} className={cn('hover:bg-ink-50/60', tone)}>
                  <td className="px-3 py-2 font-mono text-[12px] text-ink-500">{row.row}</td>
                  <td className="px-3 py-2 text-ink-800">{row.client}</td>
                  <td className="px-3 py-2 text-ink-700">{row.auditor}</td>
                  <td className="px-3 py-2 font-mono text-[12px] text-indigo-800">{row.standard}</td>
                  <td className="px-3 py-2 tabular-nums text-ink-700">{row.date}</td>
                  <td className="px-3 py-2">
                    <Pill status={row.status} size="sm" />
                  </td>
                  <td className="px-3 py-2">
                    {issue ? (
                      <span className={cn('inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11.5px] font-medium ring-1', issueClass)}>
                        <AlertTriangle className="h-3 w-3" /> {issue.text}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-700">
                        <Check className="h-3.5 w-3.5" /> ok
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {row.issue ? (
                      <Btn variant="secondary" size="sm">
                        Mappa
                      </Btn>
                    ) : (
                      <span className="text-[12px] text-ink-400">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3 text-[12.5px] text-ink-500">
        <span>
          Mostrando 9 di {summary.rows} righe · {summary.errors} con errore
        </span>
        <button className="font-medium text-brand-700 hover:underline">Mostra tutte</button>
      </div>
    </Card>
  )
}
