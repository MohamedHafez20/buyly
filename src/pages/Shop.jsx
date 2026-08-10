import { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { products, categories } from '../data/products'
import { discountPct } from '../lib/format'
import ProductCard from '../components/ProductCard'
import StarRating from '../components/StarRating'
import { Close } from '../components/icons'
import { categoryIcons } from '../lib/categoryIcons'

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Biggest Discount' },
]

const priceBands = [
  { id: 'all', label: 'All Prices', test: () => true },
  { id: 'u25', label: 'Under $25', test: (p) => p.price < 25 },
  { id: '25-75', label: '$25 - $75', test: (p) => p.price >= 25 && p.price <= 75 },
  { id: '75-150', label: '$75 - $150', test: (p) => p.price > 75 && p.price <= 150 },
  { id: 'o150', label: 'Over $150', test: (p) => p.price > 150 },
]

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const category = params.get('category') || 'all'
  const sort = params.get('sort') || 'featured'
  const q = (params.get('q') || '').toLowerCase()
  const band = params.get('price') || 'all'
  const minRating = Number(params.get('rating') || 0)

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all' || value === 'featured' || value === '0') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (band !== 'all' && !priceBands.find((b) => b.id === band)?.test(p)) return false
      if (minRating && p.rating < minRating) return false
      if (q && !(`${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(q))) return false
      return true
    })
    const by = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      discount: (a, b) => discountPct(b.price, b.oldPrice) - discountPct(a.price, a.oldPrice),
      featured: (a, b) => (b.badge === 'Best Seller') - (a.badge === 'Best Seller'),
    }
    return [...list].sort(by[sort] || by.featured)
  }, [category, band, minRating, q, sort])

  const activeCat = categories.find((c) => c.id === category)
  const hasFilters = category !== 'all' || band !== 'all' || minRating > 0 || q

  const Filters = (
    <div className="space-y-7">
      <FilterGroup title="Categories">
        <FilterRadio name="category" label="All Gear" checked={category === 'all'} onChange={() => update('category', 'all')} />
        {categories.map((c) => {
          const Ic = categoryIcons[c.id]
          return (
            <FilterRadio
              key={c.id}
              name="category"
              label={<span className="inline-flex items-center gap-2">{Ic && <Ic size={13} className="text-neutral-400 animate-pulse-slow" />}{c.name}</span>}
              checked={category === c.id}
              onChange={() => update('category', c.id)}
            />
          )
        })}
      </FilterGroup>

      <FilterGroup title="Price Range">
        {priceBands.map((b) => (
          <FilterRadio key={b.id} name="price" label={b.label} checked={band === b.id} onChange={() => update('price', b.id)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Rating">
        {[0, 4, 4.5].map((r) => (
          <button
            key={r}
            onClick={() => update('rating', String(r))}
            className={`flex w-full items-center gap-2 px-2.5 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors rounded-none cursor-pointer ${
              minRating === r
                ? 'bg-black text-white font-extrabold'
                : 'text-neutral-500 hover:bg-neutral-50 hover:text-black font-semibold'
            }`}
          >
            {r === 0 ? 'All Ratings' : (<><StarRating value={r} size={11} /> <span className="ml-1 mt-0.5">& Up</span></>)}
          </button>
        ))}
      </FilterGroup>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 bg-white">
      {/* breadcrumbs */}
      <nav className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 select-none">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <span className="mx-2 text-neutral-300">/</span>
        <span className="text-neutral-600">{activeCat ? activeCat.name : 'Catalog'}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            {activeCat ? activeCat.name : q ? `Results for "${params.get('q')}"` : 'Shop All'}
          </h1>
          <p className="mt-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{filtered.length} product{filtered.length !== 1 && 's'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="border border-neutral-300 px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-widest lg:hidden hover:bg-neutral-50 transition-colors rounded-none cursor-pointer"
          >
            Filters
          </button>
          <label className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 select-none">
            <span className="hidden sm:inline">Sort By</span>
            <select
              value={sort}
              onChange={(e) => update('sort', e.target.value)}
              className="border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-800 outline-none focus:border-black rounded-none cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8 flex gap-8">
        {/* sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          {hasFilters && (
            <button 
              onClick={() => setParams({}, { replace: true })} 
              className="mb-5 text-[10px] font-extrabold uppercase tracking-widest text-rose-700 hover:text-rose-800 transition-colors underline underline-offset-4 cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
          {Filters}
        </aside>

        {/* grid */}
        <div className="flex-1">
          {filtered.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="grid place-items-center border border-dashed border-neutral-200 py-24 text-center">
              <p className="text-sm font-extrabold uppercase tracking-widest text-neutral-900">No products found</p>
              <p className="mt-1.5 text-xs font-medium text-neutral-400">Try adjusting your filters or searching for something else.</p>
              <button 
                onClick={() => setParams({}, { replace: true })} 
                className="mt-6 bg-black px-7 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white hover:bg-neutral-850 transition-colors rounded-none cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto bg-white p-6 shadow-2xl flex flex-col">
            <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900">Filters</h3>
              <button 
                onClick={() => setFiltersOpen(false)} 
                className="text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
              >
                <Close size={20} />
              </button>
            </div>
            {Filters}
            {hasFilters && (
              <button 
                onClick={() => { setParams({}, { replace: true }); setFiltersOpen(false) }} 
                className="mt-4 w-full border border-neutral-200 py-3 text-[10px] font-bold uppercase tracking-widest text-rose-700 hover:bg-rose-50/50 transition-colors rounded-none cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setFiltersOpen(false)}
              className="mt-6 w-full bg-black py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 transition-colors rounded-none cursor-pointer"
            >
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterGroup({ title, children }) {
  return (
    <div className="border-b border-neutral-150 pb-6">
      <h3 className="mb-3.5 text-[10px] font-extrabold uppercase tracking-widest text-neutral-900">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function FilterRadio({ label, checked, onChange, name }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className={`grid h-3.5 w-3.5 place-items-center rounded-full border-2 ${checked ? 'border-black' : 'border-neutral-200'}`}>
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
      </span>
      <span className={checked ? 'font-extrabold text-black' : 'text-neutral-400'}>{label}</span>
    </label>
  )
}
