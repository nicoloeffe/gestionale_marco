// Mock data + helpers shared across screens
const STATUSES = {
  bozza:           { id:'bozza',           label:'Bozza',           dot:'#94a3b8', bg:'bg-slate-100',   text:'text-slate-700',   ring:'ring-slate-200',   barBg:'bg-slate-200',   barText:'text-slate-700',   barBorder:'border-slate-300' },
  pianificato:     { id:'pianificato',     label:'Pianificato',     dot:'#3b66ee', bg:'bg-brand-50',    text:'text-brand-700',   ring:'ring-brand-100',   barBg:'bg-brand-100',   barText:'text-brand-800',   barBorder:'border-brand-200' },
  confermato:      { id:'confermato',      label:'Confermato',      dot:'#1f3585', bg:'bg-indigo-50',   text:'text-indigo-700',  ring:'ring-indigo-100',  barBg:'bg-indigo-100',  barText:'text-indigo-800',  barBorder:'border-indigo-200' },
  effettuato:      { id:'effettuato',      label:'Effettuato',      dot:'#16a34a', bg:'bg-emerald-50',  text:'text-emerald-700', ring:'ring-emerald-100', barBg:'bg-emerald-100', barText:'text-emerald-800', barBorder:'border-emerald-200' },
  annullato:       { id:'annullato',       label:'Annullato',       dot:'#e11d48', bg:'bg-rose-50',     text:'text-rose-700',    ring:'ring-rose-100',    barBg:'bg-rose-100',    barText:'text-rose-800',    barBorder:'border-rose-200' },
  da_riprogrammare:{ id:'da_riprogrammare',label:'Da riprogrammare',dot:'#d97706', bg:'bg-amber-50',    text:'text-amber-800',   ring:'ring-amber-200',   barBg:'bg-amber-100',   barText:'text-amber-900',   barBorder:'border-amber-200' },
};

const AZIENDE = [
  { id:'a1',  nome:'Azienda Alfa S.r.l.',         ente:'DEMO ENTE A' },
  { id:'a2',  nome:'Beta Consulting S.r.l.',      ente:'DEMO ENTE A' },
  { id:'a3',  nome:'Gamma Service S.p.A.',        ente:'DEMO ENTE A' },
  { id:'a4',  nome:'Delta Ambiente S.r.l.',       ente:'DEMO ENTE B' },
  { id:'a5',  nome:'Omega Industries S.p.A.',     ente:'DEMO ENTE A' },
  { id:'a6',  nome:'Epsilon Tech S.r.l.',         ente:'DEMO ENTE A' },
  { id:'a7',  nome:'Zeta Logistica S.r.l.',       ente:'DEMO ENTE A' },
  { id:'a8',  nome:'Eta Software S.r.l.',         ente:'DEMO ENTE C' },
  { id:'a9',  nome:'Theta Engineering S.r.l.',    ente:'DEMO ENTE A' },
  { id:'a10', nome:'Iota Group S.p.A.',           ente:'DEMO ENTE A' },
  { id:'a11', nome:'Kappa Solutions S.r.l.',      ente:'DEMO ENTE D' },
  { id:'a12', nome:'Lambda Trading S.r.l.',       ente:'DEMO ENTE B' },
  { id:'a13', nome:'Mu Servizi S.r.l.',           ente:'DEMO ENTE A' },
  { id:'a14', nome:'Nu Manufacturing S.p.A.',     ente:'DEMO ENTE A' },
  { id:'a15', nome:'Xi Demo S.r.l.',              ente:'DEMO ENTE C' },
  { id:'a16', nome:'Omicron Demo S.r.l.',         ente:'DEMO ENTE A' },
  { id:'a17', nome:'Pi Holding S.p.A.',           ente:'DEMO ENTE D' },
  { id:'a18', nome:'Rho Demo S.r.l.',             ente:'DEMO ENTE A' },
  { id:'a19', nome:'Sigma Industria S.r.l.',      ente:'DEMO ENTE A' },
];

