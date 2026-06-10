'use client'

import { AlertTriangle, CheckCircle2, LogIn } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Btn, Field, Input } from '@/components/audit-plan/ui'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
}

function LoginFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6fa] px-4">
      <section className="w-full max-w-[420px] rounded-xl border border-ink-200 bg-white p-6 shadow-card">
        <div className="h-6 w-44 rounded bg-ink-100" />
        <div className="mt-3 h-4 w-64 rounded bg-ink-100" />
      </section>
    </main>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const missingConfig = searchParams.get('missing_config') === '1'
  const authError = searchParams.get('error') === '1'
  const nextPath = searchParams.get('next') || '/'

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6fa] px-4">
      <section className="w-full max-w-[420px] rounded-xl border border-ink-200 bg-white p-6 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-[20px] font-semibold text-ink-900">Accesso AuditPlan</h1>
            <p className="mt-0.5 text-[13px] text-ink-500">Usa le credenziali assegnate dall&apos;amministratore.</p>
          </div>
        </div>

        {missingConfig ? (
          <div className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Configura le variabili Supabase in `.env.local` prima di accedere.
          </div>
        ) : null}

        {authError ? (
          <div className="mb-4 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Credenziali non valide o utente non abilitato.
          </div>
        ) : null}

        <form action="/auth/login" className="space-y-4" method="post">
          <input name="next" type="hidden" value={nextPath} />
          <Field label="Email" required>
            <Input
              autoComplete="email"
              inputMode="email"
              name="email"
              placeholder="nome@azienda.it"
              type="email"
            />
          </Field>
          <Field label="Password" required>
            <Input
              autoComplete="current-password"
              name="password"
              placeholder="Password"
              type="password"
            />
          </Field>
          <Btn className="w-full" disabled={missingConfig} icon={LogIn} type="submit" variant="primary">
            Entra
          </Btn>
        </form>
      </section>
    </main>
  )
}
