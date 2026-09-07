import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/useStore'
import { currency, discountPct } from '../lib/format'
import ProductImage from './ProductImage'
import { Bag, Heart } from './icons'
import { swatchProps, colorName } from '../lib/colorSwatch'

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWished } = useStore()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [selectedColorIdx, setSelectedColorIdx] = useState(0)

  const off = discountPct(product.price, product.oldPrice)
  const wished = isWished(product.id)
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0

  const activeColor = product.colors && product.colors[selectedColorIdx]
  const activeColorImage = typeof activeColor === 'object' ? activeColor?.image : null
  const metaLabel = product.brand || product.categoryName || product.categorySlug?.replace('-', ' ') || 'Buyly'
  const badge = off > 0 ? 'Sale' : product.badge

  return (
    <div
      className="group relative flex h-full min-w-0 flex-col bg-white select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4.35] overflow-hidden rounded-[6px] bg-[#f6f3ee]">
        <Link to={`/product/${product.slug}`} aria-label={product.name} className="block h-full w-full">
          <div className="relative h-full w-full overflow-hidden">
            <ProductImage
              product={product}
              imageIndex={0}
              src={activeColorImage}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-[1.045] ${
                hovered && product.images && product.images[1] && !activeColorImage ? 'opacity-0' : 'opacity-100'
              }`}
              emojiSize="5rem"
            />
            {product.images && product.images[1] && !activeColorImage && (
              <ProductImage
                product={product}
                imageIndex={1}
                className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-[1.045] ${
                  hovered ? 'opacity-100' : 'opacity-0'
                }`}
                emojiSize="5rem"
              />
            )}
          </div>
        </Link>

        {badge && (
          <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-[3px] bg-white/88 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-neutral-950 shadow-[0_8px_22px_rgba(0,0,0,0.08)] backdrop-blur-md">
            {badge}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(product)
          }}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full shadow-[0_8px_22px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-200 cursor-pointer ${
            wished
              ? 'bg-white text-rose-600 opacity-100'
              : 'bg-white/80 text-neutral-500 opacity-100 hover:bg-white hover:text-neutral-950 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          <Heart size={14} filled={wished} />
        </button>

        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-0 opacity-100 transition-all duration-300 ease-out sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (hasVariants) navigate(`/product/${product.slug}`)
              else addToCart(product)
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950/86 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_34px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all duration-200 hover:bg-neutral-950 sm:py-3"
          >
            <Bag size={13} />
            {hasVariants ? 'Choose Options' : 'Quick Add'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-3.5">
        <div className="flex min-h-4 items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[9px] font-black uppercase tracking-[0.22em] text-neutral-400">
            {metaLabel}
          </p>
          {off > 0 && (
            <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">
              Save {off}%
            </span>
          )}
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="mt-1.5 min-h-[2.35rem] text-sm font-black uppercase leading-[1.18] tracking-normal text-neutral-950 transition-colors line-clamp-2 hover:text-neutral-600 sm:text-[15px]"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-sm font-black ${off > 0 ? 'text-neutral-950' : 'text-neutral-900'}`}>
            {currency(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-xs font-semibold text-neutral-400 line-through">
              {currency(product.oldPrice)}
            </span>
          )}
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="mt-3 flex min-h-5 items-center gap-1.5">
            {product.colors.slice(0, 4).map((c, i) => {
              const sw = swatchProps(c)
              const name = colorName(c)
              const isSelected = selectedColorIdx === i
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedColorIdx(i)}
                  title={name}
                  aria-label={`Select ${name}`}
                  style={sw.style}
                  className={`h-3.5 w-3.5 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.16)] transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-1 ring-neutral-950 ring-offset-2 scale-105'
                      : 'opacity-80 hover:scale-105 hover:opacity-100'
                  } ${sw.className}`}
                />
              )
            })}
            {product.colors.length > 4 && (
              <Link
                to={`/product/${product.slug}`}
                className="ml-0.5 text-[9px] font-bold text-neutral-400 transition-colors hover:text-black"
              >
                +{product.colors.length - 4}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

