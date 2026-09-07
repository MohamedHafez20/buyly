import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { API_ORIGIN, getToken } from './api'

// Opens one authenticated Socket.IO connection while `enabled` and invokes
// onNotification(n) for every pushed notification. This is additive to the
// feed's polling: if the socket can't connect (server down, host without
// websocket support) the app simply falls back to the existing 45s poll.
//
// onNotification is held in a ref so passing a fresh inline callback each render
// never tears down and reopens the socket — it only reconnects when `enabled`
// (i.e. auth) actually changes.
export function useNotificationSocket({ enabled, onNotification }) {
  const cbRef = useRef(onNotification)
  useEffect(() => {
    cbRef.current = onNotification
  }, [onNotification])

  useEffect(() => {
    if (!enabled) return undefined
    const token = getToken()
    if (!token) return undefined

    const socket = io(API_ORIGIN, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    })

    const handler = (n) => cbRef.current?.(n)
    socket.on('notification', handler)

    return () => {
      socket.off('notification', handler)
      socket.disconnect()
    }
  }, [enabled])
}
