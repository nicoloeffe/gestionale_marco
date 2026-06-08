'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function ClientiPage() {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('clients')
        .select('*')
        .eq('active', true)
        .order('company_name')
      if (search.trim()) {
        query = query.ilike('company_name', `%${search}%`)
      }
      const { data } = await query.limit(100)
      setClients(data ?? [])
      setLoading(false)
    }
    load()
  }, [search])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Clienti</h2>
        <p className="text-slate-500 mt-1">{clients.length} clienti trovati</p>
      </div>

      <Input
        placeholder="Cerca cliente..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <p className="text-slate-400 text-sm">Caricamento...</p>
      ) : (
        <div className="grid gap-3">
          {clients.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-slate-800">{c.company_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {[c.region, c.province].filter(Boolean).join(' · ')}
                    {c.ea_code ? ` · EA ${c.ea_code}` : ''}
                  </p>
                  {c.needs_review && (
                    <p className="text-xs text-amber-600 mt-1">⚠ Da verificare</p>
                  )}
                </div>
                <Badge variant={c.active ? 'default' : 'secondary'}>
                  {c.active ? 'Attivo' : 'Inattivo'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}