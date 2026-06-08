'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function AuditorPage() {
  const [auditors, setAuditors] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase
      .from('auditors')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setAuditors(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Auditor</h2>
        <p className="text-slate-500 mt-1">{auditors.length} auditor nel sistema</p>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Caricamento...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {auditors.map(a => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: a.color }}
                >
                  {a.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{a.name}</p>
                  {a.email && <p className="text-xs text-slate-400 truncate">{a.email}</p>}
                </div>
                <Badge variant={a.active ? 'default' : 'secondary'}>
                  {a.active ? 'Attivo' : 'Inattivo'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}