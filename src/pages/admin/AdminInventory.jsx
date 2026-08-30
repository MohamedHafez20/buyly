import { useMemo, useState } from 'react'
import { useStore } from '../../context/useStore'
import { listProducts } from '../../services/products'
import { listInventoryHistory, adjustInventory } from '../../services/inventory'
import { useResource } from '../../lib/useResource'
import { formatDate } from '../../lib/format'
import { resolveImg } from '../../lib/api'
import { LoadingState, ErrorState, Spinner } from '../../components/States'
import { PageHeader, Card, inputCls, primaryBtnCls, tableHeadCls, tableRowCls } from '../../components/admin/ui'
import { Package, Search, History, ArrowRightLeft } from '../../components/icons'

export default function AdminInventory() {
  const { notify } = useStore()
  const [activeTab, setActiveTab] = useState('status') // 'status' | 'history'

  // Fetch products
  const { data: productsData, loading: productsLoading, error: productsError, reload: reloadProducts } = useResource(() => listProducts())
  const products = useMemo(() => productsData || [], [productsData])

  // Fetch inventory history
  const { data: historyData, loading: historyLoading, error: historyError, reload: reloadHistory } = useResource(() => listInventoryHistory(), [activeTab])
  const history = useMemo(() => historyData || [], [historyData])

  // Filtering products
  const [productSearch, setProductSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // 'all' | 'out' | 'low' | 'ok'

  const filteredProducts = useMemo(() => {
    let list = [...products]
    const term = productSearch.toLowerCase().trim()
    if (term) list = list.filter((p) => `${p.name} ${p.brand || ''}`.toLowerCase().includes(term))
    
    if (stockFilter === 'out') list = list.filter((p) => p.stock === 0)
    else if (stockFilter === 'low') list = list.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold ?? 5))
    else if (stockFilter === 'ok') list = list.filter((p) => p.stock > (p.lowStockThreshold ?? 5))

    return list
  }, [products, productSearch, stockFilter])

  // Filtering history
  const [historySearch, setHistorySearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredHistory = useMemo(() => {
    let list = [...history]
    const term = historySearch.toLowerCase().trim()
    if (term) {
      list = list.filter((h) => 
        (h.product?.name || '').toLowerCase().includes(term) ||
        (h.user?.name || '').toLowerCase().includes(term) ||
        (h.reason || '').toLowerCase().includes(term)
      )
    }
    if (typeFilter !== 'all') list = list.filter((h) => h.type === typeFilter)
    return list
  }, [history, historySearch, typeFilter])

  // Adjustment Modal State
  const [adjustmentTarget, setAdjustmentTarget] = useState(null)
  const [adjustmentQty, setAdjustmentQty] = useState('')
  const [adjustmentType, setAdjustmentType] = useState('restock')
  const [adjustmentReason, setAdjustmentReason] = useState('')
  const [adjusting, setAdjusting] = useState(false)

  const handleAdjust = async (e) => {
    e.preventDefault()
    if (!adjustmentTarget) return
    const qty = Number(adjustmentQty)
    if (Number.isNaN(qty) || qty === 0) {
      notify('Please enter a valid non-zero quantity')
      return
    }

    setAdjusting(true)
    try {
      await adjustInventory({
        productId: adjustmentTarget.id,
        quantity: qty,
        type: adjustmentType,
        reason: adjustmentReason.trim()
      })
      notify('Inventory adjusted successfully')
      setAdjustmentTarget(null)
      setAdjustmentQty('')
      setAdjustmentReason('')
      reloadProducts()
      reloadHistory()
    } catch (err) {
      notify(err.message || 'Could not adjust inventory')
    } finally {
      setAdjusting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory Control" 
        subtitle="Manage product stock levels, low-stock thresholds, and review inventory audit logs."
      />

      {/* Tabs Selector */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition -mb-[2px] ${
            activeTab === 'status'
              ? 'border-neutral-950 text-neutral-950 dark:border-white dark:text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Package size={14} /> Stock Status
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition -mb-[2px] ${
            activeTab === 'history'
              ? 'border-neutral-950 text-neutral-950 dark:border-white dark:text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <History size={14} /> Adjustment Logs
          </span>
        </button>
      </div>

      {activeTab === 'status' && (
        <>
          {/* Filters */}
          <Card className="p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  value={productSearch} 
                  onChange={(e) => setProductSearch(e.target.value)} 
                  placeholder="Search products by name or brand..." 
                  className={`${inputCls} pl-10`} 
                />
              </div>
              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className={inputCls}>
                <option value="all">All stock levels</option>
                <option value="out">Out of stock</option>
                <option value="low">Low stock</option>
                <option value="ok">In stock (OK)</option>
              </select>
            </div>
          </Card>

          {productsLoading ? (
            <LoadingState label="Loading stock status" />
          ) : productsError ? (
            <ErrorState message={productsError} onRetry={reloadProducts} />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className={tableHeadCls}>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Low-Stock Limit</th>
                      <th className="px-5 py-3">Stock Count</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.map((p) => {
                      const limit = p.lowStockThreshold ?? 5
                      const isOut = p.stock === 0
                      const isLow = p.stock > 0 && p.stock <= limit
                      
                      return (
                        <tr key={p.id} className={tableRowCls}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-400">
                                {resolveImg(p.images?.[0]) ? (
                                  <img src={resolveImg(p.images[0])} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <Package size={16} />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-neutral-950">{p.name}</p>
                                <p className="text-[10px] font-semibold text-neutral-400">{p.brand || 'No brand'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-neutral-600">
                            {limit} units
                          </td>
                          <td className="px-5 py-4 font-bold text-neutral-950">
                            {p.stock}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              isOut 
                                ? 'bg-rose-50 text-rose-700' 
                                : isLow 
                                  ? 'bg-amber-50 text-amber-700' 
                                  : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Good'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => {
                                setAdjustmentTarget(p)
                                setAdjustmentType('restock')
                                setAdjustmentQty('')
                                setAdjustmentReason('')
                              }}
                              className="theme-transition inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600 border border-neutral-200 hover:bg-neutral-50 rounded-xl cursor-pointer"
                            >
                              <ArrowRightLeft size={12} /> Adjust Stock
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">No stock matches found</p>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <>
          {/* Filters */}
          <Card className="p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_225px]">
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  value={historySearch} 
                  onChange={(e) => setHistorySearch(e.target.value)} 
                  placeholder="Search logs by product, adjuster, or reason..." 
                  className={`${inputCls} pl-10`} 
                />
              </div>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={inputCls}>
                <option value="all">All adjustment types</option>
                <option value="purchase">Purchase (checkout)</option>
                <option value="order_cancellation">Order cancellation</option>
                <option value="restock">Manual Restock</option>
                <option value="manual_adjustment">Manual Adjustment</option>
                <option value="returned_item">Returned Item</option>
              </select>
            </div>
          </Card>

          {historyLoading ? (
            <LoadingState label="Loading audit logs" />
          ) : historyError ? (
            <ErrorState message={historyError} onRetry={reloadHistory} />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className={tableHeadCls}>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Delta</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Adjusted By</th>
                      <th className="px-5 py-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredHistory.map((h) => {
                      const positive = h.quantity > 0
                      return (
                        <tr key={h.id || h._id} className={tableRowCls}>
                          <td className="px-5 py-4 text-neutral-500 font-medium">
                            {formatDate(h.createdAt)}
                          </td>
                          <td className="px-5 py-4 font-bold text-neutral-900">
                            {h.product?.name || 'Deleted Product'}
                          </td>
                          <td className={`px-5 py-4 font-bold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {positive ? `+${h.quantity}` : h.quantity}
                          </td>
                          <td className="px-5 py-4 capitalize font-semibold text-neutral-600">
                            {h.type?.replace('_', ' ')}
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-neutral-900">{h.user?.name || 'System'}</p>
                            {h.user?.email && <p className="text-[10px] text-neutral-400">{h.user.email}</p>}
                          </td>
                          <td className="px-5 py-4 text-neutral-500 font-medium max-w-xs truncate">
                            {h.reason || '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filteredHistory.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">No stock adjustment history logs yet</p>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* Manual Adjustment Modal */}
      {adjustmentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs" onClick={() => setAdjustmentTarget(null)} />
          <div className="relative w-full max-w-md border border-neutral-200 bg-white p-6 shadow-xl space-y-5 rounded-none">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-neutral-900">Adjust stock level</h2>
              <p className="mt-1 text-xs text-neutral-400 font-medium">Product: {adjustmentTarget.name} (Current: {adjustmentTarget.stock})</p>
            </div>

            <form onSubmit={handleAdjust} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Stock change delta</span>
                <input 
                  type="number"
                  placeholder="e.g. 10 to add, -5 to subtract"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  className={inputCls}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Adjustment Type</span>
                <select value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value)} className={inputCls}>
                  <option value="restock">Manual Restock</option>
                  <option value="manual_adjustment">Manual Inventory Correction</option>
                  <option value="returned_item">Returned Item</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Reason / Description</span>
                <textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Provide a reason for auditing purposes..."
                  rows={3}
                  className={inputCls}
                  required
                />
              </label>

              <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                <button type="submit" disabled={adjusting} className={primaryBtnCls}>
                  {adjusting ? <><Spinner size={13} className="border-white/40 border-t-white" /> Saving…</> : 'Save Adjustment'}
                </button>
                <button type="button" onClick={() => setAdjustmentTarget(null)} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
