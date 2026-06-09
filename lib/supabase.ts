import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

type SupabaseBrowserClient = ReturnType<typeof createSupabaseBrowserClient>

let browserClient: SupabaseBrowserClient | null = null

export function getSupabaseClient() {
  browserClient ??= createSupabaseBrowserClient()
  return browserClient
}

export const supabase = new Proxy({} as SupabaseBrowserClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseClient() as object, prop, receiver)
  },
})
