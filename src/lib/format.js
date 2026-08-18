export const currency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export const discountPct = (price, oldPrice) =>
  oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0

export const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Short order reference derived from the Mongo _id (e.g. "BLY-A1B2C3").
export const orderRef = (id = '') => `BLY-${String(id).slice(-6).toUpperCase()}`
