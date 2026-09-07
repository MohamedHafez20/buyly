import { useContext } from 'react'
import { AdminNotificationsContext } from './adminNotificationsContext'

export const useAdminNotifications = () => {
  const ctx = useContext(AdminNotificationsContext)
  if (!ctx) throw new Error('useAdminNotifications must be used within AdminNotificationsProvider')
  return ctx
}
