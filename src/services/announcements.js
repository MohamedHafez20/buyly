import { api } from '../lib/api'

// Public — only currently-active bars (backend filters by isActive + date range).
export const listActiveAnnouncements = () => api.get('/announcements')

// --- admin ---
export const listAllAnnouncements = () => api.get('/announcements/all', { auth: true })

export const createAnnouncement = (payload) =>
  api.post('/announcements', payload, { auth: true })

export const updateAnnouncement = (id, payload) =>
  api.patch(`/announcements/${id}`, payload, { auth: true })

export const deleteAnnouncement = (id) =>
  api.del(`/announcements/${id}`, { auth: true })

// Persist a new order — body is an array of bar ids in the desired order.
export const reorderAnnouncements = (order) =>
  api.patch('/announcements/reorder', { order }, { auth: true })
