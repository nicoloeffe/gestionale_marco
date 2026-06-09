'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Building2,
  CalendarDays,
  Check,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoutButton } from './logout-button'
import { getCurrentProfile } from './calendar/repository'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, section: 'Operativo' },
  { href: '/calendario', label: 'Calendario', icon: CalendarDays, section: 'Operativo', badge: '23' },
  { href: '/audit', label: 'Audit / Eventi', icon: ClipboardList, section: 'Operativo' },
  { href: '/clienti', label: 'Aziende', icon: Building2, section: 'Anagrafiche' },
  { href: '/auditor', label: 'Auditor', icon: Users, section: 'Anagrafiche' },
  { href: '/norme', label: 'Norme', icon: ShieldCheck, section: 'Anagrafiche' },
  { href: '/import', label: 'Import dati', icon: Upload, section: 'Strumenti' },
  { href: '/settings', label: 'Impostazioni', icon: Settings, section: 'Strumenti' },
]

const sections = ['Operativo', 'Anagrafiche', 'Strumenti']

export function Sidebar() {
  const pathname = usePathname()
  const [profile, setProfile] = useState({ name: 'Utente', email: '' })

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const data = await getCurrentProfile()
        if (!active) return
        setProfile({
          name: data.full_name ?? data.email ?? 'Utente',
          email: data.email ?? '',
        })
      } catch {
        if (!active) return
        setProfile({ name: 'Profilo non configurato', email: '' })
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [])

  return (
    <aside className="flex h-screen w-[244px] shrink-0 flex-col border-r border-ink-200 bg-white">
      <div className="flex h-14 items-center gap-2.5 border-b border-ink-100 px-4">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm">
          <Check className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div className="leading-tight">
          <div className="text-[13.5px] font-semibold tracking-tight text-ink-800">AuditPlan</div>
          <div className="-mt-0.5 text-[10.5px] text-ink-400">Demo Group · v0.4 MVP</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 py-3">
        {sections.map((section) => (
          <div key={section} className={section === 'Operativo' ? '' : 'pt-4'}>
            <div className="px-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">{section}</div>
            <div className="space-y-0.5">
              {nav
                .filter((item) => item.section === section)
                .map(({ href, label, icon: Icon, badge }) => {
                  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'group flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13.5px] transition-colors',
                        active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-800'
                      )}
                    >
                      <span className={active ? 'text-brand-600' : 'text-ink-400 group-hover:text-ink-600'}>
                        <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                      </span>
                      <span className="flex-1 text-left">{label}</span>
                      {badge ? (
                        <span
                          className={cn(
                            'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold',
                            active ? 'bg-brand-600 text-white' : 'bg-ink-200 text-ink-700'
                          )}
                        >
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-100 p-3">
        <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-ink-50">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-[11px] font-semibold text-white shadow-sm ring-2 ring-white">
            NL
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-ink-800">{profile.name}</div>
            <div className="truncate text-[11px] text-ink-500">{profile.email || 'Profilo locale'}</div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}
