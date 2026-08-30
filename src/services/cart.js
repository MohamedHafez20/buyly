import { api } from '../lib/api'

// The backend is the single source of truth for cart pricing. The client sends
// a plain list of { product, quantity } lines and always renders the priced
// summary that comes back — it never computes subtotals, shipping, tax or total.

// Public — price an arbitrary item list, optionally with a coupon code
// (works for guests, no auth needed).
export const getCartSummary = (items, couponCode = '', country = '') =>
  api.post('/cart/summary', { items, couponCode, country })

// --- authenticated persistent cart (survives across devices/sessions) ---

export const getServerCart = () => api.get('/cart', { auth: true })

// Idempotent write-through: replace the server cart with the given lines.
export const replaceServerCart = (items) =>
  api.put('/cart', { items }, { auth: true })

// Union-merge a guest's local cart into the server cart on login.
export const mergeServerCart = (items) =>
  api.post('/cart/merge', { items }, { auth: true })
