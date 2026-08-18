import { api } from '../lib/api'
import { normalizeCategory } from '../lib/normalize'

export const listCategories = async (opts) => {
  const data = await api.get('/categories', opts)
  return data.map(normalizeCategory)
}

export const createCategory = async (payload) => {
  const data = await api.post('/categories', payload, { auth: true })
  return normalizeCategory(data)
}

export const updateCategory = async (id, payload) => {
  const data = await api.patch(`/categories/${id}`, payload, { auth: true })
  return normalizeCategory(data)
}

export const deleteCategory = (id) => api.del(`/categories/${id}`, { auth: true })
