// Shared light-mode admin primitives.

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-3xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm leading-6 text-neutral-500">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
    </div>
  )
}

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-lg border border-neutral-200 bg-white shadow-sm shadow-neutral-200/60 ${className}`}>
      {children}
    </div>
  )
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-bold text-neutral-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export const tableHeadCls =
  'border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500'

export const tableRowCls = 'text-sm transition-colors hover:bg-neutral-50/80'

export const inputCls =
  'w-full rounded-md border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-950/5'

export const primaryBtnCls =
  'inline-flex items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60'

export const secondaryBtnCls =
  'inline-flex items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:opacity-60'

const statusConfig = {
  pending: { dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid: { dot: 'bg-sky-500', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  processing: { dot: 'bg-indigo-500', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  shipped: { dot: 'bg-indigo-500', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  completed: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  delivered: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  active: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  draft: { dot: 'bg-neutral-400', bg: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
  hidden: { dot: 'bg-neutral-400', bg: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
  admin: { dot: 'bg-white', bg: 'bg-neutral-950 text-white border-neutral-950' },
  user: { dot: 'bg-neutral-400', bg: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
}

export function StatusBadge({ status = 'unknown' }) {
  const conf = statusConfig[status] || { dot: 'bg-neutral-400', bg: 'bg-neutral-100 text-neutral-700 border-neutral-200' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${conf.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
      {status}
    </span>
  )
}