const AUDITOR = [
  { id:'u1', nome:'Mario Rossi',     ruolo:'Lead Auditor',   iniziali:'MR' },
  { id:'u2', nome:'Laura Bianchi',   ruolo:'Auditor',        iniziali:'LB' },
  { id:'u3', nome:'Auditor Demo 1',  ruolo:'Lead Auditor',   iniziali:'A1' },
  { id:'u4', nome:'Auditor Demo 2',  ruolo:'Auditor Junior', iniziali:'A2' },
  { id:'u5', nome:'Auditor Demo 3',  ruolo:'Auditor',        iniziali:'A3' },
  { id:'u6', nome:'Auditor Demo 4',  ruolo:'Auditor',        iniziali:'A4' },
  { id:'u7', nome:'Auditor Demo 5',  ruolo:'Lead Auditor',   iniziali:'A5' },
  { id:'u8', nome:'Auditor Demo 6',  ruolo:'Auditor',        iniziali:'A6' },
];

const NORME = [
  { id:'n1', codice:'ISO 9001',  descr:'Sistemi di gestione per la qualità' },
  { id:'n2', codice:'ISO 14001', descr:'Sistemi di gestione ambientale' },
  { id:'n3', codice:'ISO 45001', descr:'Salute e sicurezza sul lavoro' },
  { id:'n4', codice:'ISO 27001', descr:'Sicurezza delle informazioni' },
  { id:'n5', codice:'ISO 22301', descr:'Continuità operativa' },
  { id:'n6', codice:'ISO 13485', descr:'Dispositivi medici' },
  { id:'n7', codice:'ISO 22000', descr:'Sicurezza alimentare' },
];

const TIPI = ['Stage 1','Stage 2','Sorveglianza','Rinnovo','Pre-audit','Follow-up'];

// Build month grid (Lun-Dom) for a given anchor date
function monthGrid(anchor) {
  const y = anchor.getFullYear(), m = anchor.getMonth();
  const first = new Date(y, m, 1);
  const startDow = (first.getDay() + 6) % 7; // Mon=0
  const start = new Date(y, m, 1 - startDow);
  const cells = [];
  for (let i=0;i<42;i++){
    const d = new Date(start); d.setDate(start.getDate()+i);
    cells.push({ date:d, inMonth:d.getMonth()===m, iso: d.toISOString().slice(0,10) });
  }
  return cells;
}
const MONTHS_IT = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const DOW_IT = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
const fmtDate = (d) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
const fmtTime = (d) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

