import { products } from '../data/products'

// Turn stored [{id, qty}] into full line items + order totals.
export function hydrateCart(cart) {
  const items = cart
    .map((line) => {
      const product = products.find((p) => p.id === line.id)
      return product ? { ...product, qty: line.qty, lineTotal: product.price * line.qty } : null
    })
    .filter(Boolean)

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 6.99
  const tax = +(subtotal * 0.08).toFixed(2)
  const total = +(subtotal + shipping + tax).toFixed(2)

  return { items, subtotal, shipping, tax, total, freeShippingGap: Math.max(0, 75 - subtotal) }
}
