import { api } from '../lib/api'

// Fetch the inventory adjustment log history (admin-only)
export const listInventoryHistory = () =>
  api.get('/admin/inventory/history', { auth: true })

// Adjust stock levels manually (admin-only)
// payload: { productId, quantity, type, reason }
export const adjustInventory = (payload) =>
  api.post('/admin/inventory/adjust', payload, { auth: true })
