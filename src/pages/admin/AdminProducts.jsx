import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../context/useStore'
import { deleteProduct, listProducts } from '../../services/products'
import { useResource } from '../../lib/useResource'
import { currency } from '../../lib/format'
import { resolveImg } from '../../lib/api'
import { ErrorState, LoadingState } from '../../components/States'
import {
  Card,
  PageHeader,
  StatusBadge,
  inputCls,
  primaryBtnCls,
  secondaryBtnCls,
  tableHeadCls,
  tableRowCls,
} from '../../components/admin/ui'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Filter, Package, PackagePlus, Pencil, Search, Trash } from '../../components/icons'

export default function AdminProducts() {
  const { notify, categories } = useStore()
  const { data, loading, error, reload, setData } = useResource(() => listProducts())
  const products = useMemo(() => data || [], [data])
  const [q, setQ] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStock, setSelectedStock] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name-asc')
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const filteredAndSorted = useMemo(() => {
    let result = [...products]
    const term = q.trim().toLowerCase()
    if (term) result = result.filter((p) => `${p.name} ${p.brand || ''} ${p.categoryName || ''}`.toLowerCase().includes(term))
    if (selectedCategory !== 'all') result = result.filter((p) => p.category === selectedCategory)
    if (selectedStock === 'out') result = result.filter((p) => Number(p.stock) === 0)
    if (selectedStock === 'low') result = result.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5)
    if (selectedStock === 'in') result = result.filter((p) => Number(p.stock) > 5)
    if (selectedStatus !== 'all') result = result.filter((p) => p.status === selectedStatus)
    result.sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price)
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price)
      if (sortBy === 'stock-asc') return Number(a.stock) - Number(b.stock)
      if (sortBy === 'stock-desc') return Number(b.stock) - Number(a.stock)
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
      return a.name.localeCompare(b.name)
    })
    return result
  }, [products, q, selectedCategory, selectedStock, selectedStatus, sortBy])

  const confirmDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await deleteProduct(target.id)
      setData((prev) => (prev || []).filter((p) => p.id !== target.id))
      notify('Product deleted')
      setTarget(null)
    } catch (err) {
      notify(err.message || 'Could not delete product')
    } finally {
      setDeleting(false)
    }
  }

  const resetFilters = () => {
    setQ('')
    setSelectedCategory('all')
    setSelectedStock('all')
    setSelectedStatus('all')
    setSortBy('name-asc')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Products" subtitle={loading ? 'Loading product catalog...' : `Manage ${products.length} catalog items, stock, pricing, and publish status.`}>
        <Link to="/admin/products/new" className={primaryBtnCls}>
          <PackagePlus size={16} /> Add product
        </Link>
      </PageHeader>

      <Card className="p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_auto]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products by name, brand, or category" className={`${inputCls} pl-10`} />
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={inputCls}>
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)} className={inputCls}>
              <option value="all">All stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className={inputCls}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${inputCls} col-span-2 md:col-span-1`}>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price low-high</option>
              <option value="price-desc">Price high-low</option>
              <option value="stock-asc">Stock low-high</option>
              <option value="stock-desc">Stock high-low</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Loading products list" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead>
                <tr className={tableHeadCls}>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAndSorted.map((p) => (
                  <tr key={p.id} className={tableRowCls}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 text-neutral-400">
                          {resolveImg(p.images?.[0]) ? <img src={resolveImg(p.images[0])} alt="" className="h-full w-full object-cover" /> : <Package size={18} />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-neutral-950">{p.name}</p>
                          <p className="mt-0.5 text-xs font-medium text-neutral-500">{p.brand || 'No brand'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-neutral-600">{p.categoryName || '-'}</td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-neutral-950">{currency(p.price)}</span>
                      {p.oldPrice && <span className="ml-2 text-xs text-neutral-400 line-through">{currency(p.oldPrice)}</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${Number(p.stock) === 0 ? 'bg-rose-50 text-rose-700' : Number(p.stock) <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/admin/products/${p.id}/edit`} className="grid h-9 w-9 place-items-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950" aria-label="Edit product">
                          <Pencil size={15} />
                        </Link>
                        <button onClick={() => setTarget(p)} className="grid h-9 w-9 place-items-center rounded-md text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label="Delete product">
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSorted.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-neutral-100 text-neutral-400">
                <Filter size={20} />
              </div>
              <p className="mt-4 text-sm font-bold text-neutral-950">No products matched</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">Adjust the search or filters to find the products you need.</p>
              <button onClick={resetFilters} className={`${secondaryBtnCls} mt-5`}>Reset filters</button>
            </div>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete product"
        message={`"${target?.name}" will be permanently removed from the catalog. This action cannot be undone.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => (deleting ? null : setTarget(null))}
      />
    </div>
  )
}
