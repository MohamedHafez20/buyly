import { api } from '../lib/api'

// Coupons are validated and applied entirely by the backend (via the cart
// summary). These endpoints are admin-only management.
export const listCoupons = () => api.get('/admin/coupons', { auth: true })

export const createCoupon = (payload) =>
  api.post('/admin/coupons', payload, { auth: true })

export const updateCoupon = (id, payload) =>
  api.patch(`/admin/coupons/${id}`, payload, { auth: true })

export const deleteCoupon = (id) => api.del(`/admin/coupons/${id}`, { auth: true })
