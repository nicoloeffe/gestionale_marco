'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <button
      aria-label="Esci"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800"
      onClick={logout}
      title="Esci"
      type="button"
    >
      <LogOut className="h-4 w-4" />
    </button>
  )
}
