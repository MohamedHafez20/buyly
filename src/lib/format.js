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

// Compact relative time such as "just now", "5m ago", "3h ago", "2d ago".
// Falls back to an absolute date once a notification is older than a week.
export const timeAgo = (value) => {
  if (!value) return ''
  const d = new Date(value)
  const ms = d.getTime()
  if (Number.isNaN(ms)) return ''
  const secs = Math.round((Date.now() - ms) / 1000)
  if (secs < 45) return 'just now'
  const mins = Math.round(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(value)
}
