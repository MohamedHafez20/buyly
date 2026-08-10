import { currency } from '../lib/format'

export default function OrderSummary({ totals, children }) {
  const { subtotal, shipping, tax, total } = totals
  return (
    <div className="border border-slate-200 bg-white p-6 dark:border-slate-900 dark:bg-slate-950">
      <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Order Summary</h2>
      <dl className="mt-5 space-y-3.5 text-sm">
        <Row label="Subtotal" value={currency(subtotal)} />
        <Row label="Shipping" value={shipping === 0 ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">Free</span> : currency(shipping)} />
        <Row label="Tax (8%)" value={currency(tax)} />
        <div className="my-3 border-t border-slate-100 dark:border-slate-900" />
        <div className="flex items-center justify-between text-base font-extrabold text-slate-900 dark:text-white">
          <dt>Total</dt>
          <dd className="text-lg tracking-tight">{currency(total)}</dd>
        </div>
      </dl>
      {children}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
      <dt className="text-xs font-medium uppercase tracking-wider">{label}</dt>
      <dd className="font-semibold text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  )
}
