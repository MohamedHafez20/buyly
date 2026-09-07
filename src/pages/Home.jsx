import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/useStore'
import { listProducts } from '../services/products'
import { useResource } from '../lib/useResource'
import { resolveImg } from '../lib/api'
import ProductCard from '../components/ProductCard'
import GenderTabs from '../components/GenderTabs'
import InstallSection from '../components/InstallSection'
import { ProductGridSkeleton, ErrorState } from '../components/States'
import { ArrowLeft, ArrowRight } from '../components/icons'

// Fallback high-impact athletic photography for category cards (Reference Image 3)
const CATEGORY_ASSETS = {
  'short-sleeves': {
    name: 'TOPS',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop',
  },
  'long-sleeves': {
    name: 'COMPRESSION',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
  },
  jackets: {
    name: 'TANKS & LAYERS',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
  },
  sweatpants: {
    name: 'BOTTOMS',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format&fit=crop',
  },
}

const CATEGORY_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop',
]

const FALLBACK_CATEGORIES = [
  { id: 'short-sleeves', name: 'Short Sleeves' },
  { id: 'long-sleeves', name: 'Long Sleeves' },
  { id: 'jackets', name: 'Jackets' },
  { id: 'sweatpants', name: 'Sweatpants' },
]

export default function Home() {
  const { categories } = useStore()
  const { data, loading, error, reload } = useResource(() => listProducts({ status: 'active' }))
  const products = useMemo(() => data || [], [data])
  // Default to ALL; the tabs refine the showcases below in place (no reload).
  const [gender, setGender] = useState('all')

  const genderProducts = useMemo(
    () => (gender === 'all' ? products : products.filter((p) => (p.gender || 'unisex') === gender)),
    [products, gender],
  )

  const featured = genderProducts.filter((p) => p.badge === 'Best Seller')
  const newArrivals = genderProducts.filter((p) => p.badge === 'New' || p.badge === 'Hot').slice(0, 4)
  const displayNewArrivals = newArrivals.length >= 4 ? newArrivals : genderProducts.slice(0, 4)
  const dealsOfDay = genderProducts.filter((p) => p.oldPrice).slice(0, 8)

  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES

  return (
    <div className="bg-white">
      {/* Campaign Hero — Full Screen Dark Cinematic Athletic Banner (Reference Image 2) */}
      <section className="relative h-[85vh] min-h-[560px] max-h-[820px] w-full overflow-hidden bg-black">
        {/* Background Athletic Visual */}
        <img
          src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1600&auto=format&fit=crop"
          alt="Buyly Stealth Compression Performance Collection"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-85 select-none"
        />
        {/* Deep atmospheric dark vignette + gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 sm:px-8 sm:pb-20">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-neutral-300">
            ENGINEERED ATHLETIC SERIES · 2026
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none">
            Stealth Compression LIVE!
          </h1>
          <p className="mt-4 max-w-lg text-xs sm:text-sm leading-relaxed text-neutral-300 font-medium">
            Next-generation compression fits built with active thermal regulation and four-way stretch reinforcement for peak training output.
          </p>

          {/* Dual High-Contrast CTA Buttons (Reference Image 2) */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center bg-white px-8 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-black transition-all duration-200 hover:bg-neutral-200 shadow-md"
            >
              New Arrivals
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center border-2 border-white bg-transparent px-8 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-white transition-all duration-200 hover:bg-white hover:text-black"
            >
              Shop All
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="border-b border-neutral-200/60 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-neutral-100 px-4 sm:grid-cols-4 sm:px-6">
          {[
            ['Free Shipping', 'On orders over $75'],
            ['Guaranteed Returns', 'Hassle-free 30-day exchanges'],
            ['Encrypted Checkout', '256-bit SSL certified security'],
            ['Client Support', 'Dedicated 24/7 care portal'],
          ].map(([t, s]) => (
            <div key={t} className="px-3 py-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-900">{t}</p>
              <p className="mt-0.5 text-[10px] font-medium text-neutral-400">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-7 flex flex-col gap-5 border-b border-neutral-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
              {gender.toUpperCase()}
            </p>
            <h2 className="mt-1.5 text-2xl font-black uppercase tracking-tight text-neutral-950 sm:text-3xl">
              Shop By Category
            </h2>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <GenderTabs value={gender} onChange={setGender} />
          </div>
        </div>

        <CategoryCarousel categories={displayCategories} />
      </section>

      {/* NEW ARRIVALS (Reference Image 1) */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Centered Bold Section Header (Reference Image 1) */}
        <div className="text-center pb-10">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.22em] text-neutral-950">
            NEW ARRIVALS
          </h2>
          <p className="mt-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400">
            Engineered For Movement · In Stock Now
          </p>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <ProductGridSkeleton count={4} />
        ) : displayNewArrivals.length === 0 ? (
          <div className="grid place-items-center border border-dashed border-neutral-200 py-20 text-center">
            <p className="text-sm font-black uppercase tracking-widest text-neutral-900">Nothing here yet</p>
            <p className="mt-1.5 text-xs font-medium text-neutral-400">No {gender.toUpperCase()} products are available right now.</p>
          </div>
        ) : (
          <>
            {/* 4-Column Product Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-11 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-7">
              {displayNewArrivals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Centered "View all" link with clean underline (Reference Image 1) */}
            <div className="mt-12 text-center">
              <Link
                to={gender === 'all' ? '/shop' : `/shop?gender=${gender}`}
                className="inline-block text-xs font-black uppercase tracking-widest text-neutral-950 underline underline-offset-6 decoration-1 hover:text-neutral-500 transition-colors"
              >
                View all
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Technical Editorial Split Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 items-center border border-neutral-200/70 bg-neutral-50 p-6 sm:p-12">
          <div className="space-y-4 py-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
              TECHNICAL SPECIFICATION
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-neutral-950 sm:text-4xl">
              CORE INSULATION FLEECE
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 font-medium">
              Engineered with dual-brushed thermal fleece, our long sleeve crewnecks and compression hoodies lock in body heat while regulating skin microclimate humidity. Crafted with water-repellent panel reinforcement for intense outdoor training.
            </p>
            <div className="pt-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-neutral-950 px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-neutral-800 rounded-none cursor-pointer"
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

      {/* Featured Best Sellers Row */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-end justify-between border-b border-neutral-200/60 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">BEST SELLERS</p>
              <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-neutral-950 sm:text-3xl">
                TOP RATED PERFORMANCE
              </h2>
            </div>
            <Link
              to="/shop?sort=rating"
              className="hidden shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-neutral-500 transition-colors hover:text-black sm:flex"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-11 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-7">
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mid-Page Promo Banner */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden bg-black px-8 py-16 text-center sm:px-14 sm:text-left">
          <div className="absolute inset-0 bg-neutral-950 opacity-90" />
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                SEASON CLOSURE SALES
              </span>
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                UP TO 40% OFF SELECT ATHLETIC STYLES
              </h3>
              <p className="max-w-md text-xs sm:text-sm leading-relaxed text-neutral-400 font-medium">
                Perform at your absolute peak. Discover marked-down prices on windbreakers, trainers, and seamless compression gear.
              </p>
            </div>
            <Link
              to="/shop?sort=discount"
              className="group inline-flex shrink-0 items-center gap-2 bg-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-black transition-colors hover:bg-neutral-200 rounded-none cursor-pointer"
            >
              Shop Sale
              <ArrowRight size={13} className="transition-transform duration-250 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Deals of the Week Row */}
      {dealsOfDay.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-end justify-between border-b border-neutral-200/60 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">SEASONAL DEALS</p>
              <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-neutral-950 sm:text-3xl">
                DEALS OF THE WEEK
              </h2>
            </div>
            <Link
              to="/shop?sort=discount"
              className="hidden shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-neutral-500 transition-colors hover:text-black sm:flex"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-11 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-7">
            {dealsOfDay.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <InstallSection />
    </div>
  )
}

function CategoryCarousel({ categories }) {
  const railRef = useRef(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateScrollState = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    const maxScroll = rail.scrollWidth - rail.clientWidth
    setCanScrollPrev(rail.scrollLeft > 4)
    setCanScrollNext(maxScroll > 4 && rail.scrollLeft < maxScroll - 4)
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(updateScrollState)
    window.addEventListener('resize', updateScrollState)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [categories.length, updateScrollState])

  const scrollByPage = (direction) => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.78, 260),
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-end gap-2 sm:hidden">
        <CarouselButton
          ariaLabel="Scroll categories left"
          disabled={!canScrollPrev}
          onClick={() => scrollByPage(-1)}
        >
          <ArrowLeft size={15} />
        </CarouselButton>
        <CarouselButton
          ariaLabel="Scroll categories right"
          disabled={!canScrollNext}
          onClick={() => scrollByPage(1)}
        >
          <ArrowRight size={15} />
        </CarouselButton>
      </div>

      <div
        ref={railRef}
        onScroll={updateScrollState}
        className="category-carousel no-scrollbar flex snap-x gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4"
      >
        {categories.map((c, index) => {
          const mapped = CATEGORY_ASSETS[c.id]
          const bgImg = resolveImg(c.image) || mapped?.image || CATEGORY_FALLBACK_IMAGES[index % CATEGORY_FALLBACK_IMAGES.length]

          return (
            <Link
              key={c.id}
              to={`/shop?category=${c.id}`}
              className="group relative flex aspect-[3/4] min-w-[74%] snap-start flex-col justify-end overflow-hidden rounded-[6px] bg-neutral-950 shadow-[0_18px_50px_rgba(0,0,0,0.08)] sm:min-w-[44%] md:min-w-[32%] lg:min-w-[24%] xl:min-w-[20%]"
            >
              <img
                src={bgImg}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/24 to-transparent transition-opacity duration-300 group-hover:from-black/88" />
              <div className="relative z-10 p-5 transition-transform duration-300 group-hover:-translate-y-1 sm:p-6">
                <p className="max-w-[12rem] text-sm font-black uppercase leading-tight tracking-[0.18em] text-white sm:text-base">
                  {c.name}
                </p>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.24em] text-white/66 transition-colors duration-300 group-hover:text-white">
                  Explore
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-5 hidden items-center justify-between sm:flex">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
          {categories.length} collection{categories.length === 1 ? '' : 's'}
        </p>
        <div className="flex items-center gap-2">
          <CarouselButton
            ariaLabel="Scroll categories left"
            disabled={!canScrollPrev}
            onClick={() => scrollByPage(-1)}
          >
            <ArrowLeft size={15} />
          </CarouselButton>
          <CarouselButton
            ariaLabel="Scroll categories right"
            disabled={!canScrollNext}
            onClick={() => scrollByPage(1)}
          >
            <ArrowRight size={15} />
          </CarouselButton>
        </div>
      </div>
    </div>
  )
}

function CarouselButton({ ariaLabel, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-950 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white disabled:border-neutral-100 disabled:bg-neutral-50 disabled:text-neutral-300 disabled:shadow-none"
    >
      {children}
    </button>
  )
}

