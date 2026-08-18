import { api } from '../lib/api'
import { normalizeProduct } from '../lib/normalize'

const qs = (params = {}) => {
  const s = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') s.set(k, v)
  })
  const str = s.toString()
  return str ? `?${str}` : ''
}

export const listProducts = async (params, opts) => {
  const data = await api.get(`/products${qs(params)}`, opts)
  return data.map(normalizeProduct)
}

export const getProductBySlug = async (slugOrId, opts) => {
  const data = await api.get(`/products/${slugOrId}`, opts)
  return normalizeProduct(data)
}

export const createProduct = async (payload) => {
  const data = await api.post('/products', payload, { auth: true })
  return normalizeProduct(data)
}

export const updateProduct = async (id, payload) => {
  const data = await api.patch(`/products/${id}`, payload, { auth: true })
  return normalizeProduct(data)
}

export const deleteProduct = (id) => api.del(`/products/${id}`, { auth: true })
