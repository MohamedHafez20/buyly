import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { listMyOrders } from '../services/orders'
import { useResource } from '../lib/useResource'
import { currency, formatDate, orderRef } from '../lib/format'
import { ErrorState, Spinner } from '../components/States'
import { Bag } from '../components/icons'

// Customer-facing order history. Order notifications link here so a shopper can
// jump straight from "Order shipped" to the order it refers to.
const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-sky-50 text-sky-700 border-sky-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
}

function StatusPill({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-neutral-100 text-neutral-700 border-neutral-200'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  )
}

export default function Orders() {
  const { isAuthenticated } = useAuth()
  const { data, loading, error, reload } = useResource(
    () => (isAuthenticated ? listMyOrders() : Promise.resolve([])),
    [isAuthenticated],
  )
  const orders = data || []

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-neutral-100 text-neutral-400"><Bag size={22} /></span>
        <h1 className="mt-5 text-2xl font-black uppercase tracking-tight text-neutral-900">Your orders</h1>
        <p className="mt-2 text-sm font-medium text-neutral-500">Sign in to view your order history.</p>
        <Link to="/login" className="mt-6 inline-flex items-center justify-center bg-black px-8 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900">My Orders</h1>
        <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          {loading ? 'Loading…' : `${orders.length} order${orders.length === 1 ? '' : 's'}`}
        </p>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-24"><Spinner size={26} /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : orders.length === 0 ? (
          <div className="grid place-items-center border border-dashed border-neutral-200 py-24 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400"><Bag size={20} /></span>
            <p className="mt-4 text-sm font-extrabold uppercase tracking-widest text-neutral-900">No orders yet</p>
            <p className="mt-1.5 text-xs font-medium text-neutral-400">When you place an order it will appear here.</p>
            <Link to="/shop" className="mt-6 inline-flex items-center justify-center bg-black px-7 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o._id} className="rounded-xl border border-neutral-200 p-5 transition-shadow hover:shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-neutral-900">{orderRef(o._id)}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">{formatDate(o.createdAt)}</p>
                  </div>
                  <StatusPill status={o.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-medium text-neutral-500">
                    {o.items?.length || 0} item{(o.items?.length || 0) === 1 ? '' : 's'}
                    {o.items?.[0] ? ` · ${o.items[0].name}${o.items.length > 1 ? ` +${o.items.length - 1} more` : ''}` : ''}
                  </p>
                  <p className="text-base font-black text-neutral-900">{currency(o.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
