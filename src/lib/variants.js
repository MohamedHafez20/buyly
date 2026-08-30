// Helpers for per-variant (color x size) inventory.

// Derive the full color x size grid from a product's colors ([{ name }]) and
// sizes ([string]).
export const buildCombos = (colors, sizes) =>
  colors.flatMap((c) => sizes.map((s) => ({ color: c.name, size: s })))

// Reconcile a variants array against the current colors/sizes: keep only combos
// that still exist, preserve their stock, and add missing combos at 0. Used on
// submit so removing a color/size cleanly drops its variants.
export const reconcileVariants = (colors, sizes, variants) => {
  const map = new Map((variants || []).map((v) => [`${v.color}|${v.size}`, v]))
  return buildCombos(colors, sizes).map((cb) => ({
    color: cb.color,
    size: cb.size,
    stock: map.get(`${cb.color}|${cb.size}`)?.stock ?? 0,
  }))
}

// Find the variant matching a color+size (exact match), or null.
export const findVariant = (variants, color, size) =>
  (variants || []).find((v) => v.color === color && v.size === size) || null
