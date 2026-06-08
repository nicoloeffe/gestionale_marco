'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Users,
  UserCheck,
} from 'lucide-react'

const nav = [
  { href: '/',            label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/calendario',  label: 'Calendario', icon: Calendar },
  { href: '/audit',       label: 'Audit',      icon: ClipboardList },
  { href: '/clienti',     label: 'Clienti',    icon: Users },
  { href: '/auditor',     label: 'Auditor',    icon: UserCheck },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-lg font-semibold tracking-tight">Audit Planner</h1>
        <p className="text-xs text-slate-400 mt-0.5">Gestione pianificazione</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-500">
        v0.1 MVP
      </div>
    </aside>
  )
}
