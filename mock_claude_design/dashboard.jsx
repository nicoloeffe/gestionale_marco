// Dashboard — KPIs, prossimi audit, da controllare

const TinyBar = ({ data, max }) => (
  <div className="flex items-end gap-1 h-10">
    {data.map((d,i) => (
      <div key={i} className="flex-1 rounded-t" style={{ height:`${(d/max)*100}%`, background: i===data.length-1 ? '#3b66ee' : '#dde8ff' }} />
    ))}
  </div>
);

const DashboardScreen = ({ events, onPickEvent, onNew, goView }) => {
  const today = new Date(2026,4,8);
  const monthEvts = events.filter(e => { const d=new Date(e.inizio); return d.getMonth()===4 && d.getFullYear()===2026; });
  const stats = {
    totale: monthEvts.length,
    pianificati: monthEvts.filter(e => ['pianificato','confermato'].includes(e.status)).length,
    effettuati: monthEvts.filter(e => e.effettuato).length,
    daRiprog: monthEvts.filter(e => e.status==='da_riprogrammare').length,
  };
  const upcoming = events
    .filter(e => new Date(e.inizio) >= today && !e.effettuato)
    .sort((a,b)=> new Date(a.inizio) - new Date(b.inizio))
    .slice(0, 6);

  const senzaAuditor = events.filter(e => e.auditorIds.length === 0);
  const daConfermare = events.filter(e => e.status === 'bozza');
  const daRiprog = events.filter(e => e.status === 'da_riprogrammare');

  return (
    <div className="px-6 pt-6 pb-10 max-w-[1440px] mx-auto">
      <PageHeader
        breadcrumb="Operativo · Dashboard"
        title="Buongiorno, Pianificatore Demo 👋"
        desc="Ecco un riepilogo del tuo mese di pianificazione: 2 audit oggi, 4 da assegnare e 3 da riprogrammare."
        secondary={<Btn variant="secondary" icon="calendar" onClick={()=>goView('calendar')}>Apri calendario</Btn>}
        primary={<Btn variant="primary" icon="plus" onClick={onNew}>Nuovo evento</Btn>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard label="Eventi del mese" value={stats.totale} delta="+12% vs Aprile" deltaTone="up" icon="calendar" hint="Maggio 2026" />
        <KpiCard label="Pianificati" value={stats.pianificati} icon="pin" accent="bg-brand-50 text-brand-600" hint="Pronti all'esecuzione" />
        <KpiCard label="Effettuati" value={stats.effettuati} delta="78% target" deltaTone="up" icon="check-circle" accent="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Da riprogrammare" value={stats.daRiprog} icon="alert" accent="bg-amber-50 text-amber-600" hint="Richiede azione" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Upcoming */}
        <Card className="col-span-2" padded={false}>
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-ink-800">Prossimi audit</h3>
              <p className="text-[12px] text-ink-500 mt-0.5">Ordinati per data, esclusi quelli già effettuati.</p>
            </div>
            <Btn variant="ghost" size="sm" iconRight="chev-r" onClick={()=>goView('audit')}>Vedi tutti</Btn>
          </div>
          <ul className="divide-y divide-ink-100">
            {upcoming.map(e => {
              const a = aziendaOf(e); const us = auditorsOf(e); const ns = normeOf(e);
              const start = new Date(e.inizio);
              return (
                <li key={e.id} onClick={()=>onPickEvent(e)} className="px-5 py-3 flex items-center gap-4 hover:bg-brand-50/30 cursor-pointer">
                  <div className="w-12 text-center shrink-0">
                    <div className="text-[10.5px] uppercase font-semibold text-brand-600 tracking-wider">{['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'][start.getMonth()]}</div>
                    <div className="text-[20px] font-semibold text-ink-900 tabular-nums leading-none mt-0.5">{start.getDate()}</div>
                    <div className="text-[10.5px] text-ink-400 mt-1">{DOW_IT[(start.getDay()+6)%7]}</div>
                  </div>
                  <div className="w-px h-10 bg-ink-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink-800 truncate">{a ? a.nome : '— Senza azienda'}</span>
                      <Pill status={e.status} size="sm" />
                    </div>
                    <div className="text-[12px] text-ink-500 mt-0.5 flex items-center gap-2">
                      <span className="font-mono">{ns.map(n=>n.codice).join(' + ') || 'Norma da assegnare'}</span>
                      <span className="text-ink-300">·</span>
                      <span>{e.tipo}</span>
                      <span className="text-ink-300">·</span>
                      <span className="font-mono text-[11.5px]">{e.numero}</span>
                    </div>
                  </div>
                  <div className="flex items-center -space-x-1.5 shrink-0">
                    {us.length ? us.slice(0,3).map(u => <Avatar key={u.id} user={u} size="sm" />) : <span className="text-amber-700 text-[11.5px] inline-flex items-center gap-1"><Icon name="alert" className="w-3.5 h-3.5"/> assegna</span>}
                  </div>
                  <Icon name="chev-r" className="w-4 h-4 text-ink-300 shrink-0" />
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Da controllare */}
        <Card padded={false}>
          <div className="px-5 py-4 border-b border-ink-100">
            <h3 className="text-[14px] font-semibold text-ink-800">Da controllare</h3>
            <p className="text-[12px] text-ink-500 mt-0.5">Anomalie e azioni pendenti.</p>
          </div>
          <div className="px-5 py-4 space-y-3.5">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/60 border border-amber-100">
              <span className="w-7 h-7 shrink-0 rounded bg-amber-100 text-amber-700 inline-flex items-center justify-center"><Icon name="alert" className="w-4 h-4" /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink-800">Eventi senza auditor</div>
                <div className="text-[12px] text-ink-500 mt-0.5">{senzaAuditor.length} eventi attendono un'assegnazione.</div>
              </div>
              <button onClick={()=>goView('audit')} className="text-[12px] font-medium text-amber-700 hover:underline shrink-0">Risolvi →</button>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-50/60 border border-brand-100">
              <span className="w-7 h-7 shrink-0 rounded bg-brand-100 text-brand-700 inline-flex items-center justify-center"><Icon name="info" className="w-4 h-4" /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink-800">Audit da confermare</div>
                <div className="text-[12px] text-ink-500 mt-0.5">{daConfermare.length} bozze pronte alla conferma.</div>
              </div>
              <button onClick={()=>goView('audit')} className="text-[12px] font-medium text-brand-700 hover:underline shrink-0">Apri →</button>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50/60 border border-rose-100">
              <span className="w-7 h-7 shrink-0 rounded bg-rose-100 text-rose-700 inline-flex items-center justify-center"><Icon name="alert" className="w-4 h-4" /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink-800">Da riprogrammare</div>
                <div className="text-[12px] text-ink-500 mt-0.5">{daRiprog.length} eventi richiedono nuova data.</div>
              </div>
              <button onClick={()=>goView('audit')} className="text-[12px] font-medium text-rose-700 hover:underline shrink-0">Vedi →</button>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-ink-50 border border-ink-100">
              <span className="w-7 h-7 shrink-0 rounded bg-ink-200 text-ink-600 inline-flex items-center justify-center"><Icon name="upload" className="w-4 h-4" /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink-800">Dati importati incompleti</div>
                <div className="text-[12px] text-ink-500 mt-0.5">8 righe del foglio Excel del 22/04 da validare.</div>
              </div>
              <button onClick={()=>goView('import')} className="text-[12px] font-medium text-ink-700 hover:underline shrink-0">Apri →</button>
            </div>
          </div>
        </Card>

        {/* Workload */}
        <Card className="col-span-2">
          <SectionTitle title="Carico auditor — Maggio 2026" sub="Ore pianificate per auditor sul mese corrente." />
          <div className="space-y-2.5">
            {AUDITOR.slice(0,6).map((u,i) => {
              const ore = [42, 36, 28, 18, 31, 12][i];
              const max = 48;
              return (
                <div key={u.id} className="grid grid-cols-[180px_1fr_60px] items-center gap-3">
                  <div className="flex items-center gap-2"><Avatar user={u} size="sm" /><span className="text-[13px] text-ink-800">{u.nome}</span></div>
                  <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${(ore/max)*100}%`, background: ore>40 ? '#d97706' : '#3b66ee' }} />
                  </div>
                  <div className="text-[12.5px] text-ink-700 tabular-nums text-right"><b>{ore}</b><span className="text-ink-400">/{max}h</span></div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Trend */}
        <Card>
          <SectionTitle title="Trend audit" sub="Ultimi 6 mesi" action={<button className="text-[12px] text-brand-700 hover:underline">6M ▾</button>} />
          <div className="text-[28px] font-semibold text-ink-900 tabular-nums tracking-tight">142 <span className="text-[13px] text-emerald-700 font-medium">+18%</span></div>
          <div className="mt-3"><TinyBar data={[18, 22, 19, 28, 31, 24]} max={32} /></div>
          <div className="grid grid-cols-6 gap-1 mt-1.5 text-[10px] text-ink-400 font-mono text-center">
            <span>Dic</span><span>Gen</span><span>Feb</span><span>Mar</span><span>Apr</span><span className="text-brand-600 font-semibold">Mag</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { DashboardScreen });
