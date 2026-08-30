import { useCallback, useEffect, useState, useMemo } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getProductBySlug, listProducts } from '../services/products'
import { useStore } from '../context/useStore'
import { useAuth } from '../context/useAuth'
import { listProductReviews, createProductReview, deleteUserReview } from '../services/reviews'
import { currency, discountPct, formatDate } from '../lib/format'
import ProductImage from '../components/ProductImage'
import ProductCard from '../components/ProductCard'
import BundlePicker from '../components/BundlePicker'
import StarRating from '../components/StarRating'
import { LoadingState, ErrorState } from '../components/States'
import { Cart, Heart, Plus, Minus, Check, Truck, Refresh, Shield, ArrowRight, ChevronDown, ChevronUp } from '../components/icons'
import { swatchProps, colorName } from '../lib/colorSwatch'

// Keyed by slug (see wrapper below) so navigating between products remounts
// with a fresh loading state instead of showing the previous product.
function ProductDetailInner({ slug }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addToCart, toggleWishlist, isWished } = useStore()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  // When a selected color has its own image, it overrides the gallery hero.
  // Cleared (null) to fall back to the gallery — e.g. when a thumbnail is picked.
  const [colorImg, setColorImg] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')

  const [accordions, setAccordions] = useState({ description: true, care: false, shipping: false })
  const toggleAccordion = (tab) => setAccordions((prev) => ({ ...prev, [tab]: !prev[tab] }))

  const reloadProduct = () => {
    getProductBySlug(slug).then((p) => setProduct(p)).catch(() => {})
  }

  useEffect(() => {
    let active = true
    getProductBySlug(slug)
      .then((p) => {
        if (!active) return
        setProduct(p)
        // Deep-link support: honor ?color=<name> (e.g. a swatch pressed on a
        // product card). For variant products, land on a first in-stock combo.
        const names = (p.colors || []).map(colorName)
        const preferred = searchParams.get('color')
        const vlist = p.variants || []
        let chosenColor = ''
        if (vlist.length) {
          const inStockVariants = vlist.filter((v) => v.stock > 0)
          const pick = inStockVariants.find((v) => v.color === preferred) || inStockVariants[0] || vlist[0]
          chosenColor = pick?.color || (preferred && names.includes(preferred) ? preferred : names[0]) || ''
          setSelectedColor(chosenColor)
          setSelectedSize(pick?.size || p.sizes?.[0] || '')
        } else {
          chosenColor = preferred && names.includes(preferred) ? preferred : (names[0] || '')
          setSelectedColor(chosenColor)
          setSelectedSize(p.sizes?.[0] || '')
        }
        // If the landing color has its own image, show it as the hero.
        const chosen = (p.colors || []).find((c) => colorName(c) === chosenColor)
        setColorImg(chosen?.image || null)
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
  }, [slug, searchParams])

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

  // Per-variant availability. For non-variant products these collapse to the
  // existing product-level stock behavior.
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
  const variantFor = (c, s) => (product.variants || []).find((v) => v.color === c && v.size === s)
  const stockFor = (c, s) => variantFor(c, s)?.stock ?? 0
  const colorHasStock = (c) => (product.sizes || []).some((s) => stockFor(c, s) > 0)
  const selectedVariant = hasVariants ? variantFor(selectedColor, selectedSize) : null
  const maxStock = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock
  const inStock = maxStock > 0
  const canAddToCart = maxStock >= qty && qty >= 1
  const variantArg = selectedVariant
    ? { color: selectedVariant.color, size: selectedVariant.size, sku: selectedVariant.sku }
    : null

  // The image an admin attached to a given color name, if any.
  const colorImageFor = (name) => (product.colors || []).find((c) => colorName(c) === name)?.image || null

  // Selecting a color swaps the hero image to that color's photo (when set),
  // and snaps the size to an in-stock one when the current size is unavailable
  // for that color.
  const selectColor = (name) => {
    setSelectedColor(name)
    setColorImg(colorImageFor(name))
    if (hasVariants && stockFor(name, selectedSize) <= 0) {
      const firstInStock = (product.sizes || []).find((s) => stockFor(name, s) > 0)
      setSelectedSize(firstInStock || '')
    }
  }

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
              src={colorImg}
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
                  onClick={() => { setActiveImg(i); setColorImg(null) }}
                  className={`overflow-hidden border aspect-[4/5] bg-neutral-50 hover:border-black transition cursor-pointer ${
                    !colorImg && activeImg === i ? 'border-black ring-1 ring-black' : 'border-neutral-200'
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
                  const name = colorName(c)
                  const active = selectedColor === name
                  const sw = swatchProps(c)
                  const soldOut = hasVariants && !colorHasStock(name)
                  return (
                    <button
                      key={name}
                      onClick={() => selectColor(name)}
                      disabled={soldOut}
                      style={sw.style}
                      aria-label={soldOut ? `${name} (out of stock)` : name}
                      aria-pressed={active}
                      className={`h-7 w-7 rounded-full border transition-all ${sw.className} ${
                        active ? 'ring-2 ring-black ring-offset-2 scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'
                      } ${soldOut ? 'opacity-25 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                      title={soldOut ? `${name} — out of stock` : name}
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
                  const soldOut = hasVariants && stockFor(selectedColor, s) <= 0
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      disabled={soldOut}
                      className={`border py-2.5 text-xs font-bold transition-all uppercase rounded-none ${
                        active
                          ? 'border-black bg-black text-white'
                          : soldOut
                            ? 'border-neutral-200 bg-neutral-50 text-neutral-300 line-through cursor-not-allowed'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-black cursor-pointer'
                      }`}
                      title={soldOut ? `${s} — out of stock` : s}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>

              {/* Per-variant stock status */}
              {hasVariants && (
                <p className="mt-3 text-[10px] font-extrabold uppercase tracking-wider">
                  {!selectedVariant || selectedVariant.stock <= 0 ? (
                    <span className="text-rose-600">This color / size is out of stock</span>
                  ) : selectedVariant.stock <= 5 ? (
                    <span className="text-amber-600">Hurry — only {selectedVariant.stock} left</span>
                  ) : (
                    <span className="text-emerald-600">In stock</span>
                  )}
                </p>
              )}
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
                  onClick={() => setQty((q) => Math.min(maxStock > 0 ? Math.min(99, maxStock) : 99, q + 1))}
                  className="grid h-8 w-8 place-items-center text-neutral-500 hover:text-black transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => addToCart(product, qty, variantArg)}
                disabled={!canAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-black h-12 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors duration-250 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-none cursor-pointer"
              >
                <Cart size={14} /> {hasVariants && !selectedVariant ? 'Select Options' : canAddToCart ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {/* Buy Now */}
              <button
                onClick={() => { addToCart(product, qty, variantArg); navigate('/checkout') }}
                disabled={!canAddToCart}
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

          {/* Bundle & Save offers (only when the product has active tiers) */}
          <BundlePicker product={product} />

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

      <ReviewsSection
        productId={product.id}
        productSlug={product.slug}
        productRating={product.rating}
        productReviewsCount={product.reviews}
        reloadProduct={reloadProduct}
      />

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

function ReviewsSection({ productId, productSlug, productRating, productReviewsCount, reloadProduct }) {
  const { user, isAuthenticated } = useAuth()
  const { notify } = useStore()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const fetchReviews = useCallback(async (isActive = () => true) => {
    try {
      const data = await listProductReviews(productId)
      if (!isActive()) return
      setReviews(data)
      setError(null)
    } catch (err) {
      if (isActive()) setError(err.message || 'Failed to load reviews')
    } finally {
      if (isActive()) setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (!active) return
      setLoading(true)
      fetchReviews(() => active)
    })
    return () => {
      active = false
    }
  }, [fetchReviews])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createProductReview(productId, { rating, comment })
      notify('Review submitted successfully!')
      setComment('')
      setRating(5)
      fetchReviews()
      if (reloadProduct) reloadProduct()
    } catch (err) {
      notify(err.message || 'Could not submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return
    try {
      await deleteUserReview(reviewId)
      notify('Review deleted')
      fetchReviews()
      if (reloadProduct) reloadProduct()
    } catch (err) {
      notify(err.message || 'Could not delete review')
    }
  }

  // Calculate rating breakdown
  const breakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((r) => {
      if (counts[r.rating] !== undefined) counts[r.rating]++
    })
    return counts
  }, [reviews])

  return (
    <section className="mt-16 border-t border-neutral-100 pt-12">
      <div className="grid gap-12 lg:grid-cols-3">
        {/* Left: Summary */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 uppercase">Customer Reviews</h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-4xl font-black text-neutral-900">{productRating.toFixed(1)}</span>
              <div>
                <StarRating value={productRating} size={18} />
                <p className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider mt-1">Based on {productReviewsCount} review{productReviewsCount !== 1 && 's'}</p>
              </div>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = breakdown[stars]
              const total = reviews.length || 1
              const pct = (count / total) * 100
              return (
                <div key={stars} className="flex items-center gap-3 text-xs font-semibold text-neutral-600">
                  <span className="w-12 shrink-0">{stars} star{stars !== 1 && 's'}</span>
                  <div className="h-2 flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right">{count}</span>
                </div>
              )
            })}
          </div>

          {/* Submit form container */}
          <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 rounded-none">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 dark:text-white mb-4">Write a review</h3>
            {isAuthenticated ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <span className="block text-[9px] font-extrabold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase mb-2">Your Rating</span>
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || rating)
                      return (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={`text-2xl cursor-pointer transition ${
                            active ? 'text-amber-400' : 'text-neutral-250 dark:text-neutral-850'
                          }`}
                        >
                          ★
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-[9px] font-extrabold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase mb-2">Comment</span>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Describe your experience with this product..."
                    className="w-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white px-3 py-2 text-xs font-semibold outline-none transition duration-150 focus:border-black dark:focus:border-white rounded-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black dark:bg-white text-white dark:text-neutral-950 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition disabled:opacity-55 cursor-pointer rounded-none"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-neutral-450 uppercase font-semibold tracking-wider mb-3">You must be signed in to write a review</p>
                <Link
                  to={`/login?redirect=/product/${productSlug}`}
                  className="inline-block bg-black dark:bg-white text-white dark:text-neutral-950 px-6 py-3 text-[9px] font-bold uppercase tracking-wider transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800/40 pb-3">Reviews</h2>
          {loading ? (
            <p className="text-xs text-neutral-450 uppercase font-semibold tracking-wider">Loading reviews...</p>
          ) : error ? (
            <p className="text-xs text-rose-600 uppercase font-semibold tracking-wider py-6">{error}</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-neutral-450 uppercase font-semibold tracking-wider py-6">No reviews yet for this product. Be the first to review!</p>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/30">
              {reviews.map((r) => {
                const isOwner = user?.id === r.user || user?.role === 'admin'
                return (
                  <li key={r.id} className="py-5 first:pt-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">{r.name}</span>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">{formatDate(r.createdAt)}</span>
                        </div>
                        <div className="mt-1.5">
                          <StarRating value={r.rating} size={13} />
                        </div>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    {r.comment && <p className="mt-3.5 text-xs text-neutral-650 dark:text-neutral-400 font-medium leading-relaxed">{r.comment}</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
