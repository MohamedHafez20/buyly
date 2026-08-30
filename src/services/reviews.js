import { api } from '../lib/api'

const qs = (params = {}) => {
  const s = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      s.set(key, value)
    }
  })
  const str = s.toString()
  return str ? `?${str}` : ''
}

// Public: Fetch approved reviews for a single product
export const listProductReviews = (productId) =>
  api.get(`/products/${productId}/reviews`)

// Auth: Post a review for a product
export const createProductReview = (productId, payload) =>
  api.post(`/products/${productId}/reviews`, payload, { auth: true })

// Auth: Edit own review
export const updateProductReview = (reviewId, payload) =>
  api.patch(`/reviews/${reviewId}`, payload, { auth: true })

// Auth: Delete own review
export const deleteUserReview = (reviewId) =>
  api.del(`/reviews/${reviewId}`, { auth: true })

// Admin: List all reviews (can filter by status/product)
export const listAllReviews = (params) =>
  api.get(`/admin/reviews${qs(params)}`, { auth: true })

// Admin: Moderate review (status: 'approved' | 'rejected')
export const moderateReview = (reviewId, status) =>
  api.patch(`/admin/reviews/${reviewId}`, { status }, { auth: true })

// Admin: Delete any review
export const deleteAdminReview = (reviewId) =>
  api.del(`/admin/reviews/${reviewId}`, { auth: true })
