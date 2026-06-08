'use client'

import { AlertTriangle, FileText, X } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from './page-header'
import { Btn } from './ui'
import { ImportPreviewTable } from './import/import-preview-table'
import { ImportSummary } from './import/import-summary'
import { previewRows, summary, type ImportStep } from './import/import-data'
import { type PickedFile, UploadCard } from './import/upload-card'

export function ImportScreen() {
  const [step, setStep] = useState<ImportStep>('idle')
  const [file, setFile] = useState<PickedFile | null>(null)

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-10 pt-6">
      <PageHeader
        breadcrumb="Strumenti · Import dati"
        title="Import dati / Migrazione"
        desc="Importa il foglio Excel/CSV ricevuto dal vecchio gestionale. Il sistema esegue analisi e normalizzazione: nessun dato verra scritto in modo definitivo prima della tua conferma."
        secondary={
          <Btn variant="ghost" icon={FileText}>
            Scarica template Excel
          </Btn>
        }
      />

      <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="text-[13.5px] font-semibold text-amber-900">La migrazione definitiva sara validata manualmente prima dell'import finale</div>
          <p className="mt-1 text-[12.5px] leading-snug text-amber-800/90">
            In questa fase MVP ogni file caricato genera un'anteprima normalizzata sandbox. Conferma riga per riga, o l'intero set, per scrivere i dati nel database in una fase successiva.
          </p>
        </div>
        <Btn variant="ghost" size="sm" icon={X} aria-label="Chiudi avviso" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <UploadCard file={file} setFile={setFile} step={step} setStep={setStep} />
        <ImportSummary step={step} file={file} summary={summary} />
        <ImportPreviewTable step={step} rows={previewRows} summary={summary} />
      </div>
    </div>
  )
}
