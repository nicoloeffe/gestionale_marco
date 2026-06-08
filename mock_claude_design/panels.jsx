// Event detail drawer + new/edit form (drawer-based)

const Drawer = ({ open, onClose, width=520, children, title, sub, badge, footer }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-900/30 fade-in" onClick={onClose} />
      <aside className="absolute top-0 right-0 h-full bg-white shadow-drawer flex flex-col slide-in" style={{ width }}>
        <header className="h-14 px-5 border-b border-ink-100 flex items-center gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[14.5px] font-semibold text-ink-900 truncate">{title}</h3>
              {badge}
            </div>
            {sub ? <div className="text-[12px] text-ink-500 truncate">{sub}</div> : null}
          </div>
          <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"><Icon name="x" className="w-[18px] h-[18px]" /></button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer ? <footer className="h-14 px-5 border-t border-ink-100 bg-white shrink-0 flex items-center justify-end gap-2">{footer}</footer> : null}
      </aside>
    </div>
  );
};

// === Detail drawer ===
const DetailRow = ({ label, children }) => (
  <div className="grid grid-cols-[140px_1fr] gap-3 py-2.5 border-b border-ink-100 last:border-b-0">
    <div className="text-[12.5px] text-ink-500">{label}</div>
    <div className="text-[13.5px] text-ink-800">{children}</div>
  </div>
);

