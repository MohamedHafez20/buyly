import { useMemo } from 'react'
import { NotificationsContext } from './notificationsContext'
import { useAuth } from './useAuth'
import { useNotificationFeed } from '../lib/useNotificationFeed'
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

  const value = useMemo(() => ({ ...feed, isAuthenticated }), [feed, isAuthenticated])

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}
