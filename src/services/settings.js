import { api } from '../lib/api'

// Public store configuration (name, currency, pricing rules, payment methods).
export const getSettings = () => api.get('/settings')

// --- admin ---
export const getAdminSettings = () => api.get('/admin/settings', { auth: true })

export const updateSettings = (payload) =>
  api.patch('/admin/settings', payload, { auth: true })
