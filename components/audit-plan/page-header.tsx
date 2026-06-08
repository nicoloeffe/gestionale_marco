export function PageHeader({
  title,
  desc,
  primary,
  secondary,
  breadcrumb,
}: {
  title: string
  desc?: string
  primary?: React.ReactNode
  secondary?: React.ReactNode
  breadcrumb?: string
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-6">
      <div className="min-w-0">
        {breadcrumb ? <div className="mb-1.5 text-[12px] text-ink-400">{breadcrumb}</div> : null}
        <h2 className="text-[22px] font-semibold tracking-tight text-ink-900">{title}</h2>
        {desc ? <p className="mt-1 max-w-2xl text-[13.5px] text-ink-500">{desc}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {secondary}
        {primary}
      </div>
    </div>
  )
}
