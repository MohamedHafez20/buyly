import { useCallback } from 'react'
import { AdminNotificationsContext } from './adminNotificationsContext'
import { useAuth } from './useAuth'
import { useNotificationFeed } from '../lib/useNotificationFeed'
import { useNotificationSocket } from '../lib/useNotificationSocket'
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

  // Real-time push for the admin header badge/feed. Only admin-role notifications
  // belong in this inbox; the storefront provider handles the customer ones.
  const onNotification = useCallback(
    (n) => { if (n?.recipientRole === 'admin') feed.prepend(n) },
    [feed],
  )
  useNotificationSocket({ enabled: isAdmin, onNotification })

  return <AdminNotificationsContext.Provider value={feed}>{children}</AdminNotificationsContext.Provider>
}
