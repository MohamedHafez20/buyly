// Adapters that map raw backend documents onto the shape the existing UI
// components already expect (id, images[], category as an id, etc.). Keeping this
// in one place means the components never had to change their prop contracts.

// A product color is always exposed to the UI as { name, hex, image }. Legacy
// products stored colors as plain name strings — those become
// { name, hex: '', image: '' } and the storefront falls back to a named-swatch
// class for them. `image` is optional; when set, selecting the swatch shows it.
export function normalizeColor(c) {
  if (typeof c === 'string') return { name: c, hex: '', image: '' }
  if (c && typeof c === 'object') return { name: c.name || '', hex: c.hex || '', image: c.image || '' }
  return { name: '', hex: '', image: '' }
}

export function normalizeProduct(p) {
  if (!p) return null
  const images = p.images && p.images.length ? p.images : p.image ? [p.image] : []
  const category = p.category && typeof p.category === 'object' ? p.category : null
  return {
    ...p,
    id: p._id || p.id,
    images,
    // Filtering / links use the category id; display uses categoryName.
    category: category ? category._id : p.category,
    categoryName: category ? category.name : p.categoryName || '',
    categorySlug: category ? category.slug : p.categorySlug || '',
    price: p.price ?? 0,
    oldPrice: p.oldPrice || null,
    rating: p.rating ?? 0,
    reviews: p.reviews ?? 0,
    colors: (p.colors || []).map(normalizeColor).filter((c) => c.name),
    sizes: p.sizes || [],
    variants: (p.variants || []).map((v) => ({
      sku: v.sku || '',
      color: v.color || '',
      size: v.size || '',
      stock: Number(v.stock) || 0,
    })),
    bundleOffers: (p.bundleOffers || []).map((b) => ({
      id: b._id || b.id,
      quantity: b.quantity,
      bundlePrice: b.bundlePrice,
      label: b.label || '',
      active: b.active !== false,
    })),
    features: p.features || [],
    badge: p.badge || null,
  }
}

export function normalizeCategory(c) {
  if (!c) return null
  return {
    ...c,
    id: c._id || c.id,
    productCount: c.productCount ?? 0,
  }
}
