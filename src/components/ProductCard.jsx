import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/useStore'
import { currency, discountPct } from '../lib/format'
import ProductImage from './ProductImage'
import StarRating from './StarRating'
import { Heart } from './icons'
import { swatchClass } from '../lib/colorSwatch'

const badgeStyles = {
  'Best Seller': 'bg-black text-white',
  New: 'bg-white text-neutral-900 border border-neutral-200/80',
  Hot: 'bg-rose-700 text-white',
}

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWished } = useStore()
  const [hovered, setHovered] = useState(false)
  const off = discountPct(product.price, product.oldPrice)
  const wished = isWished(product.id)

  return (
    <div 
      className="group relative flex flex-col bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 border border-neutral-100">
        <Link to={`/product/${product.slug}`} aria-label={product.name} className="block h-full w-full">
          {/* Main image with transition to second image on hover */}
          <div className="relative h-full w-full">
            <ProductImage 
              product={product} 
              imageIndex={0} 
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                hovered && product.images && product.images[1] ? 'opacity-0' : 'opacity-100'
              }`} 
              emojiSize="4.5rem" 
            />
            {product.images && product.images[1] && (
              <ProductImage 
                product={product} 
                imageIndex={1} 
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  hovered ? 'opacity-100' : 'opacity-0'
                }`} 
                emojiSize="4.5rem" 
              />
            )}
          </div>
        </Link>

        {/* badges */}
        <div className="pointer-events-none absolute left-0 top-3 flex flex-col gap-1">
          {product.badge && (
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeStyles[product.badge] || 'bg-black text-white'}`}>
              {product.badge}
            </span>
          )}
          {off > 0 && (
            <span className="bg-rose-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              Save {off}%
            </span>
          )}
        </div>

        {/* wishlist button */}
        <button
          onClick={() => toggleWishlist(product)}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm border border-neutral-100 transition-all duration-300 ${
            wished
              ? 'bg-rose-50 text-rose-600 border-rose-100'
              : 'text-neutral-500 opacity-0 group-hover:opacity-100 hover:bg-neutral-50 hover:text-black'
          }`}
        >
          <Heart size={14} filled={wished} />
        </button>

        {/* quick add slide up */}
        <button
          onClick={() => addToCart(product)}
          className="absolute inset-x-0 bottom-0 translate-y-full bg-black py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-transform duration-300 ease-out hover:bg-neutral-800 group-hover:translate-y-0 rounded-none cursor-pointer"
        >
          Quick Add
        </button>
      </div>

      {/* product details */}
      <div className="flex flex-1 flex-col pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{product.brand}</p>
          {product.colors && product.colors.length > 0 && (
            <span className="text-[9px] text-neutral-400 font-medium uppercase">{product.colors.length} color{product.colors.length > 1 && 's'}</span>
          )}
        </div>
        <Link
          to={`/product/${product.slug}`}
          className="mt-1 text-sm font-semibold tracking-tight text-neutral-900 hover:text-black line-clamp-1 transition-colors"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-1.5">
          <StarRating value={product.rating} size={11} />
          <span className="text-[10px] text-neutral-400">({product.reviews})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-bold text-neutral-900">{currency(product.price)}</span>
          {product.oldPrice && (
            <span className="text-[11px] font-normal text-neutral-400 line-through">{currency(product.oldPrice)}</span>
          )}
        </div>

        {/* Color preview dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-2.5 flex gap-1.5 items-center">
            {product.colors.slice(0, 3).map((c, i) => (
              <span
                key={i}
                title={c}
                className={`h-2.5 w-2.5 rounded-full border ${swatchClass(c)}`}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[9px] text-neutral-400 font-bold">+{product.colors.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
