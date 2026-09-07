import { currency } from '../lib/format'

// Renders the backend-computed price breakdown. Every number here comes from
// the server's cart summary — this component performs no calculations.
export default function OrderSummary({ totals, children }) {
  const { subtotal, discount, coupon, shipping, tax, total, taxRatePercent } = totals || {}
  const has = (v) => typeof v === 'number'
  const money = (v) => (has(v) ? currency(v) : '—')

  return (
    <div className="border border-neutral-200/90 bg-white p-6 shadow-xs">
      <h2 className="text-xs font-black text-neutral-950 uppercase tracking-[0.2em]">Order Summary</h2>
      <dl className="mt-5 space-y-3.5 text-sm">
        <Row label="Subtotal" value={money(subtotal)} />
        {has(discount) && discount > 0 && (
          <div className="flex items-center justify-between text-rose-600">
            <dt className="text-xs font-bold uppercase tracking-wider">
              Discount{coupon?.code ? ` (${coupon.code})` : ''}
            </dt>
            <dd className="font-extrabold">-{money(discount)}</dd>
          </div>
        )}
        <Row
          label="Shipping"
          value={
            shipping === 0
              ? <span className="font-bold text-emerald-600 uppercase text-xs tracking-wider">Free Express</span>
              : money(shipping)
          }
        />
        <Row label={`Tax${has(taxRatePercent) ? ` (${taxRatePercent}%)` : ''}`} value={money(tax)} />
        <div className="my-3 border-t border-neutral-150" />
        <div className="flex items-center justify-between text-base font-black text-neutral-950">
          <dt className="uppercase tracking-wider">Total</dt>
          <dd className="text-xl tracking-tight font-black">{money(total)}</dd>
        </div>
      </dl>
      {children}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-neutral-500">
      <dt className="text-xs font-bold uppercase tracking-wider">{label}</dt>
      <dd className="font-extrabold text-neutral-900">{value}</dd>
    </div>
  )
}
