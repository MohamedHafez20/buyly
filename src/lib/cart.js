import { useMemo } from 'react'
import { getCartSummary } from '../services/cart'
import { useResource } from './useResource'

// A cart line is identified by product + selected variant (color + size), so the
// same product in two variants is two distinct lines. Works for both client
// lines ({ id }) and server-priced lines ({ product }); missing variant fields
// collapse to the plain product line, keeping non-variant products unchanged.
export const lineKey = (line) =>
  line.uid
    ? `bundle::${line.uid}`
    : `${line.id ?? line.product ?? ''}::${line.color ?? ''}::${line.size ?? ''}`

// Pricing lives entirely on the backend. This hook takes the client's local
// cart lines, asks the server to price them, and returns the authoritative
// summary (subtotal, shipping, tax, total, per-line availability). The frontend
// performs NO money math of its own — it only renders what the server returns.
//
// It builds on useResource, so a refetch keeps the previous summary visible
// (no flicker) until the new one resolves.
export function useCartSummary(cart, couponCode = '', country = '') {
  const items = useMemo(
    () => cart.map((i) =>
      i.bundleTierId
        ? { product: i.id, quantity: 1, uid: i.uid, bundleTierId: i.bundleTierId, pieces: i.pieces || [] }
        : { product: i.id, quantity: i.qty, color: i.color || '', size: i.size || '', sku: i.sku || '' },
    ),
    [cart],
  )
  // A stable signature so we only refetch when the cart, coupon, or country changes.
  const signature = useMemo(
    () => JSON.stringify({ items, couponCode, country }),
    [items, couponCode, country],
  )

  const { data: summary, loading, error } = useResource(
    () => getCartSummary(items, couponCode, country),
    [signature],
  )

  return { summary, loading, error }
}
