'use client'

import { usePathname } from 'next/navigation'

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
        <div className="hidden rounded-lg border border-ink-200 bg-ink-50 px-3 py-1.5 text-[12px] font-medium text-ink-500 sm:block">
          R1 operativo
        </div>
      </div>
    </header>
  )
}
