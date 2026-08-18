import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  CalendarDays,
  CreditCard,
  DollarSign,
  Package,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Tags,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { getStats, listUsers } from '../../services/admin'
import { listAllOrders } from '../../services/orders'
import { listProducts } from '../../services/products'
import { listCategories } from '../../services/categories'
import { useResource } from '../../lib/useResource'
import { currency, formatDate, orderRef } from '../../lib/format'
import { resolveImg } from '../../lib/api'
import {
  Card,
  PageHeader,
  SectionTitle,
  StatusBadge,
  inputCls,
  secondaryBtnCls,
  tableHeadCls,
  tableRowCls,
} from '../../components/admin/ui'
import { ErrorState, Spinner } from '../../components/States'

const PERIODS = [
  { value: 'today', label: 'Today', days: 1 },
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '3m', label: 'Last 3 months', days: 90 },
  { value: '6m', label: 'Last 6 months', days: 180 },
  { value: '12m', label: 'Last 12 months', days: 365 },
]

const ORDER_STATUSES = ['all', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']
const REVENUE_STATUSES = new Set(['paid', 'processing', 'shipped', 'delivered', 'completed'])
const COMPLETE_STATUSES = new Set(['delivered', 'completed'])
const LOW_STOCK_LIMIT = 5

const emptyData = { stats: null, orders: [], products: [], categories: [], users: [], errors: [] }

function getRange(period) {
  const days = PERIODS.find((item) => item.value === period)?.days || 7
  const end = new Date()
  const start = new Date(end)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - days + 1)

  const previousEnd = new Date(start)
  previousEnd.setMilliseconds(-1)
  const previousStart = new Date(previousEnd)
  previousStart.setHours(0, 0, 0, 0)
  previousStart.setDate(previousStart.getDate() - days + 1)

  return { start, end, previousStart, previousEnd, days }
}

function toTime(value) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0
}

function inRange(value, start, end) {
  const time = toTime(value)
  return time >= start.getTime() && time <= end.getTime()
}

function idOf(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id || value.id || ''
}

function getOrderUser(order) {
  return idOf(order.user) || order.user?.email || order.customerEmail || order.email || 'guest'
}

function getOrderItems(order) {
  return Array.isArray(order.items) ? order.items : []
}

function itemProductId(item) {
  return idOf(item.product) || item.productId || item.id || item._id || ''
}

function itemName(item, product) {
  return item.name || item.product?.name || product?.name || 'Product'
}

function itemImage(item, product) {
  return item.image || item.product?.image || item.product?.images?.[0] || product?.images?.[0] || product?.image
}

function itemCategoryId(item, product) {
  return idOf(item.category) || idOf(item.product?.category) || product?.category || ''
}

function itemPrice(item, product) {
  const price = Number(item.price ?? item.product?.price ?? product?.price ?? 0)
  return Number.isFinite(price) ? price : 0
}

function itemQuantity(item) {
  const quantity = Number(item.quantity ?? item.qty ?? 1)
  return Number.isFinite(quantity) ? quantity : 1
}

function orderRevenue(order) {
  if (order.status === 'cancelled') return 0
  const total = Number(order.total ?? order.totalPrice ?? order.amount)
  if (Number.isFinite(total)) return total
  return getOrderItems(order).reduce((sum, item) => sum + itemPrice(item) * itemQuantity(item), 0)
}

function percentChange(current, previous) {
  if (!previous || previous <= 0) return null
  return ((current - previous) / previous) * 100
}

function compactNumber(value) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0)
}

async function loadDashboardData(filters) {
  const calls = await Promise.allSettled([
    getStats(filters),
    listAllOrders(),
    listProducts(),
    listCategories(),
    listUsers(),
  ])
  const [stats, orders, products, categories, users] = calls

  return {
    stats: stats.status === 'fulfilled' ? stats.value : null,
    orders: orders.status === 'fulfilled' ? orders.value : [],
    products: products.status === 'fulfilled' ? products.value : [],
    categories: categories.status === 'fulfilled' ? categories.value : [],
    users: users.status === 'fulfilled' ? users.value : [],
    errors: calls
      .map((result, index) => ({ result, label: ['stats', 'orders', 'products', 'categories', 'users'][index] }))
      .filter(({ result }) => result.status === 'rejected')
      .map(({ result, label }) => `${label}: ${result.reason?.message || 'Unable to load'}`),
  }
}

