import { useCallback, useMemo } from 'react'
import { NotificationsContext } from './notificationsContext'
import { useAuth } from './useAuth'
import { useNotificationFeed } from '../lib/useNotificationFeed'
import { useNotificationSocket } from '../lib/useNotificationSocket'
import {
  listMyNotifications,
  getMyUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../services/notifications'

// Wraps the storefront so the navbar bell and the /notifications page share one
// live feed for the signed-in user. Idle (empty, no polling) when signed out.
export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth()

  const api = useMemo(
    () => ({
      list: listMyNotifications,
      unreadCount: getMyUnreadCount,
      markRead: markNotificationRead,
      markAllRead: markAllNotificationsRead,
      remove: deleteNotification,
    }),
    [],
  )

  const feed = useNotificationFeed({ enabled: isAuthenticated, api })

  // Real-time push: drop incoming customer notifications straight into the feed.
  // (An admin's socket also carries admin-role notifications — ignore those here;
  // the admin provider handles them.)
  const onNotification = useCallback(
    (n) => { if (n?.recipientRole !== 'admin') feed.prepend(n) },
    [feed],
  )
  useNotificationSocket({ enabled: isAuthenticated, onNotification })

  const value = useMemo(() => ({ ...feed, isAuthenticated }), [feed, isAuthenticated])

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}
