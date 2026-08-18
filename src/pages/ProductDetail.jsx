import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getProductBySlug, listProducts } from '../services/products'
import { useStore } from '../context/useStore'
import { currency, discountPct } from '../lib/format'
import ProductImage from '../components/ProductImage'
import ProductCard from '../components/ProductCard'
import StarRating from '../components/StarRating'
import { LoadingState, ErrorState } from '../components/States'
import { Cart, Heart, Plus, Minus, Check, Truck, Refresh, Shield, ArrowRight, ChevronDown, ChevronUp } from '../components/icons'
import { swatchClass } from '../lib/colorSwatch'

// Keyed by slug (see wrapper below) so navigating between products remounts
// with a fresh loading state instead of showing the previous product.
function ProductDetailInner({ slug }) {
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, isWished } = useStore()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')

  const [accordions, setAccordions] = useState({ description: true, care: false, shipping: false })
  const toggleAccordion = (tab) => setAccordions((prev) => ({ ...prev, [tab]: !prev[tab] }))

  useEffect(() => {
    let active = true
    getProductBySlug(slug)
      .then((p) => {
        if (!active) return
        setProduct(p)
        setSelectedColor(p.colors?.[0] || '')
        setSelectedSize(p.sizes?.[0] || '')
        // Fetch related items from the same category.
        return listProducts({ category: p.category, status: 'active' }).then((list) => {
          if (active) setRelated(list.filter((x) => x.id !== p.id).slice(0, 4))
        })
      })
      .catch((err) => {
        if (!active) return
        if (err.status === 404) setNotFound(true)
        else setError(err.message || 'Failed to load product')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <LoadingState label="Loading product" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-6xl">🫥</p>
        <h1 className="mt-4 text-2xl font-bold">Product not found</h1>
        <Link to="/shop" className="mt-6 inline-block bg-black px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 rounded-none">Back to shop</Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <ErrorState message={error} onRetry={() => navigate(0)} />
      </div>
    )
  }

  const off = discountPct(product.price, product.oldPrice)
  const wished = isWished(product.id)
  const inStock = product.stock > 0

  const getCareInfo = (category) => {
    switch (category) {
      case 'footwear':
        return 'Wipe clean with a damp cloth or soft brush. Do not machine wash. Air dry at room temperature away from direct heat.'
      case 'accessories':
        return 'Spot clean only. Do not bleach. Air dry. Keep in dry ventilated storage bags when not in training.'
      case 'jackets':
        return 'Machine wash cold on gentle cycle. Do not bleach or use softeners. Tumble dry low or line dry to protect DWR coating.'
      default:
        return 'Machine wash cold with like colors. Tumble dry low. Do not bleach. Cool iron if needed. Avoid fabric softeners.'
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumbs */}
      <nav className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <span className="mx-2 text-neutral-300">/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-black transition-colors">{product.categoryName}</Link>
        <span className="mx-2 text-neutral-300">/</span>
        <span className="text-neutral-600">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden border border-neutral-100 bg-neutral-50 aspect-[4/5] relative">
            <ProductImage
              product={product}
              imageIndex={activeImg}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105 cursor-zoom-in"
              emojiSize="8rem"
            />
          </div>
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`overflow-hidden border aspect-[4/5] bg-neutral-50 hover:border-black transition cursor-pointer ${
                    activeImg === i ? 'border-black ring-1 ring-black' : 'border-neutral-200'
                  }`}
                >
                  <ProductImage product={product} imageIndex={i} className="h-full w-full object-cover" emojiSize="2.2rem" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info detail column */}
        <div className="flex flex-col">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-neutral-400">{product.brand}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl leading-tight uppercase">{product.name}</h1>

          <div className="mt-4 flex items-center gap-4 text-xs border-b border-neutral-100 pb-4">
            {product.reviews > 0 && <StarRating value={product.rating} showValue reviews={product.reviews} />}
            {product.reviews > 0 && <span className="text-neutral-200">|</span>}
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                In stock (Ready to Ship)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-bold text-rose-600">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Out of stock
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-black text-neutral-950">{currency(product.price)}</span>
            {product.oldPrice && (
              <span className="text-lg line-through text-neutral-400 font-normal">{currency(product.oldPrice)}</span>
            )}
            {off > 0 && (
              <span className="bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-700">Save {off}%</span>
            )}
          </div>

          {product.description && <p className="mt-5 text-sm leading-relaxed text-neutral-500 font-medium">{product.description}</p>}

          {/* Color swatches selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-900">Color: <span className="text-neutral-500 normal-case font-semibold ml-1">{selectedColor}</span></h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const active = selectedColor === c
                  const bgClass = swatchClass(c)
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`h-7 w-7 rounded-full border cursor-pointer transition-all ${bgClass} ${
                        active ? 'ring-2 ring-black ring-offset-2 scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      title={c}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Size grid selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-900">Size: <span className="text-neutral-500 font-semibold ml-1">{selectedSize}</span></h3>
                <button className="text-[10px] font-bold text-neutral-400 hover:text-black uppercase tracking-wider underline">Size Chart</button>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:max-w-xs">
                {product.sizes.map((s) => {
                  const active = selectedSize === s
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`border py-2.5 text-xs font-bold transition-all uppercase rounded-none cursor-pointer ${
                        active
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-black'
                      }`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity and Action buttons */}
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Qty Selector */}
              <div className="flex items-center border border-neutral-250 bg-white h-12 justify-between px-2 w-full sm:w-28 shrink-0 select-none">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-8 w-8 place-items-center text-neutral-500 hover:text-black transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="w-6 text-center text-xs font-bold text-neutral-900">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="grid h-8 w-8 place-items-center text-neutral-500 hover:text-black transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => addToCart(product, qty)}
                disabled={!inStock}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-black h-12 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors duration-250 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-none cursor-pointer"
              >
                <Cart size={14} /> {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {/* Buy Now */}
              <button
                onClick={() => { addToCart(product, qty); navigate('/checkout') }}
                disabled={!inStock}
                className="flex-1 border border-neutral-300 bg-white h-12 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-neutral-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-none cursor-pointer"
              >
                Buy Now
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`grid h-12 w-12 shrink-0 place-items-center border transition-all duration-250 cursor-pointer ${
                  wished
                    ? 'border-rose-100 bg-rose-50 text-rose-600'
                    : 'border-neutral-300 text-neutral-400 hover:border-black hover:text-rose-600 bg-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart size={16} filled={wished} />
              </button>
            </div>
          </div>

          {/* Accordion Tabs */}
          <div className="mt-8 border-t border-neutral-100 pt-3">
            {/* Features tab */}
            {product.features?.length > 0 && (
              <div className="border-b border-neutral-100 py-3">
                <button
                  onClick={() => toggleAccordion('description')}
                  className="flex w-full items-center justify-between font-bold text-xs uppercase tracking-wider text-neutral-900 py-1.5 cursor-pointer text-left"
                >
                  <span>Features & Fit</span>
                  {accordions.description ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {accordions.description && (
                  <div className="mt-3 text-xs leading-relaxed text-neutral-500 font-medium space-y-2 pl-1.5">
                    <ul className="grid grid-cols-1 gap-2">
                      {product.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <span className="grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-800">
                            <Check size={10} />
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Material and Care tab */}
            <div className="border-b border-neutral-100 py-3">
              <button
                onClick={() => toggleAccordion('care')}
                className="flex w-full items-center justify-between font-bold text-xs uppercase tracking-wider text-neutral-900 py-1.5 cursor-pointer text-left"
              >
                <span>Material & Care</span>
                {accordions.care ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {accordions.care && (
                <div className="mt-3 text-xs leading-relaxed text-neutral-500 font-medium pl-1.5">
                  <p>{getCareInfo(product.categorySlug)}</p>
                </div>
              )}
            </div>

            {/* Shipping & returns tab */}
            <div className="border-b border-neutral-100 py-3">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="flex w-full items-center justify-between font-bold text-xs uppercase tracking-wider text-neutral-900 py-1.5 cursor-pointer text-left"
              >
                <span>Shipping & Returns</span>
                {accordions.shipping ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {accordions.shipping && (
                <div className="mt-3 text-xs leading-relaxed text-neutral-500 font-medium pl-1.5 space-y-1.5">
                  <p><strong>Free Standard Delivery:</strong> Standard shipping takes 3-5 business days. Free for all orders over $75.</p>
                  <p><strong>Exchanges & Returns:</strong> Hassle-free exchanges or refund returns within 30 days of purchase in original packaging.</p>
                </div>
              )}
            </div>
          </div>

          {/* trust indicators */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-6 text-center">
            {[[Truck, 'Free Shipping', 'Over $75 orders'], [Refresh, '30-Day Returns', 'Hassle-free policy'], [Shield, 'Secure Checkout', 'SSL certified']].map(([Ic, t, s]) => (
              <div key={t} className="flex flex-col items-center gap-1">
                <Ic size={16} className="text-neutral-800" />
                <p className="text-[9px] font-extrabold text-neutral-900 uppercase tracking-wider mt-1">{t}</p>
                <p className="text-[9px] text-neutral-400 font-medium leading-tight">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-neutral-100 pt-12">
          <div className="flex items-end justify-between border-b border-neutral-100 pb-3">
            <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 uppercase">You may also like</h2>
            <Link to={`/shop?category=${product.category}`} className="hidden items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 hover:text-black transition-colors sm:flex">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  return <ProductDetailInner key={slug} slug={slug} />
}
