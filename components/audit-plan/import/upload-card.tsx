'use client'

import { Check, Sparkles, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Btn, Card, SectionTitle } from '../ui'
import type { ImportStep } from './import-data'

export type PickedFile = {
  name: string
  size: number
}

export function UploadCard({
  file,
  setFile,
  step,
  setStep,
}: {
  file: PickedFile | null
  setFile: (file: PickedFile | null) => void
  step: ImportStep
  setStep: (step: ImportStep) => void
}) {
  const [drag, setDrag] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pickFile = (selected: File | undefined) => {
    if (!selected) return
    setFile({ name: selected.name, size: selected.size })
    setStep('idle')
  }

  const analyze = () => {
    setStep('analyzing')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setStep('done'), 1400)
  }

  return (
    <Card>
      <SectionTitle title="1. Carica file" sub="Excel (.xlsx) o CSV - max 10 MB" />
      <label
        onDragOver={(event) => {
          event.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDrag(false)
          pickFile(event.dataTransfer.files[0])
        }}
        className={cn(
          'block cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors',
          drag ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-ink-50/40 hover:border-ink-300 hover:bg-ink-50'
        )}
      >
        <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={(event) => pickFile(event.target.files?.[0])} />
        <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink-200 bg-white text-brand-600">
          <Upload className="h-5 w-5" />
        </div>
        <div className="text-[13.5px] font-medium text-ink-800">{file ? file.name : 'Trascina qui il file o clicca per selezionarlo'}</div>
        <div className="mt-1 text-[12px] text-ink-500">{file ? `${Math.round(file.size / 1024)} KB · pronto per analisi` : 'Estensioni supportate: .xlsx, .csv'}</div>
      </label>

      <div className="mt-4 space-y-2.5 text-[12.5px] text-ink-600">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" /> Encoding UTF-8 / Latin-1 rilevato automaticamente
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" /> Separatori riconosciuti: <code className="font-mono">,</code> <code className="font-mono">;</code> <code className="font-mono">tab</code>
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" /> Mappatura colonne con il template ufficiale
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Btn variant="primary" icon={Sparkles} onClick={analyze} disabled={!file || step === 'analyzing'}>
          {step === 'analyzing' ? 'Analisi in corso...' : 'Analizza file'}
        </Btn>
        <Btn
          variant="ghost"
          icon={X}
          onClick={() => {
            setFile(null)
            setStep('idle')
          }}
        >
          Reset
        </Btn>
      </div>
    </Card>
  )
}
