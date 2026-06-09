# AGENTS.md

Guida operativa per agenti di sviluppo (Claude Code, Codex) su questo repository.
**Leggere interamente prima di scrivere codice.** Questo file ha precedenza sulle assunzioni di default dell'agente.

> Nota: Claude Code legge `CLAUDE.md`, Codex legge `AGENTS.md`. Mantenere un solo file canonico (questo) e creare `CLAUDE.md` come symlink o con una riga: `Vedi AGENTS.md`.

---

## 1. Cos'è questo progetto

Gestionale interno per la pianificazione di audit e la gestione di anagrafiche, per una rete di tre piccole società di consulenza/audit ISO. Sostituisce progressivamente un vecchio gestionale. **Questo repo riguarda il Rilascio 1** (calendario + anagrafiche + import iniziale). Vedi `BUILD_SPEC_Rilascio1.md` per il task di build.

Utenti: ~8 interni. Dati: ~470 clienti, ~430 audit, ~300 eventi, 3 società ("ente").

---

## 2. Stack

- **Next.js `16` (App Router)** + **React 19** + **TypeScript** (strict; `allowJs: true`) — confermato dall'audit. Progetto nella sottocartella `gestionale_marco/gestionale_marco`.
- **Tailwind CSS v4** + shadcn/Radix UI + componenti custom. Calendario **custom** (FullCalendar è installato ma NON usato: non introdurlo).
- **Valori enum DB in inglese** (non rinominare lo schema già seedato): ruoli `admin` / `operator` / `viewer`; `performed_status` = `yes` / `no` / `unknown`. Le etichette in UI restano in italiano.
- **Supabase**: PostgreSQL, Auth, Row Level Security (RLS), Storage (non usato in R1). Regione **EU**.
- Hosting frontend: Vercel (o equivalente).
- Test: **Vitest** (unit), **Playwright** (E2E), test di integrazione contro un'istanza Supabase di test.

Questo elenco è il *target*: lo stack reale del repo va **verificato, non assunto**. Se differisce, adattarsi a ciò che c'è e segnalarlo, non imporre questo stack a forza.

### Repo esistente — regole di lavoro (PRIORITARIE)

Questo repository **esiste già, è popolato e gira** (apre il sito in locale). Contiene il prototipo ad alta fedeltà, che è la **fonte di verità visiva e strutturale**.

1. **Non ricostruire da zero.** Lavorare su ciò che c'è, con modifiche piccole e additive.
2. **Non riscrivere né rifattorizzare codice che già funziona** senza chiedere conferma. Un refactor ampio va proposto e approvato *prima*, mai fatto di iniziativa.
3. **All'inizio di una sessione, prima di toccare codice, fare un breve audit** e riportarne lo stato: framework e linguaggio reali, cosa è collegato a Supabase vs dati mock, schermate complete vs stub, test esistenti, comandi disponibili. Non assumere lo stato — verificarlo.
4. **Riusare** il design system e la schermata calendario del prototipo; non reinventare la UI.

---

## 3. Comandi

```bash
# Esistenti nel repo:
npm install
npm run dev            # ambiente di sviluppo
npm run build          # build di produzione
npm run start
npm run lint           # eslint

# DA AGGIUNGERE (non esistono ancora — fa parte del lavoro):
npm run typecheck      # tsc --noEmit
npm run test           # unit (vitest) — harness da creare
npm run test:e2e       # end-to-end (playwright) — harness da creare
npx supabase db push   # migration (richiede Supabase CLI)
```

Allo stato attuale il repo non ha né test runner né script `typecheck`/`test`: **predisporli (Vitest + Playwright + script) è parte dello Step 1.** Finché non ci sono, il minimo è che `build` e `lint` passino. Da quando esistono: non dichiarare "fatto" un task con `typecheck`/`lint`/`test` rossi.

---

## 4. Regole sul livello dati (NON negoziabili)

