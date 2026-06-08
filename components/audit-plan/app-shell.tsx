import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f4f6fa] text-ink-800">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
