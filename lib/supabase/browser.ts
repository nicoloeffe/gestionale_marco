'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from '@/lib/env'

export function createSupabaseBrowserClient() {
  const { url, anonKey, isConfigured } = getSupabaseEnv()

  if (!isConfigured) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createBrowserClient(url!, anonKey!)
}
