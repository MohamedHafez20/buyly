import { useMemo, useState } from 'react'
import { useStore } from '../context/useStore'
import { currency } from '../lib/format'
import { activeTiers } from '../lib/bundles'
import { swatchProps, colorName } from '../lib/colorSwatch'
import { Cart, Check } from './icons'

// Storefront bundle selector: pick a "buy N for a fixed price" tier, then choose
// an in-stock color + size for every piece. Adds the whole thing as one cart line.
export default function BundlePicker({ product }) {
  const { addBundleToCart, notify } = useStore()
  const tiers = activeTiers(product)
  const [selectedId, setSelectedId] = useState(null)
  const [pieces, setPieces] = useState([])
  const [adding, setAdding] = useState(false)

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
  const variantFor = (c, s) => (product.variants || []).find((v) => v.color === c && v.size === s)
  const stockFor = (c, s) => variantFor(c, s)?.stock ?? 0
  const colorHasStock = (c) => (product.sizes || []).some((s) => stockFor(c, s) > 0)
  const firstInStock = () => {
    const v = (product.variants || []).find((x) => x.stock > 0)
    return v ? { color: v.color, size: v.size } : { color: colorName(product.colors?.[0]) || '', size: product.sizes?.[0] || '' }
  }

  const tier = tiers.find((t) => t.id === selectedId) || null

  const selectTier = (t) => {
    setSelectedId(t.id)
    const seed = hasVariants ? firstInStock() : { color: '', size: '' }
    setPieces(Array.from({ length: t.quantity }, () => ({ ...seed })))
  }

  const setPiece = (index, patch) => {
    setPieces((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p
        const next = { ...p, ...patch }
        // Snap size to an in-stock one if the chosen color can't offer it.
        if (hasVariants && patch.color && stockFor(patch.color, next.size) <= 0) {
          next.size = (product.sizes || []).find((s) => stockFor(patch.color, s) > 0) || ''
        }
        return next
      }),
    )
  }

  // Validate every piece resolves to stock, honoring aggregate demand per SKU.
  const validity = useMemo(() => {
    if (!tier) return { ok: false }
    if (!hasVariants) {
      return { ok: product.stock >= tier.quantity, resolved: pieces.map(() => ({ color: '', size: '', sku: '' })) }
    }
    const demand = new Map()
    const resolved = []
    for (const p of pieces) {
      const v = variantFor(p.color, p.size)
      if (!v || v.stock <= 0) return { ok: false }
      demand.set(v.sku, (demand.get(v.sku) || 0) + 1)
      resolved.push({ color: v.color, size: v.size, sku: v.sku })
    }
    for (const [sku, count] of demand) {
      const v = (product.variants || []).find((x) => x.sku === sku)
      if (!v || v.stock < count) return { ok: false, over: true }
    }
    return { ok: true, resolved }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, pieces, product])

  const addBundle = async () => {
    if (!tier || !validity.ok || adding) return
    setAdding(true)
    try {
      // Authoritative recheck against live inventory before committing.
      const { getCartSummary } = await import('../services/cart')
      const summary = await getCartSummary([
        { product: product.id, quantity: 1, uid: 'preview', bundleTierId: tier.id, pieces: validity.resolved },
      ])
      const line = summary.items?.[0]
      if (!line || !line.available) {
        notify('That bundle just went out of stock — adjust your picks')
        setAdding(false)
        return
      }
      addBundleToCart(product, tier, validity.resolved)
      setSelectedId(null)
      setPieces([])
    } catch {
      notify('Could not add the bundle — please try again')
    } finally {
      setAdding(false)
    }
  }

  if (tiers.length === 0) return null

  return (
    <div className="mt-8 border border-neutral-200 bg-neutral-50/60 p-5">
      <h3 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-neutral-900">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-black text-[10px] text-white">%</span>
        Bundle &amp; Save
      </h3>

      {/* Tier cards */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {tiers.map((t) => {
          const full = product.price * t.quantity
          const save = Math.max(0, full - t.bundlePrice)
          const active = t.id === selectedId
          return (
            <button
              key={t.id}
              onClick={() => selectTier(t)}
              className={`relative flex flex-col items-start border p-3 text-left transition-all ${
                active ? 'border-black bg-white ring-1 ring-black' : 'border-neutral-200 bg-white hover:border-neutral-400'
              }`}
            >
              {t.label && (
                <span className="absolute right-2 top-2 bg-black px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">{t.label}</span>
              )}
              <span className="text-xs font-extrabold uppercase tracking-wide text-neutral-900">Buy {t.quantity}</span>
              <span className="mt-1 text-sm font-black text-neutral-900">{currency(t.bundlePrice)}</span>
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">Save {currency(save)}</span>
              {active && <Check size={14} className="absolute bottom-2 right-2 text-black" />}
            </button>
          )
        })}
      </div>

      {/* Piece selectors */}
      {tier && (
        <div className="mt-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Choose {tier.quantity} piece{tier.quantity > 1 ? 's' : ''}
          </p>

          {hasVariants ? (
            pieces.map((piece, i) => {
              const pv = variantFor(piece.color, piece.size)
              return (
                <div key={i} className="border border-neutral-200 bg-white p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-900">Piece {i + 1}</p>
                  {/* colors */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {product.colors.map((c) => {
                      const name = colorName(c)
                      const sw = swatchProps(c)
                      const soldOut = !colorHasStock(name)
                      const on = piece.color === name
                      return (
                        <button
                          key={name}
                          type="button"
                          disabled={soldOut}
                          onClick={() => setPiece(i, { color: name })}
                          style={sw.style}
                          aria-label={name}
                          className={`h-6 w-6 rounded-full border transition-all ${sw.className} ${
                            on ? 'ring-2 ring-black ring-offset-1' : 'opacity-80 hover:opacity-100'
                          } ${soldOut ? 'opacity-25 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                          title={soldOut ? `${name} — out of stock` : name}
                        />
                      )
                    })}
                  </div>
                  {/* sizes */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {product.sizes.map((s) => {
                      const soldOut = stockFor(piece.color, s) <= 0
                      const on = piece.size === s
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={soldOut}
                          onClick={() => setPiece(i, { size: s })}
                          className={`min-w-[2.25rem] border px-2 py-1 text-[10px] font-bold uppercase transition-all ${
                            on ? 'border-black bg-black text-white'
                              : soldOut ? 'border-neutral-200 bg-neutral-50 text-neutral-300 line-through cursor-not-allowed'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:border-black cursor-pointer'
                          }`}
                          title={soldOut ? `${s} — out of stock` : s}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                  <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                    {pv && pv.stock > 0 ? `${piece.color} · ${piece.size}` : <span className="text-rose-600">Pick an available color &amp; size</span>}
                  </p>
                </div>
              )
            })
          ) : (
            <p className="text-[11px] font-semibold text-neutral-500">
              {product.stock >= tier.quantity ? `${tier.quantity} pieces will be added.` : `Only ${product.stock} in stock.`}
            </p>
          )}

          {validity.over && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
              You picked the same variant more times than its stock allows.
            </p>
          )}

          <button
            type="button"
            onClick={addBundle}
            disabled={!validity.ok || adding}
            className="flex w-full items-center justify-center gap-2 bg-black py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Cart size={14} /> {adding ? 'Checking stock…' : `Add bundle · ${currency(tier.bundlePrice)}`}
          </button>
        </div>
      )}
    </div>
  )
}
