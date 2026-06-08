// Sidebar + Topbar shell
const SidebarItem = ({ active, icon, label, badge, onClick }) => (
  <button onClick={onClick} className={cx(
    'w-full group flex items-center gap-3 px-3 h-9 rounded-lg text-[13.5px] transition-colors',
    active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-800'
  )}>
    <span className={active ? 'text-brand-600' : 'text-ink-400 group-hover:text-ink-600'}><Icon name={icon} className="w-[18px] h-[18px]" stroke={active?2.2:1.8} /></span>
    <span className="flex-1 text-left">{label}</span>
    {badge ? <span className={cx('h-5 min-w-[20px] inline-flex items-center justify-center rounded-full px-1.5 text-[11px] font-semibold', active ? 'bg-brand-600 text-white' : 'bg-ink-200 text-ink-700')}>{badge}</span> : null}
  </button>
);

const NAV = [
  { id:'dashboard', label:'Dashboard',   icon:'dashboard' },
  { id:'calendar',  label:'Calendario',  icon:'calendar', badge: 23 },
  { id:'audit',     label:'Audit / Eventi', icon:'list' },
  { id:'aziende',   label:'Aziende',     icon:'building' },
  { id:'auditor',   label:'Auditor',     icon:'users' },
  { id:'norme',     label:'Norme',       icon:'shield' },
  { id:'import',    label:'Import dati', icon:'upload' },
];

const Sidebar = ({ view, setView }) => (
  <aside className="w-[244px] shrink-0 border-r border-ink-200 bg-white flex flex-col">
    {/* Brand */}
    <div className="h-14 px-4 flex items-center gap-2.5 border-b border-ink-100">
      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-white inline-flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10"/></svg>
      </span>
      <div className="leading-tight">
        <div className="text-[13.5px] font-semibold text-ink-800 tracking-tight">AuditPlan</div>
        <div className="text-[10.5px] text-ink-400 -mt-0.5">Demo Group · v0.4 MVP</div>
      </div>
    </div>

    {/* Nav */}
    <div className="flex-1 px-2.5 py-3 overflow-y-auto">
      <div className="px-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">Operativo</div>
      <div className="space-y-0.5">
        {NAV.slice(0,3).map(n => <SidebarItem key={n.id} {...n} active={view===n.id} onClick={()=>setView(n.id)} />)}
      </div>
      <div className="px-2 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">Anagrafiche</div>
      <div className="space-y-0.5">
        {NAV.slice(3,6).map(n => <SidebarItem key={n.id} {...n} active={view===n.id} onClick={()=>setView(n.id)} />)}
      </div>
      <div className="px-2 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">Strumenti</div>
      <div className="space-y-0.5">
        {NAV.slice(6).map(n => <SidebarItem key={n.id} {...n} active={view===n.id} onClick={()=>setView(n.id)} />)}
        <SidebarItem id="settings" label="Impostazioni" icon="settings" active={view==='settings'} onClick={()=>setView('settings')} />
      </div>
    </div>

    {/* User card */}
    <div className="p-3 border-t border-ink-100">
      <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-ink-50 cursor-pointer">
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-white inline-flex items-center justify-center text-[11px] font-semibold ring-2 ring-white shadow-sm">NL</span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-ink-800 truncate">Pianificatore Demo</div>
          <div className="text-[11px] text-ink-500 truncate">demo@example.com</div>
        </div>
        <Icon name="chev-d" className="w-4 h-4 text-ink-400" />
      </div>
    </div>
  </aside>
);

const Topbar = ({ title, subtitle, actions }) => (
  <header className="h-14 shrink-0 border-b border-ink-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
    <div className="h-full px-6 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-semibold text-ink-800 truncate">{title}</h1>
          {subtitle ? <span className="text-[12.5px] text-ink-500 truncate">{subtitle}</span> : null}
        </div>
      </div>
      <div className="relative w-[320px]">
        <Input icon="search" placeholder="Cerca audit, aziende, auditor…" />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2"><Kbd>⌘K</Kbd></span>
      </div>
      <button className="w-9 h-9 rounded-lg border border-ink-200 bg-white text-ink-500 hover:bg-ink-50 inline-flex items-center justify-center relative">
        <Icon name="bell" className="w-[18px] h-[18px]" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
      </button>
      <button className="w-9 h-9 rounded-lg border border-ink-200 bg-white text-ink-500 hover:bg-ink-50 inline-flex items-center justify-center"><Icon name="help" className="w-[18px] h-[18px]" /></button>
      {actions}
    </div>
  </header>
);

// Page header (title + description + actions row, used inside main content)
const PageHeader = ({ title, desc, primary, secondary, breadcrumb }) => (
  <div className="flex items-start justify-between gap-6 mb-5">
    <div className="min-w-0">
      {breadcrumb ? <div className="text-[12px] text-ink-400 mb-1.5">{breadcrumb}</div> : null}
      <h2 className="text-[22px] font-semibold text-ink-900 tracking-tight">{title}</h2>
      {desc ? <p className="text-[13.5px] text-ink-500 mt-1 max-w-2xl">{desc}</p> : null}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {secondary}
      {primary}
    </div>
  </div>
);

// KPI card
const KpiCard = ({ label, value, delta, deltaTone='neutral', icon, hint, accent }) => {
  const tones = { up:'text-emerald-700 bg-emerald-50', down:'text-rose-700 bg-rose-50', neutral:'text-ink-600 bg-ink-100' };
  return (
    <div className="bg-white border border-ink-200 rounded-xl shadow-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[12px] font-medium text-ink-500 uppercase tracking-wide">{label}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-[28px] font-semibold text-ink-900 tabular-nums tracking-tight">{value}</div>
            {delta ? <span className={cx('text-[11.5px] font-medium px-1.5 py-0.5 rounded', tones[deltaTone])}>{delta}</span> : null}
          </div>
          {hint ? <div className="mt-1.5 text-[12px] text-ink-400">{hint}</div> : null}
        </div>
        {icon ? (
          <span className={cx('w-9 h-9 rounded-lg inline-flex items-center justify-center', accent || 'bg-brand-50 text-brand-600')}>
            <Icon name={icon} className="w-[18px] h-[18px]" />
          </span>
        ) : null}
      </div>
    </div>
  );
};

Object.assign(window, { Sidebar, Topbar, PageHeader, KpiCard, NAV });