function buildDateBuckets(start, end, orders) {
  const buckets = []
  const cursor = new Date(start)
  cursor.setHours(0, 0, 0, 0)

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10)
    buckets.push({ key, label: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: 0, orders: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }

  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))
  orders.forEach((order) => {
    const date = new Date(order.createdAt)
    if (Number.isNaN(date.getTime())) return
    const key = date.toISOString().slice(0, 10)
    const bucket = byKey.get(key)
    if (!bucket) return
    bucket.orders += 1
    bucket.revenue += orderRevenue(order)
  })

  return buckets
}

function analyzeData(data, filters) {
  const source = data || emptyData
  const range = getRange(filters.period)
  const productMap = new Map(source.products.map((product) => [product.id || product._id, product]))
  const categoryMap = new Map(source.categories.map((category) => [category.id || category._id, category]))

  const dateOrders = source.orders.filter((order) => inRange(order.createdAt, range.start, range.end))
  const previousOrders = source.orders.filter((order) => inRange(order.createdAt, range.previousStart, range.previousEnd))

  const filteredOrders = dateOrders.filter((order) => {
    if (filters.status !== 'all' && order.status !== filters.status) return false
    if (filters.product === 'all' && filters.category === 'all') return true
    return getOrderItems(order).some((item) => {
      const product = productMap.get(itemProductId(item))
      if (filters.product !== 'all' && itemProductId(item) !== filters.product) return false
      if (filters.category !== 'all' && itemCategoryId(item, product) !== filters.category) return false
      return true
    })
  })

  const previousFilteredOrders = previousOrders.filter((order) => filters.status === 'all' || order.status === filters.status)
  const revenue = filteredOrders.reduce((sum, order) => sum + orderRevenue(order), 0)
  const previousRevenue = previousFilteredOrders.reduce((sum, order) => sum + orderRevenue(order), 0)
  const cancelledOrders = filteredOrders.filter((order) => order.status === 'cancelled').length
  const pendingOrders = filteredOrders.filter((order) => order.status === 'pending').length
  const completedOrders = filteredOrders.filter((order) => COMPLETE_STATUSES.has(order.status)).length
  const paidPipeline = filteredOrders.filter((order) => REVENUE_STATUSES.has(order.status)).length
  const lowStockProducts = source.products.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= LOW_STOCK_LIMIT)
  const outOfStockProducts = source.products.filter((product) => Number(product.stock) === 0)
  const inStockProducts = source.products.filter((product) => Number(product.stock) > LOW_STOCK_LIMIT)
  const activeProducts = source.products.filter((product) => (product.status || 'active') === 'active')
  const newCustomers = source.users.filter((user) => inRange(user.createdAt, range.start, range.end))
  const returningCustomerIds = new Set()
  const orderCountsByUser = new Map()

  source.orders.forEach((order) => {
    const userId = getOrderUser(order)
    orderCountsByUser.set(userId, (orderCountsByUser.get(userId) || 0) + 1)
  })
  orderCountsByUser.forEach((count, userId) => {
    if (count > 1) returningCustomerIds.add(userId)
  })

  const topProductMap = new Map()
  const topCategoryMap = new Map(source.categories.map((category) => [
    category.id || category._id,
    { id: category.id || category._id, name: category.name, products: category.productCount || 0, units: 0, revenue: 0 },
  ]))

  filteredOrders.forEach((order) => {
    getOrderItems(order).forEach((item) => {
      const product = productMap.get(itemProductId(item))
      const productId = itemProductId(item) || itemName(item, product)
      const quantity = itemQuantity(item)
      const revenueFromItem = itemPrice(item, product) * quantity
      const existingProduct = topProductMap.get(productId) || {
        id: productId,
        name: itemName(item, product),
        image: itemImage(item, product),
        stock: product?.stock ?? item.stock ?? 0,
        units: 0,
        revenue: 0,
      }
      existingProduct.units += quantity
      existingProduct.revenue += revenueFromItem
      topProductMap.set(productId, existingProduct)

      const categoryId = itemCategoryId(item, product)
      const existingCategory = topCategoryMap.get(categoryId) || {
        id: categoryId || itemName(item, product),
        name: categoryMap.get(categoryId)?.name || product?.categoryName || item.categoryName || 'Uncategorized',
        products: source.products.filter((candidate) => candidate.category === categoryId).length,
        units: 0,
        revenue: 0,
      }
      existingCategory.units += quantity
      existingCategory.revenue += revenueFromItem
      topCategoryMap.set(existingCategory.id, existingCategory)
    })
  })

  const chartData = buildDateBuckets(range.start, range.end, filteredOrders)
  const activity = [
    ...filteredOrders.slice(0, 6).map((order) => ({
      key: `order-${order._id || order.id}`,
      icon: Receipt,
      title: `Order ${orderRef(order._id || order.id)} received`,
      description: `${order.user?.name || 'Guest customer'} placed an order for ${currency(orderRevenue(order))}`,
      time: order.createdAt,
      status: order.status,
    })),
    ...newCustomers.slice(0, 4).map((user) => ({
      key: `user-${user._id || user.id}`,
      icon: Users,
      title: `${user.name || 'Customer'} joined`,
      description: user.email || 'New customer account',
      time: user.createdAt,
      status: 'active',
    })),
    ...lowStockProducts.slice(0, 4).map((product) => ({
      key: `stock-${product.id || product._id}`,
      icon: AlertCircle,
      title: `${product.name} is low in stock`,
      description: `${product.stock} units remaining`,
      time: null,
      status: 'pending',
    })),
  ].sort((a, b) => toTime(b.time) - toTime(a.time)).slice(0, 8)

  return {
    range,
    filteredOrders,
    chartData,
    totals: {
      revenue,
      orders: filteredOrders.length,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      paidPipeline,
      products: source.products.length,
      activeProducts: activeProducts.length,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      inStockProducts: inStockProducts.length,
      customers: source.users.length,
      newCustomers: newCustomers.length,
      returningCustomers: returningCustomerIds.size,
    },
    changes: {
      revenue: percentChange(revenue, previousRevenue),
      orders: percentChange(filteredOrders.length, previousFilteredOrders.length),
    },
    products: source.products,
    categories: source.categories,
    lowStock: [...lowStockProducts, ...outOfStockProducts].sort((a, b) => Number(a.stock) - Number(b.stock)),
    topProducts: [...topProductMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    topCategories: [...topCategoryMap.values()].filter((item) => item.units > 0 || item.products > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    recentOrders: filteredOrders.slice(0, 6),
    activity,
    errors: source.errors,
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 animate-pulse rounded-lg bg-white" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-lg bg-white" />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-lg bg-white" />
        <div className="h-96 animate-pulse rounded-lg bg-white" />
      </div>
    </div>
  )
}

function ChangePill({ value }) {
  if (value === null) {
    return <span className="text-xs font-semibold text-neutral-400">No previous period</span>
  }
  const positive = value >= 0
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
      <Icon size={13} />
      {positive ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

function KpiCard({ icon: Icon, label, value, change, context, tone }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</p>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight text-neutral-950">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-md ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
        {change !== undefined ? <ChangePill value={change} /> : <span className="text-xs font-bold text-neutral-500">{context}</span>}
        {change !== undefined && <span className="text-xs font-medium text-neutral-400">{context}</span>}
      </div>
    </Card>
  )
}

function AreaChart({ data, metric }) {
  if (!data.some((point) => point[metric] > 0)) return <EmptyPanel label={`No ${metric} data for this period`} />

  const width = 760
  const height = 270
  const pad = { top: 18, right: 18, bottom: 36, left: 56 }
  const chartWidth = width - pad.left - pad.right
  const chartHeight = height - pad.top - pad.bottom
  const maxValue = Math.max(...data.map((point) => point[metric]), 1)
  const step = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth
  const points = data.map((point, index) => ({
    ...point,
    x: data.length > 1 ? pad.left + index * step : pad.left + chartWidth / 2,
    y: pad.top + chartHeight - (point[metric] / maxValue) * chartHeight,
  }))
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const area = `${line} L ${points[points.length - 1].x} ${pad.top + chartHeight} L ${points[0].x} ${pad.top + chartHeight} Z`
  const tickEvery = Math.max(1, Math.ceil(points.length / 7))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
      <defs>
        <linearGradient id={`area-${metric}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = pad.top + chartHeight - ratio * chartHeight
        return (
          <g key={ratio}>
            <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#e5e5e5" strokeDasharray="4 6" />
            <text x={6} y={y + 4} className="fill-neutral-400 text-[10px] font-bold">
              {metric === 'revenue' ? compactNumber(maxValue * ratio) : Math.round(maxValue * ratio)}
            </text>
          </g>
        )
      })}
      <path d={area} fill={`url(#area-${metric})`} />
      <path d={line} fill="none" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      {points.map((point, index) => (
        <g key={point.key}>
          <circle cx={point.x} cy={point.y} r="3.5" fill="#2563eb" />
          {index % tickEvery === 0 && (
            <text x={point.x} y={height - 10} textAnchor="middle" className="fill-neutral-400 text-[10px] font-bold">
              {point.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

function BarChart({ data }) {
  if (!data.some((point) => point.orders > 0)) return <EmptyPanel label="No order volume for this period" />
  const max = Math.max(...data.map((point) => point.orders), 1)
  const tickEvery = Math.max(1, Math.ceil(data.length / 8))

  return (
    <div className="flex h-72 items-end gap-1.5 overflow-hidden pt-4">
      {data.map((point, index) => (
        <div key={point.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-56 w-full items-end rounded-t bg-neutral-100">
            <div
              className="w-full rounded-t bg-neutral-950 transition"
              style={{ height: `${Math.max(6, (point.orders / max) * 100)}%` }}
              title={`${point.orders} orders`}
            />
          </div>
          <span className="h-4 truncate text-[10px] font-bold text-neutral-400">
            {index % tickEvery === 0 ? point.label : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

function EmptyPanel({ label }) {
  return (
    <div className="grid h-72 place-items-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{label}</p>
    </div>
  )
}

function InventoryChart({ totals }) {
  const total = Math.max(totals.products, 1)
  const segments = [
    { label: 'In stock', value: totals.inStockProducts, color: 'bg-emerald-500' },
    { label: 'Low stock', value: totals.lowStockProducts, color: 'bg-amber-500' },
    { label: 'Out of stock', value: totals.outOfStockProducts, color: 'bg-rose-500' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-neutral-100">
        {segments.map((segment) => (
          <span key={segment.label} className={segment.color} style={{ width: `${(segment.value / total) * 100}%` }} />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {segments.map((segment) => (
          <div key={segment.label} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${segment.color}`} />
              <span className="text-xs font-bold text-neutral-500">{segment.label}</span>
            </div>
            <p className="mt-2 text-xl font-bold text-neutral-950">{segment.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [filters, setFiltersState] = useState({ period: '7d', status: 'all', category: 'all', product: 'all' })
  const setFilters = (patch) => setFiltersState((current) => ({ ...current, ...patch }))
  const { data, loading, error, reload } = useResource(() => loadDashboardData(filters), [
    filters.period,
    filters.status,
    filters.category,
    filters.product,
  ])
  const model = useMemo(() => analyzeData(data, filters), [data, filters])
  const periodLabel = PERIODS.find((period) => period.value === filters.period)?.label || 'Selected period'

  if (loading && !data) return <DashboardSkeleton />
  if (error && !data) return <ErrorState message={error} onRetry={reload} />

  const kpis = [
    {
      icon: DollarSign,
      label: 'Revenue',
      value: currency(model.totals.revenue),
      change: model.changes.revenue,
      context: 'vs previous period',
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      icon: Receipt,
      label: 'Orders',
      value: model.totals.orders,
      change: model.changes.orders,
      context: `${model.totals.completedOrders} completed`,
      tone: 'bg-sky-50 text-sky-700',
    },
    {
      icon: Package,
      label: 'Products',
      value: model.totals.products,
      context: `${model.totals.activeProducts} active, ${model.totals.outOfStockProducts} out`,
      tone: 'bg-violet-50 text-violet-700',
    },
    {
      icon: Users,
      label: 'Customers',
      value: model.totals.customers,
      context: `${model.totals.newCustomers} new, ${model.totals.returningCustomers} returning`,
      tone: 'bg-amber-50 text-amber-700',
    },
  ]

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dashboard"
        subtitle={`Business performance, order activity, and inventory health for ${periodLabel.toLowerCase()}.`}
      >
        <Link to="/admin/products/new" className={secondaryBtnCls}>
          <Package size={16} /> Add product
        </Link>
      </PageHeader>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label>
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Date range</span>
            <select value={filters.period} onChange={(e) => setFilters({ period: e.target.value })} className={inputCls}>
              {PERIODS.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Order status</span>
            <select value={filters.status} onChange={(e) => setFilters({ status: e.target.value })} className={inputCls}>
              {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status === 'all' ? 'All statuses' : status}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Category</span>
            <select value={filters.category} onChange={(e) => setFilters({ category: e.target.value })} className={inputCls}>
              <option value="all">All categories</option>
              {model.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Product</span>
            <select value={filters.product} onChange={(e) => setFilters({ product: e.target.value })} className={inputCls}>
              <option value="all">All products</option>
              {model.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </label>
        </div>
      </Card>

      {model.errors.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>Some analytics sources could not load: {model.errors.join('; ')}</span>
          <button onClick={reload} className="inline-flex items-center gap-1.5 font-bold">
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Revenue trend" subtitle="Recognized revenue from non-cancelled orders." />
          <AreaChart data={model.chartData} metric="revenue" />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Order volume" subtitle="Orders created over the selected period." />
          <BarChart data={model.chartData} />
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-neutral-200 px-5 py-4">
            <SectionTitle title="Top products" subtitle="Best-performing items based on order line revenue." />
          </div>
          {model.topProducts.length === 0 ? (
            <div className="p-5"><EmptyPanel label="No product sales for this period" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead>
                  <tr className={tableHeadCls}>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Units sold</th>
                    <th className="px-5 py-3">Revenue</th>
                    <th className="px-5 py-3">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {model.topProducts.map((product) => (
                    <tr key={product.id} className={tableRowCls}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 text-neutral-400">
                            {resolveImg(product.image) ? <img src={resolveImg(product.image)} alt="" className="h-full w-full object-cover" /> : <ShoppingBag size={16} />}
                          </div>
                          <span className="font-bold text-neutral-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-neutral-600">{product.units}</td>
                      <td className="px-5 py-4 font-bold text-neutral-950">{currency(product.revenue)}</td>
                      <td className="px-5 py-4 text-neutral-600">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle title="Top categories" subtitle="Category contribution from sold order items." />
          {model.topCategories.length === 0 ? (
            <EmptyPanel label="No category sales for this period" />
          ) : (
            <div className="space-y-4">
              {model.topCategories.map((category) => {
                const maxRevenue = Math.max(...model.topCategories.map((item) => item.revenue), 1)
                return (
                  <div key={category.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Tags size={16} className="text-neutral-400" />
                        <span className="font-bold text-neutral-900">{category.name}</span>
                      </div>
                      <span className="text-sm font-bold text-neutral-950">{currency(category.revenue)}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-neutral-950" style={{ width: `${(category.revenue / maxRevenue) * 100}%` }} />
                    </div>
                    <p className="mt-2 text-xs font-medium text-neutral-500">{category.units} units sold · {category.products} products</p>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <SectionTitle title="Inventory overview" subtitle="Current catalog availability." />
          <InventoryChart totals={model.totals} />
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="Low stock"
            subtitle="Products that need replenishment."
            action={<Link to="/admin/products" className="text-sm font-bold text-neutral-500 hover:text-neutral-950">Manage inventory</Link>}
          />
          {model.lowStock.length === 0 ? (
            <EmptyPanel label="No low-stock products" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {model.lowStock.slice(0, 6).map((product) => (
                <div key={product.id || product._id} className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md border border-neutral-200 bg-white text-neutral-400">
                    {resolveImg(product.images?.[0] || product.image) ? (
                      <img src={resolveImg(product.images?.[0] || product.image)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package size={16} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-neutral-900">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.brand || product.categoryName || 'Catalog item'}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${Number(product.stock) === 0 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                    {Number(product.stock) === 0 ? 'Out' : `${product.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-neutral-950">Recent orders</h2>
              <p className="mt-1 text-sm text-neutral-500">Latest orders matching the selected filters.</p>
            </div>
            <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-500 hover:text-neutral-950">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {model.recentOrders.length === 0 ? (
            <div className="p-5"><EmptyPanel label="No orders match the selected filters" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[660px] text-left">
                <thead>
                  <tr className={tableHeadCls}>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {model.recentOrders.map((order) => (
                    <tr key={order._id || order.id} className={tableRowCls}>
                      <td className="px-5 py-4 font-mono text-xs font-bold text-neutral-700">{orderRef(order._id || order.id)}</td>
                      <td className="px-5 py-4 font-bold text-neutral-900">{order.user?.name || 'Guest customer'}</td>
                      <td className="px-5 py-4 text-neutral-500">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-4"><StatusBadge status={order.status || 'pending'} /></td>
                      <td className="px-5 py-4 text-right font-bold text-neutral-950">{currency(orderRevenue(order))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle title="Recent activity" subtitle="Real store events from orders, customers, and inventory." />
          {model.activity.length === 0 ? (
            <EmptyPanel label="No recent activity" />
          ) : (
            <div className="space-y-4">
              {model.activity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.key} className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-neutral-100 text-neutral-600">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-bold text-neutral-900">{activity.title}</p>
                        <StatusBadge status={activity.status} />
                      </div>
                      <p className="mt-1 text-sm text-neutral-500">{activity.description}</p>
                      <p className="mt-1 text-xs font-medium text-neutral-400">{activity.time ? formatDate(activity.time) : 'Current inventory'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </section>

      {loading && data && (
        <div className="fixed bottom-5 right-5 flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 shadow-lg">
          <Spinner size={15} /> Updating analytics
        </div>
      )}
    </div>
  )
}
