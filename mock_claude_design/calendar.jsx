// Calendar / Pianificazione Audit — month view + filters + KPI strip + legend

const initialFilters = {
  q: '',
  auditor: 'all',
  azienda: 'all',
  norma: 'all',
  status: 'all',
  effettuato: 'all',
};

const useFilteredEvents = (events, filters) => React.useMemo(() => {
  return events.filter(e => {
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
    return true;
  });
}, [events, filters]);

const FilterChip = ({ label, value, onClear }) => (
  <span className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-full bg-brand-50 text-brand-700 text-[12px] font-medium ring-1 ring-brand-100">
    <span className="text-brand-500">{label}:</span> {value}
    <button onClick={onClear} className="w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-brand-100"><Icon name="x" className="w-3 h-3" /></button>
  </span>
);

const FilterBar = ({ filters, setFilters, count, total }) => {
  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const active = Object.entries(filters).filter(([k,v]) => v && v !== 'all' && (k!=='q' || v));
  return (
    <Card padded={false} className="overflow-visible">
      <div className="px-2.5 py-2 flex flex-wrap items-center gap-1.5">
        <Input icon="search" placeholder="Cerca evento, azienda, auditor, n. audit…" className="w-[260px] h-8 text-[12.5px]" value={filters.q} onChange={(e)=>setF('q',e.target.value)} />
        <div className="w-px h-5 bg-ink-200 mx-0.5" />
        <Select value={filters.auditor} onChange={(e)=>setF('auditor',e.target.value)} className="w-[150px] h-8 text-[12.5px]">
          <option value="all">Tutti gli auditor</option>
          {AUDITOR.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </Select>
        <Select value={filters.azienda} onChange={(e)=>setF('azienda',e.target.value)} className="w-[180px] h-8 text-[12.5px]">
          <option value="all">Tutte le aziende</option>
          {AZIENDE.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </Select>
        <Select value={filters.norma} onChange={(e)=>setF('norma',e.target.value)} className="w-[140px] h-8 text-[12.5px]">
          <option value="all">Tutte le norme</option>
          {NORME.map(n => <option key={n.id} value={n.id}>{n.codice}</option>)}
        </Select>
        <Select value={filters.status} onChange={(e)=>setF('status',e.target.value)} className="w-[150px] h-8 text-[12.5px]">
          <option value="all">Qualsiasi stato</option>
          {Object.values(STATUSES).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </Select>
        <Select value={filters.effettuato} onChange={(e)=>setF('effettuato',e.target.value)} className="w-[140px] h-8 text-[12.5px]">
          <option value="all">Effettuato (tutti)</option>
          <option value="si">Solo effettuati</option>
          <option value="no">Non effettuati</option>
        </Select>
        <div className="ml-auto flex items-center gap-2 pr-1">
          <span className="text-[11.5px] text-ink-500"><b className="text-ink-700 tabular-nums">{count}</b>/{total} eventi</span>
          {active.length>0 ? <Btn variant="ghost" size="sm" onClick={()=>setFilters(initialFilters)}>Pulisci</Btn> : null}
        </div>
      </div>
    </Card>
  );
};

// Compute per-day events with up to N visible
const groupByDay = (events) => {
  const map = {};
  events.forEach(e => {
    const d = new Date(e.inizio);
    // Span days: write into each day in [start..end]
    const end = new Date(e.fine);
    const cur = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    while (cur <= last) {
      const iso = cur.toISOString().slice(0,10);
      (map[iso] = map[iso] || []).push(e);
      cur.setDate(cur.getDate()+1);
    }
  });
  return map;
};

const EventChip = ({ e, onClick, compact }) => {
  const s = STATUSES[e.status];
  const a = aziendaOf(e); const ns = normeOf(e).map(n=>n.codice).join('+');
  const u = auditorsOf(e)[0];
  return (
    <button onClick={()=>onClick(e)} className={cx(
      'w-full text-left rounded-md px-1.5 py-1 ev ev-tight ring-1 truncate hover:translate-y-[-0.5px] hover:shadow-sm transition',
      s.barBg, s.barText, s.barBorder, 'border-l-2 ring-transparent'
    )} title={`${a?.nome} · ${ns} · ${u?.nome||'—'}`}>
      <div className="flex items-center gap-1">
        <span className="font-semibold truncate">{a ? a.nome : 'Senza azienda'}</span>
      </div>
      {!compact && (
        <div className="flex items-center justify-between gap-1 mt-0.5 opacity-90">
          <span className="truncate font-mono text-[10px]">{ns||'—'}</span>
          <span className="truncate text-[10.5px]">{u ? u.iniziali : '—'}</span>
        </div>
      )}
    </button>
  );
};

const DayPopover = ({ cell, events, onPickEvent, onClose, anchorRect }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [onClose]);
  // Position relative to anchor cell
  const pos = React.useMemo(() => {
    if (!anchorRect) return { top: 0, left: 0 };
    const W = 280;
    let left = anchorRect.left + anchorRect.width/2 - W/2 + window.scrollX;
    left = Math.max(8, Math.min(left, window.innerWidth - W - 8));
    let top = anchorRect.top + window.scrollY + 4;
    return { top, left, width: W };
  }, [anchorRect]);
  const d = cell.date;
  return ReactDOM.createPortal(
    <div ref={ref} className="fixed z-50 bg-white rounded-xl shadow-xl ring-1 ring-ink-200 overflow-hidden" style={{ top: pos.top, left: pos.left, width: pos.width }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-ink-100 bg-ink-50/60">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{DOW_IT[(d.getDay()+6)%7]}</span>
          <span className="text-[15px] font-semibold text-ink-900 tabular-nums">{d.getDate()}</span>
          <span className="text-[12px] text-ink-500">{MONTHS_IT[d.getMonth()]}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-ink-500">{events.length} audit</span>
          <button onClick={onClose} className="w-6 h-6 inline-flex items-center justify-center rounded text-ink-500 hover:bg-ink-100"><Icon name="x" className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="p-2 space-y-1 max-h-[280px] overflow-auto">
        {events.map(e => <EventChip key={e.id} e={e} onClick={(ev)=>{ onClose(); onPickEvent(ev); }} />)}
      </div>
      <div className="px-3 py-1.5 border-t border-ink-100 bg-ink-50/40 text-[10.5px] text-ink-500 flex items-center gap-1.5">
        <Icon name="info" className="w-3 h-3 text-ink-400" />
        Clicca un evento per aprire il dettaglio.
      </div>
    </div>,
    document.body
  );
};

const MonthGrid = ({ anchor, eventsByDay, onPickDate, onPickEvent, today }) => {
  const cells = monthGrid(anchor);
  const todayIso = today.toISOString().slice(0,10);
  const [expanded, setExpanded] = React.useState(null); // { iso, rect }
  return (
    <div className="bg-white border border-ink-200 rounded-xl overflow-hidden shadow-card">
      <div className="grid grid-cols-7 border-b border-ink-100 bg-ink-50">
        {DOW_IT.map(d => <div key={d} className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((c, i) => {
          const evs = eventsByDay[c.iso] || [];
          const MAX = 3;
          const visible = evs.slice(0, MAX);
          const hidden = evs.length - visible.length;
          const isToday = c.iso === todayIso;
          const isWeekend = (i % 7) >= 5;
          return (
            <div key={c.iso+i} data-day-cell="" className={cx(
              'min-h-[112px] px-1.5 py-1.5 border-b border-r border-ink-100 relative group',
              !c.inMonth && 'bg-ink-50/40',
              isWeekend && c.inMonth && 'bg-[#fafbfd]',
              (i+1) % 7 === 0 && 'border-r-0'
            )}>
              <div className="flex items-center justify-between mb-1 px-1">
                <span className={cx(
                  'text-[11.5px] tabular-nums',
                  c.inMonth ? 'text-ink-700' : 'text-ink-300',
                  isToday && 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white font-semibold'
                )}>{c.date.getDate()}</span>
                {c.inMonth && (
                  <button onClick={()=>onPickDate(c.date)} className="opacity-0 group-hover:opacity-100 w-5 h-5 inline-flex items-center justify-center rounded text-ink-500 hover:bg-ink-100" title="Nuovo evento in questa data">
                    <Icon name="plus" className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-1 px-0.5">
                {visible.map(e => <EventChip key={e.id+c.iso} e={e} onClick={onPickEvent} compact={evs.length>2} />)}
                {hidden>0 ? (
                  <button
                    onClick={(ev)=>{ ev.stopPropagation(); const r = ev.currentTarget.closest('[data-day-cell]').getBoundingClientRect(); setExpanded({ iso:c.iso, cell:c, rect:r }); }}
                    title={`Mostra tutti i ${evs.length} audit del giorno`}
                    className="w-full text-left text-[11px] font-medium text-brand-700 hover:text-brand-800 px-1.5 py-0.5 rounded hover:bg-brand-50 ring-0 hover:ring-1 hover:ring-brand-100 inline-flex items-center gap-1"
                  >
                    <Icon name="chev-d" className="w-3 h-3" />
                    +{hidden} altri
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {expanded && (
        <DayPopover
          cell={expanded.cell}
          events={eventsByDay[expanded.iso] || []}
          anchorRect={expanded.rect}
          onClose={()=>setExpanded(null)}
          onPickEvent={onPickEvent}
        />
      )}
    </div>
  );
};

const Legend = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
    <span className="text-[12px] font-medium text-ink-500">Legenda stati:</span>
    {Object.values(STATUSES).map(s => (
      <span key={s.id} className="inline-flex items-center gap-1.5 text-[12px] text-ink-700">
        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.dot }} />
        {s.label}
      </span>
    ))}
  </div>
);

const CalendarScreen = ({ events, onPickEvent, onNew }) => {
  const [filters, setFilters] = React.useState(initialFilters);
  const [anchor, setAnchor] = React.useState(new Date(2026, 4, 1));
  const [viewMode, setViewMode] = React.useState('mese');
  const today = new Date(2026, 4, 8);

  const filtered = useFilteredEvents(events, filters);
  const byDay = React.useMemo(() => groupByDay(filtered), [filtered]);

  const goPrev = () => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth()-1, 1));
  const goNext = () => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth()+1, 1));
  const goToday = () => setAnchor(new Date(today.getFullYear(), today.getMonth(), 1));

  // KPI counts (across filtered)
  const monthEvts = filtered.filter(e => {
    const d = new Date(e.inizio); return d.getFullYear()===anchor.getFullYear() && d.getMonth()===anchor.getMonth();
  });
  const kpis = {
    totale:        monthEvts.length,
    pianificati:   monthEvts.filter(e => ['pianificato','confermato'].includes(e.status)).length,
    effettuati:    monthEvts.filter(e => e.effettuato).length,
    daRiprog:      monthEvts.filter(e => e.status==='da_riprogrammare').length,
  };

  const kpiStats = [
    { label:'Eventi del mese', value:kpis.totale,       hint:`${MONTHS_IT[anchor.getMonth()]} ${anchor.getFullYear()}`, icon:'calendar',     tone:'ink' },
    { label:'Pianificati',     value:kpis.pianificati,  hint:'+4 vs Aprile',                                          icon:'pin',          tone:'brand' },
    { label:'Effettuati',      value:kpis.effettuati,   hint:`${Math.round(kpis.effettuati/Math.max(kpis.totale,1)*100)}% del mese`, icon:'check-circle', tone:'emerald' },
    { label:'Da riprogrammare',value:kpis.daRiprog,     hint:'Richiede azione',                                       icon:'alert',        tone:'amber' },
  ];
  const toneCls = {
    ink:     { bg:'bg-ink-100',     text:'text-ink-600' },
    brand:   { bg:'bg-brand-50',    text:'text-brand-600' },
    emerald: { bg:'bg-emerald-50',  text:'text-emerald-600' },
    amber:   { bg:'bg-amber-50',    text:'text-amber-600' },
  };

  return (
    <div className="px-6 pt-4 pb-10 max-w-[1440px] mx-auto">
      <div className="flex items-end justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-ink-400 uppercase tracking-wider mb-0.5">Pianificazione · Calendario</div>
          <h1 className="text-[22px] font-semibold text-ink-900 tracking-tight leading-tight">Pianificazione Audit</h1>
          <p className="text-[12.5px] text-ink-500 mt-0.5">Vista mensile per cliente, norma e auditor. Clicca un giorno per creare un evento.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Btn variant="secondary" icon="upload" disabled title="Disponibile dopo la migrazione">Importa dati</Btn>
          <Btn variant="primary" icon="plus" onClick={()=>onNew()}>Nuovo evento</Btn>
        </div>
      </div>

      {/* KPI strip — single compact row */}
      <Card padded={false} className="mb-2.5 overflow-hidden">
        <div className="grid grid-cols-4 divide-x divide-ink-100">
          {kpiStats.map((s, i) => {
            const t = toneCls[s.tone];
            return (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3 min-w-0">
                <span className={cx('w-9 h-9 rounded-lg inline-flex items-center justify-center shrink-0', t.bg, t.text)}>
                  <Icon name={s.icon} className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10.5px] font-medium text-ink-500 uppercase tracking-wider truncate">{s.label}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[20px] font-semibold text-ink-900 tabular-nums leading-none">{s.value}</span>
                    <span className="text-[11px] text-ink-400 truncate">{s.hint}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters */}
      <div className="mb-2.5">
        <FilterBar filters={filters} setFilters={setFilters} count={filtered.length} total={events.length} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Btn variant="secondary" size="sm" onClick={goToday}>Oggi</Btn>
          <div className="flex items-center bg-white rounded-lg border border-ink-200">
            <button onClick={goPrev} className="w-8 h-8 inline-flex items-center justify-center text-ink-600 hover:bg-ink-50 rounded-l-lg"><Icon name="chev-l" className="w-4 h-4" /></button>
            <button onClick={goNext} className="w-8 h-8 inline-flex items-center justify-center text-ink-600 hover:bg-ink-50 border-l border-ink-200 rounded-r-lg"><Icon name="chev-r" className="w-4 h-4" /></button>
          </div>
          <h3 className="ml-2 text-[18px] font-semibold text-ink-900 tracking-tight">{MONTHS_IT[anchor.getMonth()]} {anchor.getFullYear()}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-white border border-ink-200 rounded-lg p-0.5">
            {['Mese','Settimana','Giorno','Programma'].map(m => (
              <button key={m} onClick={()=>setViewMode(m.toLowerCase())} className={cx(
                'h-7 px-3 text-[12.5px] font-medium rounded-md transition-colors',
                viewMode===m.toLowerCase() ? 'bg-ink-800 text-white' : 'text-ink-600 hover:text-ink-800'
              )}>{m}</button>
            ))}
          </div>
          <Btn variant="ghost" size="sm" icon="download">Esporta</Btn>
        </div>
      </div>

      {/* Grid */}
      <MonthGrid anchor={anchor} eventsByDay={byDay} onPickDate={(d)=>onNew(d)} onPickEvent={onPickEvent} today={today} />

      {/* Legend */}
      <div className="mt-4 px-1">
        <Legend />
      </div>
    </div>
  );
};

Object.assign(window, { CalendarScreen });
