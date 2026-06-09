import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSupabaseEnv } from '@/lib/env'

describe('getSupabaseEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reports Supabase configuration as missing when public env vars are absent', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

    expect(getSupabaseEnv()).toEqual({
      url: '',
      anonKey: '',
      isConfigured: false,
    })
  })

  it('reports Supabase configuration as present when public env vars exist', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')

    expect(getSupabaseEnv()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
      isConfigured: true,
    })
  })
})
