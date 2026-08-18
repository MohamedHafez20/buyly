// Adapters that map raw backend documents onto the shape the existing UI
// components already expect (id, images[], category as an id, etc.). Keeping this
// in one place means the components never had to change their prop contracts.

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
    colors: p.colors || [],
    sizes: p.sizes || [],
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
