'use client'

import { AlertTriangle, CheckCircle2, LogIn } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { FormEvent } from 'react'
import { Suspense } from 'react'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const missingConfig = searchParams.get('missing_config') === '1'
  const authError = searchParams.get('error') === '1'
  const nextPath = searchParams.get('next') || '/'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError('Credenziali non valide o utente non abilitato.')
        return
      }

      router.replace(nextPath)
      router.refresh()
    } catch {
      setError('Configurazione Supabase mancante o non valida.')
    } finally {
      setLoading(false)
    }
  }

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

        {error || authError ? (
          <div className="mb-4 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error ?? 'Credenziali non valide o utente non abilitato.'}
          </div>
        ) : null}

        <form action="/auth/login" className="space-y-4" method="post" onSubmit={handleSubmit}>
          <input name="next" type="hidden" value={nextPath} />
          <Field label="Email" required>
            <Input
              autoComplete="email"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@azienda.it"
              type="email"
              value={email}
            />
          </Field>
          <Field label="Password" required>
            <Input
              autoComplete="current-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              value={password}
            />
          </Field>
          <Btn className="w-full" disabled={loading || missingConfig} icon={LogIn} type="submit" variant="primary">
            {loading ? 'Accesso...' : 'Entra'}
          </Btn>
        </form>
      </section>
    </main>
  )
}
