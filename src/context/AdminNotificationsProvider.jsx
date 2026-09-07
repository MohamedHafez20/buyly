import { useMemo } from 'react'
import { AdminNotificationsContext } from './adminNotificationsContext'
import { useAuth } from './useAuth'
import { useNotificationFeed } from '../lib/useNotificationFeed'
import {
  listAdminNotifications,
  getAdminUnreadCount,
  setAdminNotificationRead,
  markAllAdminNotificationsRead,
  deleteAdminNotification,
} from '../services/notifications'

// Provides the admin bell/badge feed across the dashboard. The management page
// runs its own filtered feed but calls this feed's refresh() after mutations so
// the header badge stays in sync.
export function AdminNotificationsProvider({ children }) {
  const { isAdmin } = useAuth()

  const api = useMemo(
    () => ({
      list: listAdminNotifications,
      unreadCount: getAdminUnreadCount,
      markRead: (id) => setAdminNotificationRead(id, true),
      markAllRead: markAllAdminNotificationsRead,
      remove: deleteAdminNotification,
    }),
    [],
  )

  const feed = useNotificationFeed({ enabled: isAdmin, api })

  return <AdminNotificationsContext.Provider value={feed}>{children}</AdminNotificationsContext.Provider>
}
