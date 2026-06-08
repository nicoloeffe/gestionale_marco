import type { Metadata } from 'next'
import { AppShell } from '@/components/audit-plan/app-shell'
import './globals.css'

export const metadata: Metadata = { title: 'AuditPlan' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
