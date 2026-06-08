// Main App — routing + drawers

const StubScreen = ({ title, desc, icon }) => (
  <div className="px-6 pt-6 pb-10 max-w-[1240px] mx-auto">
    <PageHeader title={title} desc={desc} />
    <Card className="text-center py-16">
      <span className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 inline-flex items-center justify-center mb-3"><Icon name={icon} className="w-7 h-7" /></span>
      <div className="text-[15px] font-semibold text-ink-800">Modulo in arrivo</div>
      <p className="text-[13px] text-ink-500 mt-1.5 max-w-md mx-auto">Questa schermata fa parte del backlog dell'MVP. La priorità attuale è il calendario di pianificazione, il drawer di dettaglio, il form evento e la lista audit.</p>
      <div className="mt-5 flex items-center justify-center gap-2">
        <Btn variant="secondary" icon="calendar">Apri calendario</Btn>
        <Btn variant="primary" icon="plus">Richiedi modulo</Btn>
      </div>
    </Card>
  </div>
);

const App = () => {
  const [view, setView] = React.useState('calendar');
  const [events, setEvents] = React.useState(EVENTS);
  const [selected, setSelected] = React.useState(null); // event for detail drawer
  const [editing, setEditing] = React.useState(null);   // event for edit form
  const [creating, setCreating] = React.useState(false);
  const [presetDate, setPresetDate] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  const openNew = (date) => { setPresetDate(date || null); setCreating(true); setSelected(null); setEditing(null); };
  const openEdit = (e) => { setEditing(e); setSelected(null); setCreating(false); };
  const openDetail = (e) => { setSelected(e); };

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 2400); };

  const onSave = (form) => {
    if (editing) {
      setEvents(evs => evs.map(e => e.id===editing.id ? { ...e, ...form, inizio: new Date(form.inizio).toISOString(), fine: new Date(form.fine).toISOString() } : e));
      showToast('Evento aggiornato.');
    } else {
      const ne = {
        ...form,
        id: 'e' + (events.length+1),
        inizio: new Date(form.inizio).toISOString(),
        fine: new Date(form.fine).toISOString(),
      };
      setEvents(evs => [...evs, ne]);
      showToast(form.draft ? 'Bozza salvata.' : 'Evento creato.');
    }
    setEditing(null); setCreating(false); setPresetDate(null);
  };

  const onCancelEvent = () => {
    if (!selected) return;
    setEvents(evs => evs.map(e => e.id===selected.id ? { ...e, status:'annullato' } : e));
    showToast('Evento annullato.');
    setSelected(null);
  };

  const titles = {
    dashboard: { title:'Dashboard', sub:'Vista operativa di pianificazione' },
    calendar:  { title:'Calendario', sub:'Pianificazione audit · Maggio 2026' },
    audit:     { title:'Audit / Eventi', sub:'Lista completa con filtri' },
    aziende:   { title:'Aziende', sub:'Anagrafica clienti' },
    auditor:   { title:'Auditor', sub:'Anagrafica auditor' },
    norme:     { title:'Norme', sub:'Standard certificabili' },
    import:    { title:'Import dati', sub:'Migrazione da gestionale legacy' },
    settings:  { title:'Impostazioni', sub:'Preferenze utente e sistema' },
  };

  return (
    <div className="h-screen flex bg-[#f4f6fa] text-ink-800">
      <Sidebar view={view} setView={setView} />
      <main className="flex-1 min-w-0 flex flex-col">
        <Topbar title={titles[view].title} subtitle={titles[view].sub} />
        <div className="flex-1 overflow-y-auto">
          {view==='dashboard' && <DashboardScreen events={events} onPickEvent={openDetail} onNew={()=>openNew()} goView={setView} />}
          {view==='calendar'  && <CalendarScreen events={events} onPickEvent={openDetail} onNew={openNew} />}
          {view==='audit'     && <ListScreen events={events} onPickEvent={openDetail} onNew={()=>openNew()} onEdit={openEdit} />}
          {view==='import'    && <ImportScreen />}
          {view==='aziende'   && <StubScreen title="Aziende" desc="Anagrafica clienti — gestione delle aziende sottoposte a certificazione." icon="building" />}
          {view==='auditor'   && <StubScreen title="Auditor" desc="Anagrafica auditor — competenze, qualifiche, disponibilità." icon="users" />}
          {view==='norme'     && <StubScreen title="Norme / Standard" desc="Catalogo standard ISO certificabili." icon="shield" />}
          {view==='settings'  && <StubScreen title="Impostazioni" desc="Preferenze utente, integrazioni Supabase, ruoli e permessi." icon="settings" />}
        </div>
      </main>

      {/* Detail drawer */}
      <EventDetail event={selected} onClose={()=>setSelected(null)} onEdit={openEdit} onCancel={onCancelEvent} />

      {/* Form drawer */}
      <EventForm
        open={creating || !!editing}
        mode={editing ? 'edit' : 'new'}
        initial={editing}
        presetDate={presetDate}
        onClose={()=>{ setEditing(null); setCreating(false); setPresetDate(null); }}
        onSave={onSave}
      />

      {/* Toast */}
      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-ink-900 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg shadow-pop fade-in flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 inline-flex items-center justify-center"><Icon name="check" className="w-3.5 h-3.5" stroke={3} /></span>
          {toast}
        </div>
      ) : null}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
