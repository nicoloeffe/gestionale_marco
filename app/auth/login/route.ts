import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseEnv } from '@/lib/env'

function safeNextPath(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' && value.startsWith('/') ? value : '/'
  return next
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const nextPath = safeNextPath(formData.get('next'))
  const { url, anonKey, isConfigured } = getSupabaseEnv()

  if (!isConfigured) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', nextPath)
    loginUrl.searchParams.set('missing_config', '1')
    return NextResponse.redirect(loginUrl)
  }

  let response = NextResponse.redirect(new URL(nextPath, request.url))
  const supabase = createServerClient(url!, anonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', nextPath)
    loginUrl.searchParams.set('error', '1')
    response = NextResponse.redirect(loginUrl)
  }

  return response
}
