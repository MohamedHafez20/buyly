import { Fragment, useMemo, useState } from 'react'
import { useStore } from '../../context/useStore'
import { listAllOrders, updateOrderStatus } from '../../services/orders'
import { useResource } from '../../lib/useResource'
import { currency, formatDate, orderRef } from '../../lib/format'
import { ErrorState, LoadingState } from '../../components/States'
import { Card, PageHeader, StatusBadge, inputCls, tableHeadCls, tableRowCls } from '../../components/admin/ui'
import { Bag, ChevronDown, ChevronUp, Search } from '../../components/icons'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

const statusSelectCls = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-sky-50 text-sky-700 border-sky-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function AdminOrders() {
  const { notify } = useStore()
  const { data, loading, error, reload, setData } = useResource(() => listAllOrders())
  const orders = data || []
  const [expanded, setExpanded] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  const visibleOrders = useMemo(() => {
    const term = q.trim().toLowerCase()
    return orders.filter((order) => {
      const customer = `${order.user?.name || ''} ${order.user?.email || ''}`.toLowerCase()
      const matchesText = !term || `${orderRef(order._id)} ${customer}`.toLowerCase().includes(term)
      const matchesStatus = status === 'all' || order.status === status
      return matchesText && matchesStatus
    })
  }, [orders, q, status])

  const changeStatus = async (id, nextStatus) => {
    setUpdatingId(id)
    try {
      const updated = await updateOrderStatus(id, nextStatus)
      setData((prev) => (prev || []).map((order) => (order._id === id ? { ...order, status: updated.status } : order)))
      notify(`Order ${orderRef(id)} updated to ${nextStatus}`)
    } catch (err) {
      notify(err.message || 'Could not update status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle={loading ? 'Loading orders...' : `Track, review, and update ${orders.length} customer orders.`} />

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_220px]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by order reference or customer" className={`${inputCls} pl-10`} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="all">All statuses</option>
            {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Loading orders panel" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : visibleOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm font-bold text-neutral-950">No orders found</p>
          <p className="mt-1 text-sm text-neutral-500">Adjust the search or status filter to review orders.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className={tableHeadCls}>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {visibleOrders.map((order) => {
                  const isOpen = expanded === order._id
                  const customerName = order.user?.name || 'Guest customer'
                  const totalItems = (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)

                  return (
                    <Fragment key={order._id}>
                      <tr className={`${tableRowCls} ${isOpen ? 'bg-neutral-50' : ''}`}>
                        <td className="px-5 py-4 font-mono text-xs font-bold text-neutral-700">{orderRef(order._id)}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-neutral-950">{customerName}</p>
                          <p className="mt-0.5 text-xs text-neutral-500">{order.user?.email || 'Guest checkout'}</p>
                        </td>
                        <td className="px-5 py-4 text-neutral-500">{formatDate(order.createdAt)}</td>
                        <td className="px-5 py-4 font-semibold text-neutral-600">{totalItems} items</td>
                        <td className="px-5 py-4 font-bold text-neutral-950">{currency(order.total)}</td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            disabled={updatingId === order._id}
                            onChange={(e) => changeStatus(order._id, e.target.value)}
                            className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize outline-none transition disabled:opacity-50 ${statusSelectCls[order.status] || 'border-neutral-200 bg-neutral-100 text-neutral-700'}`}
                          >
                            {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => setExpanded(isOpen ? null : order._id)} className="ml-auto grid h-9 w-9 place-items-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950" aria-label="Toggle details">
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td colSpan={7} className="border-b border-neutral-100 bg-neutral-50 px-5 py-5">
                            <div className="grid gap-5 lg:grid-cols-2">
                              <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Items summary</h3>
                                <ul className="mt-3 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white p-4">
                                  {(order.items || []).map((item, index) => (
                                    <li key={index} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-400">
                                        <Bag size={14} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-neutral-900">{item.name}</p>
                                        <p className="text-xs text-neutral-500">{currency(item.price)} x {item.quantity}</p>
                                      </div>
                                      <span className="font-bold text-neutral-950">{currency(item.price * item.quantity)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Shipping</h3>
                                <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-4">
                                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Delivery address</span>
                                  <p className="mt-2 text-sm leading-6 text-neutral-700">{order.shippingAddress || 'Not provided by customer'}</p>
                                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Current status</span>
                                    <StatusBadge status={order.status} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
