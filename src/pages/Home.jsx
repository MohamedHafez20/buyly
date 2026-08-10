import { Link } from 'react-router-dom'
import { categories, products, featured, dealsOfDay } from '../data/products'
import ProductCard from '../components/ProductCard'
import InstallSection from '../components/InstallSection'
import { ArrowRight } from '../components/icons'

// Unsplash photography assets for category collections
const categoryImages = {
  'short-sleeves': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=500&auto=format&fit=crop',
  'long-sleeves': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=500&auto=format&fit=crop',
  'sweatpants': 'https://images.unsplash.com/photo-1551854838-212c50b4c184?q=80&w=500&auto=format&fit=crop',
  'jackets': 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=500&auto=format&fit=crop',
  'footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop',
  'accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=500&auto=format&fit=crop',
}

export default function Home() {
  const newArrivals = products.filter((p) => p.badge === 'New' || p.badge === 'Hot').slice(0, 4)

  return (
    <div className="bg-white">
      {/* Campaign Hero — Full Screen Editorial */}
      <section className="relative h-[85vh] min-h-[580px] w-full overflow-hidden bg-neutral-900">
        <img
          src="https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1600&auto=format&fit=crop"
          alt="Buyly sportswear performance collection"
          className="absolute inset-0 h-full w-full object-cover object-center select-none"
        />
        {/* Subtle, premium gradient shadow for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 sm:px-8">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-white/80">BUILT FOR ACTIVE LIFESTYLES · 2026</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold uppercase leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-7xl">
            ENGINEERED<br />FOR MOTION.
          </h1>
          <p className="mt-5 max-w-md text-xs sm:text-sm leading-relaxed text-white/80 font-medium">
            High-performance sportswear designed in-house. Breathable fabrics, precise cuts, and active heat zoning built to support your training routine.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 bg-white px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-black transition-colors duration-250 hover:bg-neutral-100"
            >
              Shop Collection
              <ArrowRight size={13} className="transition-transform duration-250 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/shop?sort=discount"
              className="inline-flex items-center gap-2 border border-white/40 px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors duration-250 hover:border-white hover:bg-white/10"
            >
              Explore Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-neutral-100 px-4 sm:grid-cols-4 sm:px-6">
          {[
            ['Free Shipping', 'On orders over $75'],
            ['30-Day Returns', 'Hassle-free exchanges'],
            ['Secure Checkout', '256-bit SSL encryption'],
            ['Premium Support', '24/7 client care portal'],
          ].map(([t, s]) => (
            <div key={t} className="px-3 py-5 text-center">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-900">{t}</p>
              <p className="mt-0.5 text-[10px] font-medium text-neutral-400">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shop by Category Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead kicker="Collections" title="Shop by Category" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const bgImg = categoryImages[c.id]
            return (
              <Link
                key={c.id}
                to={`/shop?category=${c.id}`}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden bg-neutral-100 p-4 border border-neutral-100 transition-all duration-300"
              >
                {/* Background image */}
                {bgImg && (
                  <img 
                    src={bgImg} 
                    alt={c.name}
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
                {/* Contrast overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />
                
                {/* Text overlay */}
                <div className="relative z-10">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-white">{c.name}</p>
                  <p className="text-[8px] text-white/70 uppercase tracking-wider font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">View All →</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Editorial Split Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 items-center border border-neutral-100 bg-neutral-50 p-6 sm:p-10">
          <div className="space-y-5 py-6">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-neutral-400">DESIGN SPECIFICATION</span>
            <h2 className="text-3xl font-extrabold uppercase tracking-tight text-neutral-900 sm:text-4xl">CORE INSULATION FLEECE</h2>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-500 font-medium">
              Engineered with dual-brushed thermal fleece, our long sleeve crewnecks and hoodies lock in body heat while managing skin microclimate humidity. Crafted with water-repellent panel reinforcement for outdoor performance.
            </p>
            <div className="pt-2">
              <Link
                to="/shop?category=long-sleeves"
                className="inline-flex items-center gap-2 bg-black px-7 py-3.5 text-[10px] font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 rounded-none cursor-pointer"
              >
                Shop Pullovers
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
            <img 
              src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop" 
              alt="Thermal insulation workout gear" 
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Dynamic Product Rows */}
      <ProductRow kicker="Best Sellers" title="Top Rated Gear" items={featured} to="/shop?sort=rating" />
      
      {/* Mid-Page Promo Banner */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden bg-black px-8 py-16 text-center sm:px-14 sm:text-left">
          <div className="absolute inset-0 bg-neutral-900 opacity-80" />
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/50">SEASON CLOSURE SALES</span>
              <h3 className="text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">UP TO 40% OFF SELECT ATHLETIC STYLES</h3>
              <p className="max-w-md text-xs sm:text-sm leading-relaxed text-neutral-400 font-medium">
                Perform at your absolute peak. Discover marked-down prices on windbreakers, run trainers, and seamless compression gear.
              </p>
            </div>
            <Link
              to="/shop?sort=discount"
              className="group inline-flex shrink-0 items-center gap-2 bg-white px-7 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-black transition-colors hover:bg-neutral-100 rounded-none cursor-pointer"
            >
              Shop Sale
              <ArrowRight size={13} className="transition-transform duration-250 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <ProductRow kicker="Just In" title="New Arrivals" items={newArrivals} to="/shop" />
      <ProductRow kicker="Seasonal Deals" title="Deals of the Week" items={dealsOfDay} to="/shop?sort=discount" />
      <ProductRow kicker="Our Catalog" title="All Training Gear" items={products} to="/shop" />

      <InstallSection />
    </div>
  )
}

function SectionHead({ kicker, title }) {
  return (
    <div>
      {kicker && <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-neutral-400">{kicker}</p>}
      <h2 className="mt-1 text-2xl font-extrabold uppercase tracking-tight text-neutral-900 sm:text-3xl">{title}</h2>
    </div>
  )
}

function ProductRow({ kicker, title, items, to }) {
  if (!items.length) return null
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-end justify-between border-b border-neutral-100 pb-4">
        <SectionHead kicker={kicker} title={title} />
        <Link
          to={to}
          className="hidden shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:text-black sm:flex"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
