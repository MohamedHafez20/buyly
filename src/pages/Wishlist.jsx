import { Link } from 'react-router-dom'
import { useStore } from '../context/useStore'
import { products } from '../data/products'
import ProductCard from '../components/ProductCard'
import { ArrowRight, Heart } from '../components/icons'

export default function Wishlist() {
  const { wishlist } = useStore()
  const items = products.filter((p) => wishlist.includes(p.id))

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center border border-neutral-200 text-neutral-400 bg-neutral-50 rounded-full">
          <Heart size={22} />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold uppercase tracking-tight text-neutral-900">Your wishlist is empty</h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Tap the heart on any product card to save it here.</p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 bg-black px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 rounded-none cursor-pointer"
        >
          Browse Products <ArrowRight size={13} />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 bg-white">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-neutral-400">Saved for later</p>
      <h1 className="mt-1.5 text-3xl font-extrabold uppercase tracking-tight text-neutral-900">My Wishlist</h1>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        {items.length} saved item{items.length !== 1 && 's'}
      </p>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
