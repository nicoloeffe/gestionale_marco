# Build Spec — Rilascio 1

Task di costruzione per l'agente. Da leggere insieme a `AGENTS.md` (regole, invarianti, fuori-scope).
Costruire **solo** ciò che è qui dentro. In caso di dubbio su una feature, se non è qui è fuori scope.

---

## 1. Obiettivo

Applicazione web funzionante che permette a utenti autenticati di pianificare e gestire audit a calendario, gestire le anagrafiche di clienti e auditor, importare una tantum i dati storici da Excel, ed esportare in Excel. Tre società con dati separati. ~8 utenti.

## 2. Scope

**Dentro:** login + ruoli; separazione 3 società; calendario (mese/settimana/giorno); lista eventi; anagrafica clienti (CRUD); anagrafica auditor (lista/dettaglio); norme/EA (tabella di riferimento); import una tantum; export Excel base; deploy.

**Fuori (Pacchetti 2/3 — NON costruire):** economico, documenti, modulistica, controlli/NC, import ricorrente, sicurezza avanzata, notifiche, report avanzati. (Dettaglio in `AGENTS.md` §8.)

---

## 3. Modello dati

Lo schema v1 esiste già (`supabase/migrations/001_initial_schema.sql`) ed è popolato in parte. ⚠️ **Stato reale dall'audit: lo schema NON ha ancora il campo `ente` sulle tabelle dati, e le RLS sono permissive (MVP/dev). Aggiungere `ente` + RLS reale + auth è lo Step 1.** Tabelle (con le aggiunte da fare):

- `profiles` — utente: id, email, nome, **ruolo** (`admin` | `operator` | `viewer`), **`ente`** (DA AGGIUNGERE), flag **`sees_all`** "vede tutte le società" (DA AGGIUNGERE, default `false`).
- `clients` — ragione sociale, regione, provincia, `ea_code` (stringa, può contenere codici multipli es. "34;29"), **`ente` (DA AGGIUNGERE)**, attivo, note, `needs_review`.
- `auditors` — nome, ruolo/qualifica, iniziali, **`ente` (DA AGGIUNGERE)**, attivo.
- `standards` — codice (es. "ISO 9001"), descrizione.
- `audits` — pratica: cliente, tipo audit, stato pratica, **`ente` (DA AGGIUNGERE)**, dati di pianificazione. **Gli standard NON sono colonne booleane**: si collegano via `audit_standards`.
- `audit_standards` — relazione molti-a-molti audit ↔ standards.
- `calendar_events` — evento: collegato a un audit, auditor (vedi decisione sotto), inizio/fine (UTC), `status` evento, `performed_status`, **`ente` (DA AGGIUNGERE)**.
- `import_batches`, `imported_rows` — tracciamento import e **righe grezze conservate** (vedi §8).

Viste: `events_full`, `audits_full`.

Decisioni di modello già prese:
- `status` evento e `stato pratica` audit sono **separati**.
- `performed_status`: tre stati — **`yes` | `no` | `unknown`** (valore enum DB in inglese; etichetta UI in italiano).
- Ruoli enum DB in inglese: `admin` | `operator` | `viewer`. Non rinominare lo schema già seedato; allineare il resto del codice a questi valori.
- Standard via tabella + relazione, mai booleani.

**Decisione aperta — auditor per evento.** Default R1: **un auditor per evento** (FK su `calendar_events`), con eventuale campo opzionale `consulente`. NON creare la tabella `event_auditors` finché il cliente non conferma il multi-auditor. Strutturare il codice perché il passaggio a molti-a-molti sia localizzato. (Vedi `AGENTS.md` §7.)

Stati evento (colori dal prototipo): `bozza`, `pianificato`, `confermato`, `effettuato`, `annullato`, `da_riprogrammare`.

---

## 4. Multi-tenancy e RLS

- Ogni riga di dati ha un campo `ente`.
- L'`ente` (e il flag "vede tutte") dell'utente sta in `profiles`.
- **Policy RLS su ogni tabella con dati di società:** un utente vede/scrive solo righe del proprio `ente`, salvo flag "vede tutte" = vede in lettura tutte le società.
- Le policy sono la frontiera di sicurezza. Il frontend non filtra per sicurezza, filtra per UX.
- Scrivere le policy come migration versionata.

## 5. Auth e ruoli

