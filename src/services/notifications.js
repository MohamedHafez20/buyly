import { api } from '../lib/api'

// Build a query string, dropping empty / "all" values (mirrors services/admin.js).
const qs = (params = {}) => {
  const s = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') s.set(k, v)
  })
  const str = s.toString()
  return str ? `?${str}` : ''
}

// ------------------------------- user -------------------------------------
export const listMyNotifications = (params) =>
  api.get(`/notifications${qs(params)}`, { auth: true })

export const getMyUnreadCount = (opts) =>
  api.get('/notifications/unread-count', { auth: true, ...opts })

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`, {}, { auth: true })

export const markAllNotificationsRead = () =>
  api.patch('/notifications/read-all', {}, { auth: true })

export const deleteNotification = (id) =>
  api.del(`/notifications/${id}`, { auth: true })

// ------------------------------- admin ------------------------------------
export const listAdminNotifications = (params) =>
  api.get(`/admin/notifications${qs(params)}`, { auth: true })

export const getAdminUnreadCount = (opts) =>
  api.get('/admin/notifications/unread-count', { auth: true, ...opts })

export const getAdminNotificationStats = () =>
  api.get('/admin/notifications/stats', { auth: true })

export const setAdminNotificationRead = (id, isRead = true) =>
  api.patch(`/admin/notifications/${id}/read`, { isRead }, { auth: true })

export const markAllAdminNotificationsRead = () =>
  api.patch('/admin/notifications/read-all', {}, { auth: true })

export const deleteAdminNotification = (id) =>
  api.del(`/admin/notifications/${id}`, { auth: true })

export const sendCustomNotification = (payload) =>
  api.post('/admin/notifications/send', payload, { auth: true })