// Generate events for May 2026 around the live date
function buildEvents() {
  const Y = 2026, M = 4; // May (0-indexed)
  const e = (id, day, dur, ora, aId, uId, nIds, status, eff, num, tipo, note) => ({
    id, titolo: '', aziendaId: aId, auditorIds: uId, normeIds: nIds,
    inizio: new Date(Y, M, day, ora||9, 0).toISOString(),
    fine:   new Date(Y, M, day + (dur||0), (ora||9) + 7, 0).toISOString(),
    allDay: false, status, effettuato: !!eff, numero: num, tipo,
    note: note || ''
  });
  return [
    e('e01', 27, 1, 9,  'a1',  ['u3','u4'],         ['n4','n5'], 'effettuato',      true,  '27017-27018-22301', 'Sorveglianza', 'Demo: in remoto.'),
    e('e02', 30, 0, 9,  'a16', ['u1'],              ['n1'],      'effettuato',      true,  'AU-2026-019',       'Sorveglianza', '0,5 in remoto per mantenimento qualifica.'),
    e('e03', 30, 0, 14, 'a15', ['u2'],              ['n1'],      'pianificato',     false, 'AU-2026-020',       'Stage 2',      ''),
    e('e04', 4,  1, 9,  'a10', ['u5'],              ['n2'],      'effettuato',      true,  'AU-2026-021',       'Sorveglianza', ''),
    e('e05', 11, 0, 9,  'a11', ['u3'],              ['n1','n4'], 'effettuato',      true,  'AU-2026-022',       'Rinnovo',      ''),
    e('e06', 12, 0, 9,  'a12', ['u6'],              ['n1'],      'effettuato',      true,  'AU-2026-023',       'Sorveglianza', ''),
    e('e07', 13, 0, 9,  'a5',  ['u7'],              ['n1'],      'effettuato',      true,  'AU-2026-024',       'Sorveglianza', ''),
    e('e08', 15, 0, 9,  null,  ['u1','u2','u3','u4'],['n4'],     'da_riprogrammare',false, 'AU-2026-025',       'Stage 1',      'In attesa conferma cliente.'),
    e('e09', 18, 1, 9,  'a17', ['u8'],              ['n3'],      'pianificato',     false, 'AU-2026-026',       'Stage 2',      'Day 1 in remoto.'),
    e('e10', 19, 0, 9,  'a13', ['u5'],              ['n1'],      'pianificato',     false, 'AU-2026-027',       'Sorveglianza', ''),
    e('e11', 20, 0, 9,  'a13', ['u5'],              ['n1'],      'pianificato',     false, 'AU-2026-028',       'Sorveglianza', ''),
    e('e12', 21, 0, 9,  'a14', ['u7'],              ['n1'],      'da_riprogrammare',false, 'AU-2026-029',       'Stage 2',      'Cliente ha richiesto rinvio.'),
    e('e13', 22, 0, 9,  'a14', ['u7'],              ['n1'],      'da_riprogrammare',false, 'AU-2026-030',       'Stage 2',      ''),
    e('e14', 22, 0, 14, 'a11', ['u3'],              ['n1'],      'pianificato',     false, 'AU-2026-031',       'Sorveglianza', ''),
    e('e15', 22, 0, 11, 'a2',  ['u2'],              ['n4'],      'pianificato',     false, 'AU-2026-040',       'Stage 1',      ''),
    e('e16', 22, 0, 16, 'a9',  ['u6'],              ['n3'],      'confermato',      false, 'AU-2026-041',       'Sorveglianza', ''),
    e('e17', 22, 0, 17, 'a18', ['u8'],              ['n2'],      'bozza',           false, '—',                 'Pre-audit',    ''),
    e('e18', 23, 0, 9,  'a11', ['u3'],              ['n1'],      'pianificato',     false, 'AU-2026-032',       'Sorveglianza', ''),
    e('e19', 6,  0, 9,  'a2',  ['u1','u3'],         ['n4'],      'confermato',      false, 'AU-2026-033',       'Stage 1',      ''),
    e('e20', 7,  1, 9,  'a3',  ['u4'],              ['n2','n3'], 'confermato',      false, 'AU-2026-034',       'Sorveglianza', ''),
    e('e21', 14, 0, 9,  'a18', ['u6'],              ['n1'],      'bozza',           false, '—',                 'Pre-audit',    'Bozza, mancano date definitive.'),
    e('e22', 25, 0, 9,  'a19', ['u8'],              ['n7'],      'pianificato',     false, 'AU-2026-035',       'Stage 2',      ''),
    e('e23', 26, 0, 9,  'a4',  ['u2'],              ['n1'],      'confermato',      false, 'AU-2026-036',       'Sorveglianza', ''),
    e('e24', 28, 0, 9,  'a6',  ['u5'],              ['n3'],      'pianificato',     false, 'AU-2026-037',       'Sorveglianza', ''),
    e('e25', 29, 0, 9,  'a7',  ['u7'],              ['n2'],      'annullato',       false, 'AU-2026-038',       'Sorveglianza', 'Annullato dal cliente, contratto in revisione.'),
    e('e26', 5,  0, 14, 'a8',  ['u1'],              ['n1','n2'], 'effettuato',      true,  'AU-2026-039',       'Rinnovo',      ''),
  ];
}

const EVENTS = buildEvents();

// Lookup helpers
const byId = (arr, id) => arr.find(x => x.id === id);
const aziendaOf = (e) => byId(AZIENDE, e.aziendaId);
const auditorsOf = (e) => (e.auditorIds||[]).map(id => byId(AUDITOR, id)).filter(Boolean);
const normeOf = (e) => (e.normeIds||[]).map(id => byId(NORME, id)).filter(Boolean);
const titleOf = (e) => {
  const a = aziendaOf(e); const n = normeOf(e).map(x=>x.codice).join(' + ');
  return (a ? a.nome : 'Senza azienda') + (n ? ' — ' + n : '');
};

Object.assign(window, {
  STATUSES, AZIENDE, AUDITOR, NORME, TIPI, EVENTS,
  monthGrid, MONTHS_IT, DOW_IT, fmtDate, fmtTime,
  byId, aziendaOf, auditorsOf, normeOf, titleOf,
});