1. **L'isolamento tra le tre società è garantito da RLS a livello di database**, non da `if` nel codice applicativo. Ogni tabella con dati di società ha policy RLS basate sull'`ente` dell'utente. ✅ Implementato e verificato in Step 1 (migration `002_security_base.sql`; test INV-1/2/3 verdi sul progetto di test). Non indebolire queste policy.
2. **La chiave di servizio (`service_role`) non entra MAI nel codice client/browser.** È usata solo in script server-side (migration, import) tramite variabile d'ambiente server-only.
3. Tutto l'accesso ai dati passa dal client Supabase con la sessione dell'utente autenticato. Niente query che aggirano RLS dal frontend.
4. Niente `localStorage`/`sessionStorage` per dati applicativi: usare lo stato React e il database.
5. ⛔ **Mai applicare al DB reale un backfill `ente` di comodo** (es. `ENTE_DEFAULT`). Quel backfill esiste solo per il progetto di test. La migration sul DB di **produzione** richiede una mappatura `ente` **reale**, che assegni ogni riga esistente alla società corretta (ISOPRAXIS / ISOQAR Italia / METI Mantova) a partire dai dati legacy/Excel. È un task a sé, legato all'import — non spingere `002` sul DB reale finché non c'è quella mappatura.

---

## 5. Variabili d'ambiente

```
NEXT_PUBLIC_SUPABASE_URL=        # pubblica
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # pubblica
SUPABASE_SERVICE_ROLE_KEY=       # SERVER ONLY — mai esposta al client, mai committata
```

`.env.local` è in `.gitignore`. Mai committare segreti. Mai loggare chiavi.

---

## 6. Invarianti critici da proteggere (vedi build spec per i test)

Questi non devono mai rompersi. Ogni modifica che li tocca richiede test espliciti:

- **INV-1 Isolamento società:** un utente dell'ente A non può leggere né scrivere righe dell'ente B, da nessun endpoint.
- **INV-2 Auth obbligatoria:** nessun accesso ai dati senza sessione valida.
- **INV-3 Ruoli:** "sola lettura" non muta nulla; "operatore" non gestisce utenti; permessi rispettati.
- **INV-4 Import sicuro:** nessuna scrittura definitiva prima della conferma esplicita; ri-eseguire l'import non duplica i dati; le voci dubbie finiscono in coda di revisione.
- **INV-5 Nessuna perdita dati:** annullamento ≠ cancellazione (vedi decisione su delete/annulla).
- **INV-6 Date/fuso:** gli eventi si salvano in UTC e si mostrano in `Europe/Rome`.

---

## 7. Decisioni aperte — NON risolvere in autonomia

Se incontri una di queste, **fermati e chiedi**, non scegliere in silenzio:

- **Relazione evento ↔ auditor:** lo schema v1 dice *un auditor per evento*, il prototipo usa *più auditor*. Default provvisorio per R1: **uno-a-uno** con un eventuale secondo campo opzionale ("consulente"). Implementare il modello in modo che il passaggio a molti-a-molti non richieda di riscrivere tutto, ma **non** introdurre la tabella di collegamento finché non confermato.
- Calendario unico con filtri vs separato per società.
- Se gli eventi si eliminano o solo si annullano.

---

## 8. Fuori scope per il Rilascio 1 — non costruire

Non implementare (sono pacchetti successivi, costruirli ora è spreco e scope creep):

- Gestione economica: importi, budget, incassato, fatture, spese (Pacchetto 2).
- Documenti, modulistica, controlli, non conformità (Pacchetto 3).
- Replica del modulo "Sicurezza" del legacy (gruppi, applicazioni, sync, registro).
- Import Excel ricorrente/sincronizzato (R1 è import **una tantum**).
- Notifiche, audit log, portali esterni, reportistica avanzata.

In caso di dubbio se una feature è dentro R1, consultare `BUILD_SPEC_Rilascio1.md`. Se non c'è, è fuori.

---

## 9. Convenzioni di codice

- TypeScript strict; niente `any` se evitabile.
- **Next 16: usare `proxy.ts` (funzione `proxy`), non `middleware.ts`** — quest'ultimo è deprecato. Non reintrodurre `middleware.ts` (se coesistono, l'app diventa instabile). Il `proxy` fa solo check leggero della sessione + redirect: la validazione vera sta in RLS + Server Components, niente auth pesante nel proxy.
- Componenti funzionali + hook. Server Components dove sensato; `"use client"` solo dove serve interattività.
- Nomi tabelle/colonne DB in `snake_case`; tipi e componenti in `PascalCase`; variabili in `camelCase`.
- UI in **italiano** (è un gestionale interno italiano).
- Gestire sempre stati di **loading** ed **errore** nelle viste che leggono dati.
- Commit piccoli e descrittivi.

---

## 10. Definizione di "fatto"

Una feature è completa quando: funziona sul percorso felice **e** sui casi limite ragionevoli; ha stati di loading/errore; `typecheck`/`lint`/`test` passano; ha test che **asseriscono il comportamento** (non solo che il codice gira) e coprono gli invarianti toccati; rispetta le regole §4 e §6.