const EventDetail = ({ event, onClose, onEdit, onCancel }) => {
  if (!event) return null;
  const a = aziendaOf(event); const us = auditorsOf(event); const ns = normeOf(event);
  const start = new Date(event.inizio); const end = new Date(event.fine);
  const sameDay = start.toDateString() === end.toDateString();
  return (
    <Drawer
      open={!!event}
      onClose={onClose}
      width={520}
      title={a ? a.nome : 'Evento senza azienda'}
      sub={`${event.tipo} · ${ns.map(n=>n.codice).join(' + ') || 'Norma non assegnata'}`}
      badge={<Pill status={event.status} size="sm" />}
      footer={
        <React.Fragment>
          <Btn variant="ghost" onClick={onClose}>Chiudi</Btn>
          <Btn variant="danger_g" icon="trash" onClick={onCancel}>Annulla / Elimina</Btn>
          <Btn variant="primary" icon="edit" onClick={()=>onEdit(event)}>Modifica</Btn>
        </React.Fragment>
      }
    >
      <div className="px-5 pt-4 pb-2">
        {/* Quick stats strip */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg bg-ink-50 p-3">
            <div className="text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold">Data</div>
            <div className="mt-1 text-[13px] font-medium text-ink-800">{fmtDate(start)}</div>
            <div className="text-[11.5px] text-ink-500">{sameDay ? `${fmtTime(start)} – ${fmtTime(end)}` : `→ ${fmtDate(end)}`}</div>
          </div>
          <div className="rounded-lg bg-ink-50 p-3">
            <div className="text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold">Numero audit</div>
            <div className="mt-1 text-[13px] font-mono font-medium text-ink-800 truncate">{event.numero}</div>
            <div className="text-[11.5px] text-ink-500">{event.tipo}</div>
          </div>
          <div className="rounded-lg bg-ink-50 p-3">
            <div className="text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold">Effettuato</div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium">
              {event.effettuato
                ? <React.Fragment><span className="w-2 h-2 rounded-full bg-emerald-500" />Sì, completato</React.Fragment>
                : <React.Fragment><span className="w-2 h-2 rounded-full bg-ink-300" />Non ancora</React.Fragment>}
            </div>
            <div className="text-[11.5px] text-ink-500">{event.effettuato ? 'Verbale ricevuto' : 'In sospeso'}</div>
          </div>
        </div>

        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink-500 mt-2 mb-1.5">Dettagli</h4>
        <div className="rounded-lg border border-ink-100 px-3.5">
          <DetailRow label="Azienda / Cliente">
            {a ? <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-gradient-to-br from-brand-100 to-brand-300 inline-flex items-center justify-center text-[10px] font-semibold text-brand-800">{a.nome.slice(0,2).toUpperCase()}</span><span>{a.nome}</span><span className="ml-1 text-[11px] text-ink-400">· {a.ente}</span></div> : <span className="text-ink-400 italic">Non assegnata</span>}
          </DetailRow>
          <DetailRow label="Auditor">
            {us.length ? (
              <div className="flex flex-wrap gap-2">
                {us.map(u => (
                  <span key={u.id} className="inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-ink-50 ring-1 ring-ink-100">
                    <Avatar user={u} size="sm" />
                    <span className="text-[12.5px] text-ink-800">{u.nome}</span>
                    <span className="text-[11px] text-ink-400">· {u.ruolo}</span>
                  </span>
                ))}
              </div>
            ) : <span className="text-amber-700 inline-flex items-center gap-1"><Icon name="alert" className="w-4 h-4" /> Auditor non assegnato</span>}
          </DetailRow>
          <DetailRow label="Norma / Standard">
            <div className="flex flex-wrap gap-1.5">
              {ns.map(n => <span key={n.id} className="inline-flex items-center gap-1.5 h-6 px-2 rounded bg-indigo-50 text-indigo-800 text-[11.5px] font-mono ring-1 ring-indigo-100">{n.codice}</span>)}
            </div>
          </DetailRow>
          <DetailRow label="Data inizio">{fmtDate(start)} · {fmtTime(start)}</DetailRow>
          <DetailRow label="Data fine">{fmtDate(end)} · {fmtTime(end)}</DetailRow>
          <DetailRow label="Stato"><Pill status={event.status} size="sm" /></DetailRow>
          <DetailRow label="Numero audit"><span className="font-mono">{event.numero}</span></DetailRow>
          <DetailRow label="Tipo audit">{event.tipo}</DetailRow>
        </div>

        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink-500 mt-5 mb-1.5">Note</h4>
        <div className="rounded-lg border border-ink-100 p-3.5 bg-ink-50/40 text-[13px] text-ink-700 min-h-[64px]">
          {event.note ? event.note : <span className="text-ink-400 italic">Nessuna nota.</span>}
        </div>

        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink-500 mt-5 mb-1.5">Attività recente</h4>
        <ul className="space-y-2.5 mb-4">
          <li className="flex gap-3 text-[12.5px]">
            <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-50 text-emerald-600 inline-flex items-center justify-center"><Icon name="check" className="w-3.5 h-3.5" /></span>
            <div><div className="text-ink-800">Stato aggiornato a <b>{STATUSES[event.status].label}</b></div><div className="text-ink-400">Pianificatore Demo · 2 giorni fa</div></div>
          </li>
          <li className="flex gap-3 text-[12.5px]">
            <span className="w-6 h-6 shrink-0 rounded-full bg-brand-50 text-brand-600 inline-flex items-center justify-center"><Icon name="edit" className="w-3.5 h-3.5" /></span>
            <div><div className="text-ink-800">Auditor assegnato</div><div className="text-ink-400">Pianificatore Demo · 5 giorni fa</div></div>
          </li>
          <li className="flex gap-3 text-[12.5px]">
            <span className="w-6 h-6 shrink-0 rounded-full bg-ink-100 text-ink-500 inline-flex items-center justify-center"><Icon name="plus" className="w-3.5 h-3.5" /></span>
            <div><div className="text-ink-800">Evento creato</div><div className="text-ink-400">Import del 22/04/2026</div></div>
          </li>
        </ul>
      </div>
    </Drawer>
  );
};

// === New / Edit form drawer ===
const FormSection = ({ title, desc, children }) => (
  <section className="px-5 py-5 border-b border-ink-100 last:border-b-0">
    <div className="grid grid-cols-[200px_1fr] gap-6">
      <div>
        <h4 className="text-[13px] font-semibold text-ink-800">{title}</h4>
        {desc ? <p className="text-[12px] text-ink-500 mt-1 leading-snug">{desc}</p> : null}
      </div>
      <div className="space-y-3.5">{children}</div>
    </div>
  </section>
);

const MultiSelectChips = ({ options, value, onChange, getLabel, placeholder }) => {
  const toggle = (id) => onChange(value.includes(id) ? value.filter(v=>v!==id) : [...value, id]);
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-1.5 min-h-[40px] flex flex-wrap gap-1.5">
      {value.length === 0 ? <span className="text-[12.5px] text-ink-400 px-1.5 py-1">{placeholder}</span> : null}
      {value.map(id => (
        <span key={id} className="inline-flex items-center gap-1.5 h-7 pl-2 pr-1 rounded-md bg-brand-50 text-brand-700 text-[12.5px] font-medium ring-1 ring-brand-100">
          {getLabel(id)}
          <button type="button" onClick={()=>toggle(id)} className="w-5 h-5 inline-flex items-center justify-center rounded hover:bg-brand-100"><Icon name="x" className="w-3 h-3" /></button>
        </span>
      ))}
      <details className="ml-auto relative">
        <summary className="list-none cursor-pointer h-7 px-2 inline-flex items-center gap-1 rounded-md text-ink-600 hover:bg-ink-50 text-[12.5px]"><Icon name="plus" className="w-3.5 h-3.5" /> Aggiungi</summary>
        <div className="absolute right-0 top-9 w-[260px] bg-white rounded-lg shadow-pop ring-1 ring-ink-200 max-h-[260px] overflow-y-auto p-1 z-10">
          {options.map(o => (
            <button key={o.id} type="button" onClick={()=>toggle(o.id)} className="w-full text-left px-2.5 py-1.5 rounded hover:bg-ink-50 text-[13px] flex items-center gap-2">
              <span className={cx('w-4 h-4 rounded border', value.includes(o.id) ? 'bg-brand-600 border-brand-600 text-white inline-flex items-center justify-center' : 'border-ink-300')}>
                {value.includes(o.id) ? <Icon name="check" className="w-3 h-3" stroke={3} /> : null}
              </span>
              {getLabel(o.id)}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
};

const Radio = ({ name, value, onChange, options }) => (
  <div className="inline-flex bg-ink-100 rounded-lg p-0.5">
    {options.map(o => (
      <button key={o.value} type="button" onClick={()=>onChange(o.value)} className={cx(
        'h-7 px-3 text-[12.5px] font-medium rounded-md transition-colors',
        value===o.value ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-600 hover:text-ink-800'
      )}>{o.label}</button>
    ))}
  </div>
);

const EventForm = ({ open, mode='new', initial, presetDate, onClose, onSave }) => {
  const blank = {
    titolo:'', aziendaId:'', auditorIds:[], normeIds:[], numero:'', tipo:'Sorveglianza',
    inizio: presetDate ? new Date(presetDate.getFullYear(), presetDate.getMonth(), presetDate.getDate(), 9, 0).toISOString().slice(0,16) : '2026-05-15T09:00',
    fine:   presetDate ? new Date(presetDate.getFullYear(), presetDate.getMonth(), presetDate.getDate(), 17, 0).toISOString().slice(0,16) : '2026-05-15T17:00',
    allDay:false, status:'pianificato', effettuato:false, note:'',
  };
  const seed = initial ? {
    ...initial,
    inizio: initial.inizio.slice(0,16),
    fine:   initial.fine.slice(0,16),
  } : blank;

  const [v, setV] = React.useState(seed);
  React.useEffect(()=>{ setV(seed); /* eslint-disable-next-line */ }, [open, initial]);
  const set = (k, val) => setV(s => ({ ...s, [k]: val }));

  const aziendaSel = byId(AZIENDE, v.aziendaId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={760}
      title={mode==='edit' ? 'Modifica evento audit' : 'Nuovo evento audit'}
      sub={mode==='edit' ? `Audit ${v.numero}` : 'Compila tutte le sezioni — i campi obbligatori sono contrassegnati'}
      badge={<Pill status={v.status} size="sm" />}
      footer={
        <React.Fragment>
          <Btn variant="ghost" onClick={onClose}>Annulla</Btn>
          <Btn variant="secondary" onClick={()=>onSave({ ...v, draft:true })}>Salva come bozza</Btn>
          <Btn variant="primary" icon="check" onClick={()=>onSave(v)}>{mode==='edit' ? 'Salva modifiche' : 'Crea evento'}</Btn>
        </React.Fragment>
      }
    >
      <div className="bg-ink-50/40">
        <FormSection title="Informazioni principali" desc="Identifica l'audit, il cliente e gli auditor coinvolti.">
          <Field label="Titolo evento" hint="Lasciare vuoto per generare automaticamente">
            <Input placeholder="Es. Sorveglianza ISO 9001 — Azienda Alfa S.r.l." value={v.titolo} onChange={(e)=>set('titolo', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Azienda / Cliente" required>
              <Select value={v.aziendaId} onChange={(e)=>set('aziendaId', e.target.value)}>
                <option value="">— Seleziona —</option>
                {AZIENDE.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </Select>
              {aziendaSel ? <div className="mt-1 text-[11.5px] text-ink-500">Ente: <b>{aziendaSel.ente}</b></div> : null}
            </Field>
            <Field label="Tipo audit" required>
              <Select value={v.tipo} onChange={(e)=>set('tipo', e.target.value)}>
                {TIPI.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Auditor" hint={`${v.auditorIds.length} selezionati`} required>
            <MultiSelectChips options={AUDITOR} value={v.auditorIds} onChange={(ids)=>set('auditorIds',ids)} getLabel={(id)=>byId(AUDITOR,id)?.nome} placeholder="Nessun auditor assegnato" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Norma / Standard" required>
              <MultiSelectChips options={NORME} value={v.normeIds} onChange={(ids)=>set('normeIds',ids)} getLabel={(id)=>byId(NORME,id)?.codice} placeholder="Nessuna norma" />
            </Field>
            <Field label="Numero audit" hint="Codice interno">
              <Input placeholder="AU-2026-040" value={v.numero} onChange={(e)=>set('numero', e.target.value)} className="font-mono" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Pianificazione" desc="Definisci data, durata e modalità dell'evento.">
          <div className="flex items-center justify-between">
            <Toggle checked={v.allDay} onChange={(b)=>set('allDay',b)} label="Tutto il giorno" />
            <span className="text-[11.5px] text-ink-500">Fuso: Europe/Rome</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data inizio" required>
              <Input type={v.allDay ? 'date' : 'datetime-local'} value={v.allDay ? v.inizio.slice(0,10) : v.inizio} onChange={(e)=>set('inizio', e.target.value)} />
            </Field>
            <Field label="Data fine" required>
              <Input type={v.allDay ? 'date' : 'datetime-local'} value={v.allDay ? v.fine.slice(0,10) : v.fine} onChange={(e)=>set('fine', e.target.value)} />
            </Field>
          </div>
          <div className="rounded-lg bg-white border border-ink-200 p-3 text-[12.5px] text-ink-600 flex items-start gap-2.5">
            <Icon name="info" className="w-4 h-4 text-brand-500 mt-0.5" />
            <div>Durata stimata: <b>{Math.max(1, Math.round((new Date(v.fine)-new Date(v.inizio))/(1000*60*60)))} ore</b>. Verrà bloccato l'auditor sull'agenda nelle stesse ore.</div>
          </div>
        </FormSection>

        <FormSection title="Stato" desc="Stato corrente dell'audit e check di completamento.">
          <Field label="Stato evento">
            <div className="grid grid-cols-3 gap-1.5">
              {Object.values(STATUSES).map(s => (
                <button key={s.id} type="button" onClick={()=>set('status', s.id)} className={cx(
                  'flex items-center gap-2 h-9 px-2.5 rounded-lg ring-1 text-[12.5px] font-medium transition-colors',
                  v.status===s.id ? cx(s.bg, s.text, s.ring) : 'bg-white text-ink-600 ring-ink-200 hover:bg-ink-50'
                )}>
                  <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                  {s.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Effettuato">
            <Radio value={v.effettuato ? 'si' : 'no'} onChange={(val)=>set('effettuato', val==='si')} options={[{value:'no',label:'No, non ancora'},{value:'si',label:'Sì, completato'}]} />
          </Field>
        </FormSection>

        <FormSection title="Note" desc="Annotazioni interne, da non includere nei documenti ufficiali.">
          <Field label="Note interne" hint={`${v.note.length}/500`}>
            <TextArea rows={4} placeholder="Eventuali dettagli operativi, riferimenti contrattuali, vincoli logistici…" value={v.note} onChange={(e)=>set('note', e.target.value)} maxLength={500} />
          </Field>
        </FormSection>
      </div>
    </Drawer>
  );
};

Object.assign(window, { Drawer, EventDetail, EventForm });
