import { createContext } from 'react'

// Holds the signed-in user's notification feed (badge count, list, mutations).
// Provided by NotificationsProvider, consumed via useNotifications.
export const NotificationsContext = createContext(null)
