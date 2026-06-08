// Import dati / Migrazione mock — upload, summary, normalized preview

const ImportScreen = () => {
  const [step, setStep] = React.useState('idle'); // idle | analyzing | done
  const [file, setFile] = React.useState(null);
  const [drag, setDrag] = React.useState(false);

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) { setFile({ name:f.name, size:f.size }); setStep('idle'); }
  };

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (f) { setFile({ name:f.name, size:f.size }); setStep('idle'); }
  };

  const analyze = () => {
    setStep('analyzing');
    setTimeout(()=>setStep('done'), 1400);
  };

  const summary = {
    righe: 142,
    validi: 128,
    errori: 8,
    aziendeNuove: 11,
    auditorNuovi: 3,
    duplicati: 6,
  };

  const preview = [
    { row:'12', azienda:'Azienda Alfa S.r.l.',               auditor:'Mario Rossi',        norma:'ISO 27001',          data:'27/04/2026 09:00', stato:'effettuato',     issue: null },
    { row:'13', azienda:'Azienda Alfa S.r.l.',               auditor:'Laura Bianchi',      norma:'ISO 22301',          data:'27/04/2026 09:00', stato:'effettuato',     issue: null },
    { row:'14', azienda:'Beta Consulting S.r.l.',            auditor:'Auditor Demo 1',     norma:'ISO 14001',          data:'04/05/2026 09:00', stato:'effettuato',     issue: null },
    { row:'15', azienda:'Gamma Service S.p.A. (NUOVO)',      auditor:'Auditor Demo 2',     norma:'ISO 9001',           data:'30/04/2026 14:00', stato:'pianificato',    issue: 'new-azienda' },
    { row:'16', azienda:'Delta Ambiente S.r.l.',             auditor:'(vuoto)',            norma:'ISO 14001',          data:'29/05/2026 09:00', stato:'annullato',      issue: 'no-auditor' },
    { row:'17', azienda:'(non riconosciuto)',                auditor:'Mario Rossi',        norma:'ISO 9001',           data:'21/05/2026 09:00', stato:'da_riprogrammare', issue: 'no-azienda' },
    { row:'18', azienda:'Omega Industries S.p.A.',           auditor:'Mario Rossi',        norma:'ISO 9001',           data:'??/??/????',       stato:'pianificato',    issue: 'bad-date' },
    { row:'19', azienda:'Omega Industries S.p.A.',           auditor:'Mario Rossi',        norma:'ISO 9001',           data:'22/05/2026 09:00', stato:'da_riprogrammare', issue: null },
    { row:'20', azienda:'Epsilon Tech S.r.l.',               auditor:'Laura Bianchi',      norma:'ISO 9001',           data:'22/05/2026 14:00', stato:'pianificato',    issue: null },
  ];

  const issueLabel = {
    'new-azienda': { txt:'Azienda nuova', tone:'amber' },
    'no-auditor':  { txt:'Auditor mancante', tone:'amber' },
    'no-azienda':  { txt:'Azienda non riconosciuta', tone:'rose' },
    'bad-date':    { txt:'Data non valida', tone:'rose' },
  };
  const tone = (t) => ({
    amber:'bg-amber-50 text-amber-800 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  })[t];

  return (
    <div className="px-6 pt-6 pb-10 max-w-[1240px] mx-auto">
      <PageHeader
        breadcrumb="Strumenti · Import dati"
        title="Import dati / Migrazione"
        desc="Importa il foglio Excel/CSV ricevuto dal vecchio gestionale. Il sistema esegue analisi e normalizzazione: nessun dato verrà scritto in modo definitivo prima della tua conferma."
        secondary={<Btn variant="ghost" icon="doc">Scarica template Excel</Btn>}
      />

      {/* Migration warning */}
      <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 inline-flex items-center justify-center shrink-0"><Icon name="alert" className="w-5 h-5" /></span>
        <div className="flex-1">
          <div className="text-[13.5px] font-semibold text-amber-900">La migrazione definitiva sarà validata manualmente prima dell'import finale</div>
          <p className="text-[12.5px] text-amber-800/90 mt-1 leading-snug">In questa fase MVP ogni file caricato genera un'<b>anteprima normalizzata</b> sandbox. Conferma riga per riga (o l'intero set) per scrivere i dati nel database. Le aziende e gli auditor non riconosciuti vengono raccolti in una coda di mappatura.</p>
        </div>
        <Btn variant="ghost" size="sm" icon="x" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Upload + actions */}
        <Card className="col-span-1">
          <SectionTitle title="1. Carica file" sub="Excel (.xlsx) o CSV — max 10 MB" />
          <label
            onDragOver={(e)=>{e.preventDefault();setDrag(true);}}
            onDragLeave={()=>setDrag(false)}
            onDrop={onDrop}
            className={cx(
              'block rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors',
              drag ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-ink-50/40 hover:bg-ink-50 hover:border-ink-300'
            )}>
            <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={onPick} />
            <div className="w-12 h-12 mx-auto rounded-full bg-white border border-ink-200 inline-flex items-center justify-center mb-2 text-brand-600"><Icon name="upload" className="w-5 h-5" /></div>
            <div className="text-[13.5px] font-medium text-ink-800">{file ? file.name : 'Trascina qui il file o clicca per selezionarlo'}</div>
            <div className="text-[12px] text-ink-500 mt-1">{file ? `${Math.round(file.size/1024)} KB · pronto per analisi` : 'Estensioni supportate: .xlsx, .csv'}</div>
          </label>

          <div className="mt-4 space-y-2.5 text-[12.5px] text-ink-600">
            <div className="flex items-center gap-2"><Icon name="check" className="w-4 h-4 text-emerald-600" /> Encoding UTF-8 / Latin-1 rilevato automaticamente</div>
            <div className="flex items-center gap-2"><Icon name="check" className="w-4 h-4 text-emerald-600" /> Separatori riconosciuti: <code className="font-mono">,</code> <code className="font-mono">;</code> <code className="font-mono">tab</code></div>
            <div className="flex items-center gap-2"><Icon name="check" className="w-4 h-4 text-emerald-600" /> Mappatura colonne con il template ufficiale</div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Btn variant="primary" icon="spark" onClick={analyze} disabled={!file || step==='analyzing'}>{step==='analyzing' ? 'Analisi in corso…' : 'Analizza file'}</Btn>
            <Btn variant="ghost" onClick={()=>{ setFile(null); setStep('idle'); }}>Reset</Btn>
          </div>
        </Card>

        {/* Summary */}
        <Card className="col-span-2">
          <SectionTitle
            title="2. Riepilogo import"
            sub={step==='done' ? `File “${file?.name}” analizzato con successo.` : 'Carica e analizza un file per vedere il riepilogo.'}
            action={step==='done' ? <Pill status="effettuato" size="sm" /> : null}
          />
          {step !== 'done' ? (
            <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 px-6 py-12 text-center">
              <Icon name="table" className="w-8 h-8 mx-auto text-ink-300" />
              <div className="text-[13px] text-ink-600 mt-2">Il riepilogo apparirà qui dopo l'analisi.</div>
              <div className="text-[12px] text-ink-400 mt-1">Stima: ~2 secondi per 1.000 righe.</div>
            </div>
          ) : (
            <React.Fragment>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l:'Righe lette', v:summary.righe, tone:'ink' },
                  { l:'Eventi validi', v:summary.validi, tone:'emerald' },
                  { l:'Righe con errore', v:summary.errori, tone:'rose' },
                  { l:'Aziende nuove', v:summary.aziendeNuove, tone:'amber' },
                  { l:'Auditor nuovi', v:summary.auditorNuovi, tone:'amber' },
                  { l:'Duplicati skippati', v:summary.duplicati, tone:'ink' },
                ].map(s => {
                  const tones = {
                    ink:'bg-ink-50 text-ink-700 ring-ink-200',
                    emerald:'bg-emerald-50 text-emerald-800 ring-emerald-200',
                    rose:'bg-rose-50 text-rose-800 ring-rose-200',
                    amber:'bg-amber-50 text-amber-900 ring-amber-200',
                  };
                  return (
                    <div key={s.l} className={cx('rounded-lg p-3 ring-1', tones[s.tone])}>
                      <div className="text-[11px] uppercase tracking-wider font-semibold opacity-70">{s.l}</div>
                      <div className="text-[24px] font-semibold tabular-nums tracking-tight mt-0.5">{s.v}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2.5">
                <Icon name="check-circle" className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div className="text-[12.5px] text-emerald-900"><b>{summary.validi} eventi pronti all'import.</b> Risolvi le {summary.errori} righe con errore (in arancione/rosso) per portarli a {summary.righe-summary.duplicati}.</div>
              </div>
            </React.Fragment>
          )}
        </Card>

        {/* Preview */}
        <Card className="col-span-3" padded={false}>
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-ink-800">3. Anteprima dati normalizzati</h3>
              <p className="text-[12px] text-ink-500 mt-0.5">Solo lettura — nessun dato è stato scritto. Le righe rosse richiedono mappatura prima di confermare.</p>
            </div>
            <div className="flex items-center gap-2">
              <Btn variant="ghost" size="sm" icon="filter">Solo errori</Btn>
              <Btn variant="secondary" size="sm" disabled={step!=='done'}>Esporta report</Btn>
              <Btn variant="primary" size="sm" icon="check" disabled={step!=='done'}>Conferma e importa</Btn>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-ink-500 bg-ink-50 border-b border-ink-200">
                  <th className="px-3 py-2 w-14">Riga</th>
                  <th className="px-3 py-2">Azienda</th>
                  <th className="px-3 py-2">Auditor</th>
                  <th className="px-3 py-2">Norma</th>
                  <th className="px-3 py-2">Data / Ora</th>
                  <th className="px-3 py-2">Stato</th>
                  <th className="px-3 py-2">Anomalie</th>
                  <th className="px-3 py-2 w-32 text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {preview.map((r,i) => {
                  const issue = r.issue ? issueLabel[r.issue] : null;
                  return (
                    <tr key={i} className={cx('hover:bg-ink-50/60', r.issue && (issue.tone==='rose' ? 'bg-rose-50/30' : 'bg-amber-50/30'))}>
                      <td className="px-3 py-2 font-mono text-[12px] text-ink-500">{r.row}</td>
                      <td className="px-3 py-2 text-ink-800">{r.azienda}</td>
                      <td className="px-3 py-2 text-ink-700">{r.auditor}</td>
                      <td className="px-3 py-2 font-mono text-[12px] text-indigo-800">{r.norma}</td>
                      <td className="px-3 py-2 text-ink-700 tabular-nums">{r.data}</td>
                      <td className="px-3 py-2">{r.stato==='annullato' ? <Pill status="annullato" size="sm"/> : <Pill status={r.stato} size="sm"/>}</td>
                      <td className="px-3 py-2">
                        {issue ? <span className={cx('inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-[11.5px] font-medium ring-1', tone(issue.tone))}><Icon name="alert" className="w-3 h-3" /> {issue.txt}</span>
                        : <span className="inline-flex items-center gap-1.5 text-emerald-700 text-[12px]"><Icon name="check" className="w-3.5 h-3.5"/> ok</span>}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {r.issue
                          ? <Btn variant="secondary" size="sm">Mappa →</Btn>
                          : <span className="text-[12px] text-ink-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-ink-100 flex items-center justify-between text-[12.5px] text-ink-500">
            <span>Mostrando 9 di {summary.righe} righe • {summary.errori} con errore</span>
            <button className="text-brand-700 hover:underline font-medium">Mostra tutte →</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { ImportScreen });
