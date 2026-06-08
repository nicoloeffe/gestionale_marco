// Lista eventi/audit — table view with filters, search, badges, actions

const ListScreen = ({ events, onPickEvent, onNew, onEdit }) => {
  const [filters, setFilters] = React.useState(initialFilters);
  const [sort, setSort] = React.useState({ key:'inizio', dir:'asc' });
  const [period, setPeriod] = React.useState('all');

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const filtered = React.useMemo(() => {
    let arr = events.filter(e => {
      if (filters.auditor !== 'all' && !e.auditorIds.includes(filters.auditor)) return false;
      if (filters.azienda !== 'all' && e.aziendaId !== filters.azienda) return false;
      if (filters.norma   !== 'all' && !e.normeIds.includes(filters.norma)) return false;
      if (filters.status  !== 'all' && e.status !== filters.status) return false;
      if (filters.effettuato === 'si' && !e.effettuato) return false;
      if (filters.effettuato === 'no' &&  e.effettuato) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        const a = aziendaOf(e); const ns = normeOf(e).map(n=>n.codice).join(' ');
        const us = auditorsOf(e).map(u=>u.nome).join(' ');
        if (!((a?.nome||'').toLowerCase().includes(q) || ns.toLowerCase().includes(q) || us.toLowerCase().includes(q) || (e.numero||'').toLowerCase().includes(q))) return false;
      }
      if (period !== 'all') {
        const d = new Date(e.inizio); const today = new Date(2026,4,8);
        if (period === 'week') {
          const diff = (d - today)/(1000*60*60*24);
          if (diff < -3 || diff > 7) return false;
        } else if (period === 'month') {
          if (d.getMonth() !== today.getMonth() || d.getFullYear() !== today.getFullYear()) return false;
        } else if (period === 'past') {
          if (d >= today) return false;
        } else if (period === 'future') {
          if (d < today) return false;
        }
      }
      return true;
    });
    arr.sort((a,b) => {
      const kA = a[sort.key], kB = b[sort.key];
      const cmp = (kA||'') > (kB||'') ? 1 : (kA||'') < (kB||'') ? -1 : 0;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [events, filters, sort, period]);

  const SortHeader = ({ k, label, align='left' }) => (
    <button onClick={()=>setSort(s => ({ key:k, dir: s.key===k && s.dir==='asc' ? 'desc' : 'asc' }))} className={cx('inline-flex items-center gap-1 group hover:text-ink-800', align==='right' && 'flex-row-reverse')}>
      {label}
      <span className={cx('text-ink-300', sort.key===k && 'text-ink-600')}>
        <Icon name={sort.key===k ? (sort.dir==='asc' ? 'chev-d' : 'chev-d') : 'sort'} className="w-3 h-3" />
      </span>
    </button>
  );

  const stats = {
    totale: filtered.length,
    pianificati: filtered.filter(e => ['pianificato','confermato'].includes(e.status)).length,
    effettuati: filtered.filter(e => e.effettuato).length,
    daRiprog: filtered.filter(e => e.status==='da_riprogrammare').length,
  };

  return (
    <div className="px-6 pt-6 pb-10 max-w-[1440px] mx-auto">
      <PageHeader
        breadcrumb="Pianificazione · Audit / Eventi"
        title="Lista Audit"
        desc="Tutti gli eventi audit con filtri avanzati per periodo, auditor, azienda, norma e stato. Apri un evento per vederne il dettaglio o modificarlo."
        secondary={<Btn variant="secondary" icon="download">Esporta CSV</Btn>}
        primary={<Btn variant="primary" icon="plus" onClick={onNew}>Nuovo evento</Btn>}
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard label="Risultati filtro" value={stats.totale} hint={`su ${events.length} totali`} icon="list" />
        <KpiCard label="Pianificati" value={stats.pianificati} icon="pin" accent="bg-brand-50 text-brand-600" />
        <KpiCard label="Effettuati" value={stats.effettuati} icon="check-circle" accent="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Da riprogrammare" value={stats.daRiprog} icon="alert" accent="bg-amber-50 text-amber-600" />
      </div>

      <Card padded={false} className="overflow-visible">
        {/* Filter row 1 — search + period */}
        <div className="p-3 flex items-center gap-2 border-b border-ink-100">
          <Input icon="search" placeholder="Cerca per azienda, auditor, n. audit, norma…" className="w-[340px]" value={filters.q} onChange={(e)=>setF('q',e.target.value)} />
          <div className="w-px h-6 bg-ink-200 mx-1" />
          <div className="inline-flex bg-ink-100 rounded-lg p-0.5">
            {[
              {v:'all', l:'Tutti'},
              {v:'past', l:'Passati'},
              {v:'week', l:'Settimana'},
              {v:'month',l:'Mese'},
              {v:'future',l:'Futuri'},
            ].map(p => (
              <button key={p.v} onClick={()=>setPeriod(p.v)} className={cx('h-7 px-3 text-[12.5px] font-medium rounded-md', period===p.v ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-600 hover:text-ink-800')}>{p.l}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Btn variant="ghost" size="sm" icon="columns">Colonne</Btn>
            <Btn variant="ghost" size="sm" icon="sort">Ordinamento</Btn>
          </div>
        </div>

        {/* Filter row 2 — selects */}
        <div className="p-3 flex flex-wrap items-center gap-2 border-b border-ink-100 bg-ink-50/40">
          <Select value={filters.auditor} onChange={(e)=>setF('auditor',e.target.value)} className="w-[180px]">
            <option value="all">Tutti gli auditor</option>
            {AUDITOR.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </Select>
          <Select value={filters.azienda} onChange={(e)=>setF('azienda',e.target.value)} className="w-[220px]">
            <option value="all">Tutte le aziende</option>
            {AZIENDE.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </Select>
          <Select value={filters.norma} onChange={(e)=>setF('norma',e.target.value)} className="w-[170px]">
            <option value="all">Tutte le norme</option>
            {NORME.map(n => <option key={n.id} value={n.id}>{n.codice}</option>)}
          </Select>
          <Select value={filters.status} onChange={(e)=>setF('status',e.target.value)} className="w-[170px]">
            <option value="all">Qualsiasi stato</option>
            {Object.values(STATUSES).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
          <Select value={filters.effettuato} onChange={(e)=>setF('effettuato',e.target.value)} className="w-[160px]">
            <option value="all">Effettuato (tutti)</option>
            <option value="si">Solo effettuati</option>
            <option value="no">Non effettuati</option>
          </Select>
          {(Object.values(filters).some(v => v && v !== 'all') || period!=='all') && (
            <Btn variant="ghost" size="sm" onClick={()=>{ setFilters(initialFilters); setPeriod('all'); }}>Pulisci filtri</Btn>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] font-semibold uppercase tracking-wider text-ink-500 bg-white border-b border-ink-200">
                <th className="px-3 py-2.5 w-8"><input type="checkbox" className="rounded border-ink-300" /></th>
                <th className="px-3 py-2.5"><SortHeader k="inizio" label="Data inizio" /></th>
                <th className="px-3 py-2.5"><SortHeader k="fine"   label="Data fine" /></th>
                <th className="px-3 py-2.5"><SortHeader k="aziendaId" label="Azienda" /></th>
                <th className="px-3 py-2.5">Auditor</th>
                <th className="px-3 py-2.5">Norma</th>
                <th className="px-3 py-2.5">N. audit</th>
                <th className="px-3 py-2.5">Tipo</th>
                <th className="px-3 py-2.5"><SortHeader k="status" label="Stato" /></th>
                <th className="px-3 py-2.5">Eff.</th>
                <th className="px-3 py-2.5 w-20 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map(e => {
                const a = aziendaOf(e); const us = auditorsOf(e); const ns = normeOf(e);
                const start = new Date(e.inizio); const end = new Date(e.fine);
                return (
                  <tr key={e.id} className="hover:bg-brand-50/30 group">
                    <td className="px-3 py-2.5"><input type="checkbox" className="rounded border-ink-300" /></td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="font-medium text-ink-800 tabular-nums">{fmtDate(start)}</div>
                      <div className="text-[11.5px] text-ink-500 tabular-nums">{fmtTime(start)}</div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="text-ink-700 tabular-nums">{fmtDate(end)}</div>
                      <div className="text-[11.5px] text-ink-500 tabular-nums">{fmtTime(end)}</div>
                    </td>
                    <td className="px-3 py-2.5 max-w-[260px]">
                      {a ? (
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-gradient-to-br from-brand-100 to-brand-300 inline-flex items-center justify-center text-[10px] font-semibold text-brand-800 shrink-0">{a.nome.slice(0,2).toUpperCase()}</span>
                          <div className="min-w-0">
                            <div className="font-medium text-ink-800 truncate">{a.nome}</div>
                            <div className="text-[11.5px] text-ink-500">{a.ente}</div>
                          </div>
                        </div>
                      ) : <span className="text-ink-400 italic">— Senza azienda</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {us.length ? (
                        <div className="flex items-center -space-x-1.5">
                          {us.slice(0,3).map(u => <Avatar key={u.id} user={u} size="sm" />)}
                          {us.length>3 ? <span className="ml-2 text-[11.5px] text-ink-500">+{us.length-3}</span> : null}
                        </div>
                      ) : <span className="text-amber-700 inline-flex items-center gap-1 text-[12px]"><Icon name="alert" className="w-3.5 h-3.5"/> non assegnato</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {ns.slice(0,2).map(n => <span key={n.id} className="inline-flex items-center h-5 px-1.5 rounded bg-indigo-50 text-indigo-800 text-[11px] font-mono ring-1 ring-indigo-100">{n.codice}</span>)}
                        {ns.length>2 ? <span className="text-[11.5px] text-ink-500">+{ns.length-2}</span> : null}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-ink-700 whitespace-nowrap">{e.numero}</td>
                    <td className="px-3 py-2.5 text-ink-700">{e.tipo}</td>
                    <td className="px-3 py-2.5"><Pill status={e.status} size="sm" /></td>
                    <td className="px-3 py-2.5">
                      {e.effettuato
                        ? <span className="inline-flex items-center gap-1 text-emerald-700 text-[12px] font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sì</span>
                        : <span className="inline-flex items-center gap-1 text-ink-400 text-[12px]"><span className="w-1.5 h-1.5 rounded-full bg-ink-300" /> No</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="inline-flex items-center gap-0.5 opacity-60 group-hover:opacity-100">
                        <button onClick={()=>onPickEvent(e)} title="Apri" className="w-7 h-7 rounded inline-flex items-center justify-center text-ink-500 hover:bg-ink-100"><Icon name="doc" className="w-4 h-4" /></button>
                        <button onClick={()=>onEdit(e)} title="Modifica" className="w-7 h-7 rounded inline-flex items-center justify-center text-ink-500 hover:bg-ink-100"><Icon name="edit" className="w-4 h-4" /></button>
                        <button title="Annulla / Elimina" className="w-7 h-7 rounded inline-flex items-center justify-center text-ink-500 hover:bg-rose-50 hover:text-rose-700"><Icon name="trash" className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && (
                <tr><td colSpan={11} className="px-6 py-12 text-center text-ink-500">
                  <div className="inline-flex flex-col items-center gap-2">
                    <Icon name="search" className="w-6 h-6 text-ink-300" />
                    <div className="text-[13.5px] font-medium text-ink-700">Nessun evento corrisponde ai filtri</div>
                    <div className="text-[12.5px]">Prova a modificare i criteri o <button onClick={()=>{setFilters(initialFilters); setPeriod('all');}} className="text-brand-700 hover:underline">azzera tutto</button>.</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-3 py-2.5 flex items-center justify-between border-t border-ink-100 text-[12.5px] text-ink-500">
          <div>Mostrati <b className="text-ink-700">{filtered.length}</b> di {events.length} eventi</div>
          <div className="flex items-center gap-1">
            <button className="h-7 px-2.5 rounded text-ink-500 hover:bg-ink-100">‹ Precedente</button>
            <span className="h-7 px-2.5 inline-flex items-center rounded bg-ink-100 text-ink-700 font-medium">1</span>
            <span className="h-7 px-2.5 inline-flex items-center rounded text-ink-500 hover:bg-ink-100 cursor-pointer">2</span>
            <span className="h-7 px-2.5 inline-flex items-center rounded text-ink-500 hover:bg-ink-100 cursor-pointer">3</span>
            <button className="h-7 px-2.5 rounded text-ink-500 hover:bg-ink-100">Successivo ›</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

Object.assign(window, { ListScreen });
