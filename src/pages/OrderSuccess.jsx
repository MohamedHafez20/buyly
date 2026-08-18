import { Link, useLocation, Navigate } from 'react-router-dom'
import { currency, orderRef } from '../lib/format'
import { Check, ArrowRight, Truck } from '../components/icons'

export default function OrderSuccess() {
  const { state } = useLocation()
  if (!state?.orderId) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center bg-white">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <Check size={26} />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold uppercase tracking-tight text-neutral-900">Order Confirmed</h1>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        Thank you for your purchase. A confirmation has been sent to <strong className="text-neutral-750 font-bold normal-case">{state.email}</strong>.
      </p>

      <div className="mt-8 border border-neutral-200/60 bg-white p-6 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Order Number</span>
          <span className="font-mono text-sm font-bold text-neutral-900">{orderRef(state.orderId)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Total Paid</span>
          <span className="text-lg font-black text-neutral-900">{currency(state.total)}</span>
        </div>
        <div className="mt-5 flex items-center gap-3 bg-neutral-50 p-4 text-xs font-semibold uppercase tracking-wider text-neutral-600">
          <Truck size={16} className="text-neutral-850" />
          <span>Estimated delivery in <strong className="text-black font-extrabold">3–5 business days</strong>.</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 bg-black px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 rounded-none cursor-pointer"
        >
          Continue Shopping <ArrowRight size={13} />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center border border-neutral-300 px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-800 transition-colors hover:bg-neutral-50 rounded-none cursor-pointer"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
