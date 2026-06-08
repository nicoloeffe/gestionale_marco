// Reusable UI primitives — icons, buttons, badges, inputs

const Icon = ({ name, className='w-4 h-4', stroke=2 }) => {
  const props = { width:'1em', height:'1em', viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:stroke, strokeLinecap:'round', strokeLinejoin:'round', className };
  switch (name) {
    case 'dashboard': return <svg {...props}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>;
    case 'calendar': return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case 'list': return <svg {...props}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>;
    case 'building': return <svg {...props}><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M16 9h2a2 2 0 0 1 2 2v10"/><path d="M8 7h2M8 11h2M8 15h2"/><path d="M2 21h20"/></svg>;
    case 'users': return <svg {...props}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 4.5"/></svg>;
    case 'shield': return <svg {...props}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></svg>;
    case 'upload': return <svg {...props}><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>;
    case 'settings': return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case 'search': return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'plus': return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'chev-l': return <svg {...props}><path d="M15 18l-6-6 6-6"/></svg>;
    case 'chev-r': return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chev-d': return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'x': return <svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'check': return <svg {...props}><path d="M5 12l5 5 9-11"/></svg>;
    case 'edit': return <svg {...props}><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/></svg>;
    case 'trash': return <svg {...props}><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></svg>;
    case 'filter': return <svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/></svg>;
    case 'bell': return <svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
    case 'help': return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></svg>;
    case 'alert': return <svg {...props}><path d="M10.3 3.7L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>;
    case 'info': return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>;
    case 'check-circle': return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></svg>;
    case 'doc': return <svg {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>;
    case 'download': return <svg {...props}><path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 19h16"/></svg>;
    case 'more': return <svg {...props}><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>;
    case 'sort': return <svg {...props}><path d="M7 4v16M3 8l4-4 4 4"/><path d="M17 20V4M13 16l4 4 4-4"/></svg>;
    case 'columns': return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/></svg>;
    case 'table': return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg>;
    case 'clock': return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'tag': return <svg {...props}><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9z"/><circle cx="8" cy="8" r="1.5"/></svg>;
    case 'pin': return <svg {...props}><path d="M12 21v-7M8 3h8l-1 5 3 4H6l3-4-1-5z"/></svg>;
    case 'mail': return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case 'phone': return <svg {...props}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2z"/></svg>;
    case 'spark': return <svg {...props}><path d="M3 17l4-8 5 4 4-7 5 9"/></svg>;
    case 'flag': return <svg {...props}><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></svg>;
    case 'circle': return <svg {...props}><circle cx="12" cy="12" r="4"/></svg>;
    default: return <span className={className} />;
  }
};

const cx = (...a) => a.filter(Boolean).join(' ');

const Btn = ({ variant='secondary', size='md', icon, iconRight, children, className='', ...rest }) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm:'h-8 px-3 text-[13px] gap-1.5', md:'h-9 px-3.5 text-[13.5px] gap-2', lg:'h-10 px-4 text-sm gap-2' };
  const variants = {
    primary:   'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 hover:border-ink-300',
    ghost:     'bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-800',
    subtle:    'bg-ink-100 text-ink-700 hover:bg-ink-200',
    danger:    'bg-rose-600 text-white hover:bg-rose-700',
    danger_g:  'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50',
  };
  return (
    <button className={cx(base, sizes[size], variants[variant], className)} {...rest}>
      {icon ? <Icon name={icon} className={size==='sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} className={size==='sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} /> : null}
    </button>
  );
};

const Pill = ({ status, size='md' }) => {
  const s = STATUSES[status]; if (!s) return null;
  const base = 'inline-flex items-center gap-1.5 rounded-full ring-1 font-medium';
  const sz = size==='sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]';
  return (
    <span className={cx(base, sz, s.bg, s.text, s.ring)}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
};

const Field = ({ label, hint, required, children, className='' }) => (
  <label className={cx('block', className)}>
    {label ? (
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12.5px] font-medium text-ink-700">{label}{required ? <span className="text-rose-600 ml-0.5">*</span> : null}</span>
        {hint ? <span className="text-[11.5px] text-ink-400">{hint}</span> : null}
      </div>
    ) : null}
    {children}
  </label>
);

const Input = React.forwardRef(({ className='', icon, ...rest }, ref) => (
  <div className="relative">
    {icon ? <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"><Icon name={icon} className="w-4 h-4" /></span> : null}
    <input ref={ref} className={cx('w-full h-9 rounded-lg border border-ink-200 bg-white text-[13.5px] text-ink-800 placeholder-ink-400 ring-brand', icon ? 'pl-8 pr-3' : 'px-3', className)} {...rest} />
  </div>
));

const Select = ({ className='', children, ...rest }) => (
  <div className="relative">
    <select className={cx('appearance-none w-full h-9 rounded-lg border border-ink-200 bg-white pl-3 pr-8 text-[13.5px] text-ink-800 ring-brand', className)} {...rest}>{children}</select>
    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"><Icon name="chev-d" className="w-4 h-4" /></span>
  </div>
);

const TextArea = ({ className='', rows=3, ...rest }) => (
  <textarea rows={rows} className={cx('w-full rounded-lg border border-ink-200 bg-white text-[13.5px] text-ink-800 placeholder-ink-400 px-3 py-2 ring-brand resize-none', className)} {...rest} />
);

const Toggle = ({ checked, onChange, label }) => (
  <button type="button" onClick={() => onChange(!checked)} className={cx('inline-flex items-center gap-2 group')}>
    <span className={cx('relative w-9 h-5 rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-ink-200')}>
      <span className={cx('absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4' : 'translate-x-0')} />
    </span>
    {label ? <span className="text-[13px] text-ink-700">{label}</span> : null}
  </button>
);

const Avatar = ({ user, size='md' }) => {
  const sz = { sm:'w-6 h-6 text-[10px]', md:'w-7 h-7 text-[11px]', lg:'w-9 h-9 text-[12px]' }[size];
  // Stable color from id
  const palette = ['bg-brand-100 text-brand-800','bg-emerald-100 text-emerald-800','bg-amber-100 text-amber-800','bg-rose-100 text-rose-800','bg-indigo-100 text-indigo-800','bg-violet-100 text-violet-800','bg-cyan-100 text-cyan-800','bg-fuchsia-100 text-fuchsia-800'];
  const idx = user ? user.id.charCodeAt(1) % palette.length : 0;
  return <span className={cx('inline-flex items-center justify-center rounded-full font-semibold ring-2 ring-white', sz, palette[idx])}>{user ? user.iniziali : '?'}</span>;
};

const Card = ({ className='', children, padded=true }) => (
  <div className={cx('bg-white border border-ink-200 rounded-xl shadow-card', padded && 'p-5', className)}>{children}</div>
);

const SectionTitle = ({ title, sub, action }) => (
  <div className="flex items-center justify-between mb-3">
    <div>
      <h3 className="text-[14px] font-semibold text-ink-800">{title}</h3>
      {sub ? <p className="text-[12.5px] text-ink-500 mt-0.5">{sub}</p> : null}
    </div>
    {action}
  </div>
);

const Kbd = ({ children }) => <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded border border-ink-200 bg-ink-50 text-[10.5px] font-mono text-ink-600">{children}</kbd>;

Object.assign(window, { Icon, cx, Btn, Pill, Field, Input, Select, TextArea, Toggle, Avatar, Card, SectionTitle, Kbd });
