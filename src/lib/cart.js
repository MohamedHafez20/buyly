// Turn stored cart lines into totals. Each line already carries a product
// snapshot (name/price/image/slug) captured at add-to-cart time, so the cart
// renders instantly and offline without re-fetching. The backend independently
// re-prices every line from the database when the order is actually placed.
export function hydrateCart(cart) {
  const items = cart.map((line) => ({
    ...line,
    lineTotal: +(line.price * line.qty).toFixed(2),
  }))

  const subtotal = +items.reduce((s, i) => s + i.lineTotal, 0).toFixed(2)
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 6.99
  const tax = +(subtotal * 0.08).toFixed(2)
  const total = +(subtotal + shipping + tax).toFixed(2)

  return { items, subtotal, shipping, tax, total, freeShippingGap: Math.max(0, 75 - subtotal) }
}
