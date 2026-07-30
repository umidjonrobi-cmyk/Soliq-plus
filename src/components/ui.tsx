import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────── Card ──
export function Card({
  children,
  className = '',
  pad = true,
}: {
  children: ReactNode
  className?: string
  pad?: boolean
}) {
  return (
    <div
      className={`rounded-xl border ${pad ? 'p-4 sm:p-5' : ''} ${className}`}
      style={{ background: 'var(--surface-1)', borderColor: 'var(--border-1)' }}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}

// ────────────────────────────────────────────────────────────── Button ──
type BtnProps = {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  title?: string
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled,
  title,
}: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1'
  const sizes = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--brand-500, #2a78d6)', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)' },
    outline: {
      background: 'var(--surface-1)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-1)',
    },
  }
  const brand = variant === 'primary' ? { background: '#2a78d6', color: '#fff' } : styles[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${sizes} ${variant === 'ghost' ? 'hover:opacity-80' : ''} ${className}`}
      style={brand}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────── Badge ──
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'good' | 'warning' | 'critical' | 'brand'
}) {
  const map: Record<string, { bg: string; fg: string }> = {
    neutral: { bg: 'var(--surface-3)', fg: 'var(--text-secondary)' },
    good: { bg: 'rgba(12,163,12,0.12)', fg: 'var(--good-text)' },
    warning: { bg: 'rgba(250,178,25,0.16)', fg: '#8a6100' },
    critical: { bg: 'rgba(208,59,59,0.12)', fg: 'var(--critical)' },
    brand: { bg: 'rgba(42,120,214,0.12)', fg: '#1c5cab' },
  }
  const c = map[tone]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ background: c.bg, color: c.fg }}
    >
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────────────────── DataTable ──
export type Col<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}

export function DataTable<T>({
  cols,
  rows,
  rowKey,
  empty,
  footer,
}: {
  cols: Col<T>[]
  rows: T[]
  rowKey: (row: T) => string
  empty?: string
  footer?: ReactNode
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-1)' }}>
            {cols.map((c) => (
              <th
                key={c.key}
                className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide ${
                  c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                }`}
                style={{ color: 'var(--text-muted)' }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={cols.length}
                className="px-3 py-10 text-center text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                {empty ?? '—'}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="transition-colors hover:bg-[var(--surface-2)]"
                style={{ borderBottom: '1px solid var(--border-1)' }}
              >
                {cols.map((c) => (
                  <td
                    key={c.key}
                    className={`px-3 py-2.5 ${
                      c.align === 'right' ? 'text-right tnum' : c.align === 'center' ? 'text-center' : 'text-left'
                    } ${c.className ?? ''}`}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        {footer}
      </table>
    </div>
  )
}

// ──────────────────────────────────────────────────────────── Segmented ──
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div
      className="inline-flex rounded-lg p-0.5"
      style={{ background: 'var(--surface-3)' }}
      role="tablist"
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            style={
              active
                ? { background: 'var(--surface-1)', color: 'var(--text-primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }
                : { color: 'var(--text-secondary)' }
            }
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ───────────────────────────────────────────────────────────── Toast ──
export function Toast({ message }: { message: string }) {
  return (
    <div
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg"
      style={{ background: '#0b0b0b' }}
      role="status"
    >
      {message}
    </div>
  )
}

// ───────────────────────────────────────────────────────────── Modal ──
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border shadow-2xl"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border-1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-3.5"
          style={{ borderColor: 'var(--border-1)' }}
        >
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-lg leading-none hover:bg-[var(--surface-2)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="close"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div
            className="flex justify-end gap-2 border-t px-5 py-3.5"
            style={{ borderColor: 'var(--border-1)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────────────────── Field ──
export function Field({
  label,
  children,
  error,
}: {
  label: string
  children: ReactNode
  error?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs" style={{ color: 'var(--critical)' }}>
          {error}
        </span>
      )}
    </label>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[#2a78d6] ${props.className ?? ''}`}
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border-1)',
        color: 'var(--text-primary)',
      }}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[#2a78d6] ${props.className ?? ''}`}
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border-1)',
        color: 'var(--text-primary)',
      }}
    />
  )
}
