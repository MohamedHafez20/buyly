import { api } from '../lib/api'

// items: [{ product: <id>, quantity: <n> }]
export const createOrder = (payload) => api.post('/orders', payload, { auth: true })

export const listMyOrders = () => api.get('/orders/my', { auth: true })

export const getOrder = (id) => api.get(`/orders/${id}`, { auth: true })

// --- admin ---
export const listAllOrders = () => api.get('/admin/orders', { auth: true })

export const updateOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status }, { auth: true })