- Supabase Auth, email/password. Nessuna auto-registrazione: gli utenti li crea l'admin.
- Ruoli:
  - `admin` — gestisce utenti e anagrafiche, tutti gli eventi; può avere `sees_all` = vede tutte le società.
  - `operator` — crea/modifica eventi e anagrafiche del proprio `ente`; import; export. Non gestisce utenti.
  - `viewer` (sola lettura) — consulta calendario/liste/anagrafiche. Nessuna mutazione.
- I permessi vanno applicati sia lato RLS sia lato UI (nascondere azioni non permesse).

---

## 6. Feature e criteri di accettazione

### 6.1 Login
- Pagina di login; redirect a login se non autenticato; logout.
- **Accettazione:** senza sessione non si accede a nessun dato (INV-2).

### 6.2 Calendario / pianificazione
- Viste **mese / settimana / giorno**; navigazione tra periodi.
- Eventi mostrati con colore per `status`.
- Click su evento → **drawer di dettaglio** (cliente, tipo, auditor, norme, date, stato, effettuato).
- **Form nuovo / modifica evento**: cliente, tipo audit, auditor, norme (multi-select), numero audit, date inizio/fine, stato, allDay, note.
- **Filtri**: società, auditor, stato.
- Fuso `Europe/Rome` in visualizzazione; salvataggio in UTC (INV-6).
- **Accettazione:** creare, vedere, modificare, annullare un evento; i filtri restringono correttamente; le date tornano coerenti dopo reload.

### 6.3 Lista audit / eventi
- Tabella con ricerca testuale e filtri (società, auditor, stato, periodo).
- **Accettazione:** la lista riflette i dati reali e i filtri.

### 6.4 Anagrafica clienti (CRUD)
- Lista con ricerca/filtri; dettaglio; creazione; modifica.
- Campi: ragione sociale, regione, provincia, `ea_code`, società, attivo, note. Mostrare il flag `needs_review`.
- **Accettazione:** CRUD completo, scoping per ente via RLS (INV-1).

### 6.5 Anagrafica auditor
- Lista e dettaglio. (Modifica completa: opzionale in R1, lista+dettaglio sufficienti per assegnare gli eventi.)
- **Accettazione:** gli auditor disponibili nel form evento provengono da qui, filtrati per ente.

### 6.6 Norme / EA code
- Tabella di riferimento consultabile (sola lettura in R1).

### 6.7 Import dati (una tantum) — il punto delicato
Vedi §8 per la struttura del file. Flusso:
1. Upload `.xlsx`.
2. **Parsing + normalizzazione in sandbox**: nessuna scrittura definitiva.
3. **Anteprima** dei record normalizzati + **coda di revisione** per clienti/auditor non riconosciuti e varianti di nome.
4. Conferma (per riga o intero set) → scrittura nel DB.
5. Idempotenza: ri-eseguire non duplica (deduplica per chiave naturale / batch).
- **Accettazione (INV-4):** prima della conferma il DB non cambia; dopo la conferma i conteggi corrispondono all'anteprima; una seconda esecuzione non crea duplicati; le voci dubbie sono marcate `needs_review`.

### 6.8 Export Excel base
- Esporta eventi/audit (con filtri correnti) in `.xlsx`.
- **Accettazione:** il file si apre e contiene i record attesi.

### 6.9 Deploy
- Build di produzione su hosting; progetto Supabase in **regione EU**, su account intestabile al cliente.
- **Accettazione:** l'app gira in produzione, login e una operazione CRUD funzionano end-to-end.

---

## 7. Non funzionali
- UI in italiano.
- Stati di loading ed errore in ogni vista che legge dati.
- Dataset piccolo (~centinaia di righe): nessuna ottimizzazione prematura, ma paginazione/virtualizzazione semplice sulle liste lunghe.

---

## 8. Struttura del file Excel da importare (IMPORTANTE)

Il file reale è irregolare — l'agente NON lo deve trattare come una tabella pulita. Caratteristiche osservate:

- **Un solo foglio** ("gennaio") che però contiene **l'intero anno**: ci sono righe-divisore con i nomi dei mesi ("febbraio 2026", … "dicembre 2026") e **~51 mini-calendari settimanali impilati** verticalmente, ciascuno con la propria riga di intestazione `Lu Ma Me Gi Ve Sa`.
- Griglia-calendario (auditor per giorno, "ferie") **fusa** nello stesso foglio con una tabella dati.
- Colonne osservate: `SEGNALATORE`, `FT`, `CONSULENTE`, `N. AUDIT`, `SCAD.CERTIFICATO`, `Reg`, `Prov`, `Cliente`, `EA CODE`, `9001/14001/integr/18000/27000` (X = standard attivo), tipo audit `a/s/t/r/z` (valori reali: `S` sorveglianza, `R` rinnovo, `C`, `P`, `M`, `E`…), `gg`, `importo`, `spese incluse/escluse`, `n° fatt`, `costo valut.` (rimborsi km tipo "0,60 KM"), `BUDGET`, `incassato`, `Cart`, `File`, `Inviato in UK`, `CHIUSURE NC prevista/effettiva`.
- Dati sporchi: testo in colonne numeriche (es. "GIA' FATT."), virgole decimali italiane, casing incoerente (S vs s).

