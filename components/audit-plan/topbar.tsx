'use client'

import { Bell, CircleHelp, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Input, Kbd } from './ui'

const titles: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Dashboard', sub: 'Vista operativa di pianificazione' },
  '/calendario': { title: 'Calendario', sub: 'Pianificazione audit · Maggio 2026' },
  '/audit': { title: 'Audit / Eventi', sub: 'Lista completa con filtri' },
  '/clienti': { title: 'Aziende', sub: 'Anagrafica clienti' },
  '/auditor': { title: 'Auditor', sub: 'Anagrafica auditor' },
  '/norme': { title: 'Norme', sub: 'Standard certificabili' },
  '/import': { title: 'Import dati', sub: 'Migrazione da gestionale legacy' },
  '/settings': { title: 'Impostazioni', sub: 'Preferenze utente e sistema' },
}

function getTitle(pathname: string) {
  const exact = titles[pathname]
  if (exact) return exact

  const match = Object.entries(titles)
    .filter(([path]) => path !== '/' && pathname.startsWith(path))
    .map(([, value]) => value)[0]

  return match ?? titles['/']
}

export function Topbar() {
  const pathname = usePathname()
  const current = getTitle(pathname)

  return (
    <header className="sticky top-0 z-20 h-14 shrink-0 border-b border-ink-200 bg-white/90 backdrop-blur-sm">
      <div className="flex h-full items-center gap-4 px-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h1 className="truncate text-[15px] font-semibold text-ink-800">{current.title}</h1>
            <span className="truncate text-[12.5px] text-ink-500">{current.sub}</span>
          </div>
        </div>
        <div className="relative hidden w-[320px] lg:block">
          <Input icon={Search} placeholder="Cerca audit, aziende, auditor..." />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <Kbd>⌘K</Kbd>
          </span>
        </div>
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 hover:bg-ink-50">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
        </button>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 hover:bg-ink-50">
          <CircleHelp className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  )
}
