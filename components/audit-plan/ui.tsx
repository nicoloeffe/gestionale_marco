'use client'

import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Check, ChevronRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUSES, type EventStatus } from './status'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger' | 'danger_g'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 hover:border-ink-300',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-800',
  subtle: 'bg-ink-100 text-ink-700 hover:bg-ink-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  danger_g: 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-3.5 text-[13.5px] gap-2',
  lg: 'h-10 px-4 text-sm gap-2',
}

export type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  iconRight?: LucideIcon
}

export function Btn({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className,
  children,
  ...props
}: BtnProps) {
  const iconClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        buttonSizes[size],
        buttonVariants[variant],
        className
      )}
      {...props}
    >
      {Icon ? <Icon className={iconClass} /> : null}
      {children}
      {IconRight ? <IconRight className={iconClass} /> : null}
    </button>
  )
}

export function Pill({ status, size = 'md' }: { status: EventStatus; size?: 'sm' | 'md' }) {
  const item = STATUSES[status]
  const sz = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]'

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full font-medium ring-1', sz, item.bg, item.text, item.ring)}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.dot }} />
      {item.label}
    </span>
  )
}

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      {label ? (
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[12.5px] font-medium text-ink-700">
            {label}
            {required ? <span className="ml-0.5 text-rose-600">*</span> : null}
          </span>
          {hint ? <span className="text-[11.5px] text-ink-400">{hint}</span> : null}
        </div>
      ) : null}
      {children}
    </label>
  )
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { icon?: LucideIcon }>(
  ({ className, icon: Icon, ...props }, ref) => (
    <div className="relative">
      {Icon ? (
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400">
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
      <input
        ref={ref}
        className={cn(
          'ring-brand h-9 w-full rounded-lg border border-ink-200 bg-white text-[13.5px] text-ink-800 placeholder:text-ink-400',
          Icon ? 'pl-8 pr-3' : 'px-3',
          className
        )}
        {...props}
      />
    </div>
  )
)
Input.displayName = 'Input'

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'ring-brand h-9 w-full appearance-none rounded-lg border border-ink-200 bg-white pl-3 pr-8 text-[13.5px] text-ink-800',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400">
        <ChevronRight className="h-4 w-4 rotate-90" />
      </span>
    </div>
  )
}

export function TextArea({ className, rows = 3, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'ring-brand w-full resize-none rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13.5px] text-ink-800 placeholder:text-ink-400',
        className
      )}
      {...props}
    />
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="group inline-flex items-center gap-2">
      <span className={cn('relative h-5 w-9 rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-ink-200')}>
        <span className={cn('absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', checked && 'translate-x-4')} />
      </span>
      {label ? <span className="text-[13px] text-ink-700">{label}</span> : null}
    </button>
  )
}

export function Avatar({ name, initials, size = 'md' }: { name?: string; initials?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-7 w-7 text-[11px]',
    lg: 'h-9 w-9 text-[12px]',
  }[size]
  const text = initials ?? name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <span className={cn('inline-flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800 ring-2 ring-white', sz)}>
      {text}
    </span>
  )
}

export function Card({ className, children, padded = true }: { className?: string; children: React.ReactNode; padded?: boolean }) {
  return <div className={cn('rounded-xl border border-ink-200 bg-white shadow-card', padded && 'p-5', className)}>{children}</div>
}

export function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <h3 className="text-[14px] font-semibold text-ink-800">{title}</h3>
        {sub ? <p className="mt-0.5 text-[12.5px] text-ink-500">{sub}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-ink-200 bg-ink-50 px-1 font-mono text-[10.5px] text-ink-600">
      {children}
    </kbd>
  )
}

export function KpiCard({
  label,
  value,
  delta,
  deltaTone = 'neutral',
  icon: Icon,
  hint,
  accent,
}: {
  label: string
  value: string | number
  delta?: string
  deltaTone?: 'up' | 'down' | 'neutral'
  icon?: LucideIcon
  hint?: string
  accent?: string
}) {
  const tones = {
    up: 'bg-emerald-50 text-emerald-700',
    down: 'bg-rose-50 text-rose-700',
    neutral: 'bg-ink-100 text-ink-600',
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-wide text-ink-500">{label}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-[28px] font-semibold tabular-nums tracking-tight text-ink-900">{value}</div>
            {delta ? <span className={cn('rounded px-1.5 py-0.5 text-[11.5px] font-medium', tones[deltaTone])}>{delta}</span> : null}
          </div>
          {hint ? <div className="mt-1.5 text-[12px] text-ink-400">{hint}</div> : null}
        </div>
        {Icon ? (
          <span className={cn('inline-flex h-9 w-9 items-center justify-center rounded-lg', accent ?? 'bg-brand-50 text-brand-600')}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function Notice({
  tone,
  title,
  text,
  action,
}: {
  tone: 'amber' | 'brand' | 'rose' | 'ink'
  title: string
  text: string
  action?: React.ReactNode
}) {
  const styles = {
    amber: ['bg-amber-50/60 border-amber-100', 'bg-amber-100 text-amber-700', AlertTriangle],
    brand: ['bg-brand-50/60 border-brand-100', 'bg-brand-100 text-brand-700', Info],
    rose: ['bg-rose-50/60 border-rose-100', 'bg-rose-100 text-rose-700', AlertTriangle],
    ink: ['bg-ink-50 border-ink-100', 'bg-ink-200 text-ink-600', Check],
  } as const
  const [box, iconBox, Icon] = styles[tone]

  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-3', box)}>
      <span className={cn('inline-flex h-7 w-7 shrink-0 items-center justify-center rounded', iconBox)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-ink-800">{title}</div>
        <div className="mt-0.5 text-[12px] text-ink-500">{text}</div>
      </div>
      {action}
    </div>
  )
}
