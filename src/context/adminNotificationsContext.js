import { createContext } from 'react'

// Holds the admin's notification feed for the dashboard header bell + badge.
// Provided by AdminNotificationsProvider, consumed via useAdminNotifications.
export const AdminNotificationsContext = createContext(null)
