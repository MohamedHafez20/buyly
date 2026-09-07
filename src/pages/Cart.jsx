import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/useStore'
import { useCartSummary, lineKey } from '../lib/cart'
import { currency } from '../lib/format'
import ProductImage from '../components/ProductImage'
import OrderSummary from '../components/OrderSummary'
import CouponField from '../components/CouponField'
import { swatchProps } from '../lib/colorSwatch'
import { Plus, Minus, Trash, ArrowRight, Truck, Cart as CartIcon } from '../components/icons'

export default function Cart() {
  const { cart, setQty, removeFromCart, clearCart, coupon, applyCoupon, clearCoupon } = useStore()
  const { summary, error } = useCartSummary(cart, coupon)
  const [expanded, setExpanded] = useState({})

  // Backend-priced lines keyed by product + variant — the frontend never
  // multiplies price × qty itself; it reads the line total the server returned.
  const pricedByKey = useMemo(() => {
    const m = {}
    summary?.items?.forEach((p) => { m[lineKey(p)] = p })
    return m
  }, [summary])

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center border border-neutral-200 text-neutral-400 bg-neutral-50 rounded-full">
          <CartIcon size={24} />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold uppercase tracking-tight text-neutral-900">Your cart is empty</h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Add products to your cart to see them here.</p>
        <Link to="/shop" className="mt-8 inline-flex items-center gap-2 bg-black px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 rounded-none cursor-pointer">
          Start Shopping <ArrowRight size={13} />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">Shopping Cart</h1>
      <p className="mt-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400">{cart.length} item{cart.length !== 1 && 's'} in your cart</p>

      {error && (
        <div className="mt-6 flex items-center gap-3 border border-rose-200 bg-rose-50 p-4 text-xs font-semibold uppercase tracking-wider text-rose-700">
          {error}
        </div>
      )}

      {/* Free-shipping progress — driven entirely by the backend summary. */}
      {summary && (summary.freeShippingGap > 0 ? (
        <div className="mt-6 flex items-center gap-3 border border-neutral-200/80 bg-neutral-50 p-4 text-xs font-semibold uppercase tracking-wider text-neutral-600">
          <Truck size={16} className="text-neutral-850" />
          <span>Add <strong className="text-black font-extrabold">{currency(summary.freeShippingGap)}</strong> more to unlock <strong className="text-black font-extrabold">free shipping</strong>.</span>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-3 border border-emerald-100 bg-emerald-50/50 p-4 text-xs font-semibold uppercase tracking-wider text-emerald-800">
          <Truck size={16} className="text-emerald-700 animate-bounce" />
          <span>Congratulations! You have unlocked <strong className="text-emerald-950 font-extrabold">free shipping</strong> on this order.</span>
        </div>
      ))}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart items list */}
        <div className="lg:col-span-2">
          <ul className="space-y-4">
            {cart.map((item) => {
              const key = lineKey(item)
              const priced = pricedByKey[key]

              // Bundle line: one grouped, expandable item priced at the bundle total.
              if (item.bundleTierId) {
                const open = !!expanded[key]
                return (
                  <li key={key} className="border-2 border-neutral-900/15 bg-white p-4">
                    <div className="flex gap-4">
                      <Link to={`/product/${item.slug}`}>
                        <div className="h-20 w-16 sm:h-24 sm:w-20 overflow-hidden border border-neutral-100 shrink-0">
                          <ProductImage product={item} className="h-full w-full object-cover" emojiSize="2.2rem" />
                        </div>
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <div>
                            <span className="inline-block bg-black px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white">Bundle · Buy {item.bundleQuantity}</span>
                            <Link to={`/product/${item.slug}`} className="mt-1.5 block font-bold text-neutral-800 hover:text-black text-sm sm:text-base line-clamp-1 uppercase">{item.name}</Link>
                            {item.bundleLabel && <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">{item.bundleLabel}</p>}
                            {priced && !priced.available && <p className="mt-1 text-[9px] font-extrabold uppercase tracking-wider text-rose-600">Bundle unavailable — some pieces are out of stock</p>}
                          </div>
                          <button onClick={() => removeFromCart(key)} className="h-fit p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer" aria-label="Remove bundle"><Trash size={15} /></button>
                        </div>
                        <div className="mt-auto flex items-end justify-between pt-3">
                          <button onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))} className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-black underline underline-offset-2 cursor-pointer">
                            {open ? 'Hide' : 'Show'} {item.pieces.length} pieces
                          </button>
                          <div className="text-right">
                            <p className="font-black text-neutral-900 text-sm sm:text-base">{priced ? currency(priced.lineTotal) : currency(item.bundlePrice)}</p>
                            <p className="text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5">Bundle total</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {open && (
                      <ul className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3">
                        {item.pieces.map((p, idx) => {
                          const psw = p.color ? swatchProps({ name: p.color, hex: '' }) : null
                          return (
                            <li key={idx} className="flex items-center gap-2 text-[11px] font-semibold text-neutral-600 uppercase tracking-wide">
                              <span className="text-neutral-400">Piece {idx + 1}</span>
                              {p.color && <span className="inline-flex items-center gap-1"><span style={psw?.style} className={`h-3 w-3 rounded-full border ${psw?.className || ''}`} />{p.color}</span>}
                              {p.size && <span className="text-neutral-400">· {p.size}</span>}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              }

              const sw = item.color ? swatchProps({ name: item.color, hex: '' }) : null
              return (
              <li key={key} className="flex gap-4 border border-neutral-200/60 bg-white p-4">
                <Link to={`/product/${item.slug}`}>
                  <div className="h-20 w-16 sm:h-24 sm:w-20 overflow-hidden border border-neutral-100 shrink-0">
                    <ProductImage product={item} className="h-full w-full object-cover" emojiSize="2.2rem" />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400">{item.brand}</p>
                      <Link to={`/product/${item.slug}`} className="font-bold text-neutral-800 hover:text-black transition-colors text-sm sm:text-base line-clamp-1 mt-0.5 uppercase">
                        {item.name}
                      </Link>
                      {(item.color || item.size) && (
                        <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          {item.color && (
                            <span className="inline-flex items-center gap-1">
                              <span style={sw?.style} className={`h-3 w-3 rounded-full border ${sw?.className || ''}`} />
                              {item.color}
                            </span>
                          )}
                          {item.color && item.size && <span className="text-neutral-300">·</span>}
                          {item.size && <span>Size {item.size}</span>}
                        </p>
                      )}
                      {priced && !priced.available && (
                        <p className="mt-1 text-[9px] font-extrabold uppercase tracking-wider text-rose-600">
                          {priced.reason === 'insufficient_stock' ? `Only ${priced.stock} left` : 'Unavailable'}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(key)}
                      className="h-fit p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition duration-200 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-3">
                    {/* Qty Selector */}
                    <div className="flex items-center border border-neutral-250 bg-white h-8 px-1 select-none">
                      <button
                        onClick={() => setQty(key, item.qty - 1)}
                        className="grid h-6 w-6 place-items-center text-neutral-500 hover:text-black transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-neutral-800">{item.qty}</span>
                      <button
                        onClick={() => setQty(key, item.qty + 1)}
                        className="grid h-6 w-6 place-items-center text-neutral-500 hover:text-black transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                    {/* Price details — line total comes from the backend summary */}
                    <div className="text-right">
                      <p className="font-black text-neutral-900 text-sm sm:text-base">{priced ? currency(priced.lineTotal) : '—'}</p>
                      {item.qty > 1 && priced && <p className="text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5">{currency(priced.price)} each</p>}
                    </div>
                  </div>
                </div>
              </li>
              )
            })}
          </ul>

          <div className="mt-6 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
            <Link to="/shop" className="text-neutral-500 hover:text-black transition-colors underline underline-offset-4">Continue shopping</Link>
            <button onClick={clearCart} className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer">Clear all items</button>
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary totals={summary}>
            <CouponField coupon={coupon} summary={summary} onApply={applyCoupon} onClear={clearCoupon} />
            <Link
              to="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 bg-neutral-950 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-neutral-800 shadow-sm hover:shadow-md rounded-none cursor-pointer"
            >
              Proceed to Checkout <ArrowRight size={14} />
            </Link>
            <p className="mt-3 text-center text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Secure SSL Checkout · 30-Day Returns</p>
          </OrderSummary>
        </div>
      </div>
    </div>
  )
}
