import { currency } from '../lib/format'

// Renders the backend-computed price breakdown. Every number here comes from
// the server's cart summary — this component performs no calculations.
export default function OrderSummary({ totals, children }) {
  const { subtotal, discount, coupon, shipping, tax, total, taxRatePercent } = totals || {}
  const has = (v) => typeof v === 'number'
  const money = (v) => (has(v) ? currency(v) : '—')

  return (
    <div className="border border-slate-200 bg-white p-6 dark:border-slate-900 dark:bg-slate-950">
      <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Order Summary</h2>
      <dl className="mt-5 space-y-3.5 text-sm">
        <Row label="Subtotal" value={money(subtotal)} />
        {has(discount) && discount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <dt className="text-xs font-medium uppercase tracking-wider">
              Discount{coupon?.code ? ` (${coupon.code})` : ''}
            </dt>
            <dd className="font-semibold">-{money(discount)}</dd>
          </div>
        )}
        <Row
          label="Shipping"
          value={
            shipping === 0
              ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">Free</span>
              : money(shipping)
          }
        />
        <Row label={`Tax${has(taxRatePercent) ? ` (${taxRatePercent}%)` : ''}`} value={money(tax)} />
        <div className="my-3 border-t border-slate-100 dark:border-slate-900" />
        <div className="flex items-center justify-between text-base font-extrabold text-slate-900 dark:text-white">
          <dt>Total</dt>
          <dd className="text-lg tracking-tight">{money(total)}</dd>
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
