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

export const getStats = (params) => api.get(`/admin/stats${qs(params)}`, { auth: true })

export const listUsers = () => api.get('/admin/users', { auth: true })

export const updateUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role }, { auth: true })

export const deleteUser = (id) => api.del(`/admin/users/${id}`, { auth: true })
