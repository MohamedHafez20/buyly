// Helpers for "buy N for a fixed price" bundle offers.

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

// Validate one tier against the base price. Returns an error string or null.
// Mirrors the authoritative server-side rules so the admin gets instant feedback.
export const tierError = (tier, basePrice) => {
  const qty = Number(tier.quantity)
  if (!Number.isInteger(qty) || qty < 2) return 'Quantity must be a whole number ≥ 2'
  const price = Number(tier.bundlePrice)
  if (!Number.isFinite(price) || price <= 0) return 'Price must be greater than 0'
  const full = round2(Number(basePrice || 0) * qty)
  if (!full) return 'Set a base price first'
  if (price >= full) return `Must be less than ${full} (${qty} × base)`
  return null
}

// Shape editor rows into the payload the API expects. Drops blank rows; keeps
// each tier's id so the server preserves stable tier ids across edits.
export const cleanBundleOffers = (offers) =>
  (offers || [])
    .filter((t) => String(t.quantity).trim() !== '' || String(t.bundlePrice).trim() !== '')
    .map((t) => ({
      ...(t.id ? { _id: t.id } : {}),
      quantity: Number(t.quantity),
      bundlePrice: Number(t.bundlePrice),
      label: (t.label || '').trim(),
      active: t.active !== false,
    }))

// The active tiers a shopper may choose from (used by the storefront in Phase 4).
export const activeTiers = (product) =>
  (product?.bundleOffers || []).filter((t) => t.active !== false)