**Per il Rilascio 1 importare SOLO i campi necessari** a popolare: `clients`, `auditors`, `standards`/`audit_standards`, `audits`, `calendar_events`. Le colonne **economiche** (`importo`, `BUDGET`, `incassato`, `n° fatt`, spese, costo valut.) e di **controllo** (`CHIUSURE NC`, `Inviato in UK`) sono Pacchetto 2/3 → **non mappare ora**, ma **conservare le righe grezze** in `imported_rows` così il Pacchetto 2 potrà riprocessarle senza re-import.

Regole di parsing:
- Saltare righe-divisore mese e righe di intestazione settimanale.
- Normalizzare nomi cliente/auditor; raccogliere varianti simili in coda `needs_review` invece di creare duplicati.
- Spezzare `ea_code` multipli mantenendo la stringa originale.
- Mappare i tipi audit (S/R/C/P/M/E) a un set normalizzato.
- Mai inventare valori: campo non interpretabile → `null` + segnalazione in revisione.

C'è già un `clients.json` da una migrazione parziale precedente, con flag `needs_review` e note di varianti: **riusarlo/allinearsi**, non ripartire da zero alla cieca.

---

## 9. Testing (requisito esplicito del committente)

Il codice non è scritto dal committente, quindi la suite deve dare confidenza reale, non solo "il codice gira".

- **Unit (Vitest):** funzioni pure — normalizzazione import, parsing date/decimali italiani, mappatura tipi audit, transizioni di stato.
- **Integrazione (contro Supabase di test):** CRUD + **RLS**. Test che autenticano come utente ente A e **verificano che non possa leggere/scrivere righe di ente B** (INV-1). Test sui ruoli (INV-3).
- **E2E (Playwright):** login → crea evento → modifica → annulla; flusso import (anteprima → conferma → conteggi); export.
- **Import:** test su un campione del file reale che verifichi i conteggi attesi e che le voci sporche finiscano in revisione (INV-4).

Gli invarianti `INV-1…INV-6` (in `AGENTS.md` §6) devono avere ciascuno almeno un test che fallisce se l'invariante si rompe. Non marcare un task "fatto" se i relativi test non esistono o non passano.

---

## 10. Ordine di costruzione consigliato

Lo scaffold Next.js + Tailwind + client Supabase **esiste già**, e clienti/auditor leggono già dati reali. Quindi NON si riparte dallo step 1 classico. Ordine reale:

1. **Base di sicurezza (PRIMA di tutto):**
   - predisporre l'harness di test (Vitest + Playwright + script `test`/`test:e2e`/`typecheck` in `package.json`);
   - migration: aggiungere `ente` alle tabelle dati e `ente` + `sees_all` a `profiles`; allineare i ruoli/`performed_status` ai valori enum esistenti;
   - **policy RLS reali** (sostituire quelle permissive MVP);
   - **auth**: login, sessione, middleware di protezione route, logout;
   - **test di integrazione per INV-1 / INV-2 / INV-3**.
   - *Checkpoint:* fermarsi qui per revisione prima di proseguire.
2. Collegare **calendario + form/dettaglio evento** ai dati reali (oggi è mock).
3. Lista eventi/audit su dati reali + filtri.
4. Anagrafiche: completare clienti (CRUD/dettaglio/errori) e auditor; **aggiungere la route `/norme`** (oggi linkata ma assente).
5. Import una tantum (la parte più iterativa: parsing reale → revisione → conferma → idempotenza).
6. Export Excel reale (oggi è solo un bottone).
7. Stati di errore/loading mancanti, rifiniture, E2E.
8. Deploy in EU su account del cliente; smoke test in produzione.

Note: la route `/settings` linkata in sidebar è fuori R1 (rimuovere il link o lasciarla placeholder). Non introdurre FullCalendar: il calendario custom del prototipo è la base.

Procedere a piccoli incrementi committabili; non passare allo step successivo con i test dello step corrente rossi.