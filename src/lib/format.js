export const currency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export const discountPct = (price, oldPrice) =>
  oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0
