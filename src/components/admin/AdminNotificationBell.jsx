import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminNotifications } from '../../context/useAdminNotifications'
import { Bell, Check } from '../icons'
import { Spinner } from '../States'
import NotificationItem from '../notifications/NotificationItem'

// Admin header bell: unread badge + dropdown of the latest system notifications.
export default function AdminNotificationBell() {
  const { unread, items, loading, refresh, markRead, markAllRead } = useAdminNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) refresh()
  }

  const activate = (n) => {
    markRead(n.id)
    setOpen(false)
    if (n.actionUrl) navigate(n.actionUrl)
  }

  const latest = items.slice(0, 8)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative rounded-xl border border-neutral-200 bg-white p-2.5 text-neutral-500 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-black leading-none text-white ring-2 ring-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[22rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-neutral-900">Notifications</p>
              {unread > 0 && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black leading-none text-white">{unread} new</span>
              )}
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 transition hover:text-indigo-700"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[22rem] overflow-y-auto">
            {loading && latest.length === 0 ? (
              <div className="grid place-items-center py-12"><Spinner size={22} /></div>
            ) : latest.length === 0 ? (
              <div className="grid place-items-center px-6 py-12 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-neutral-100 text-neutral-400"><Bell size={18} /></span>
                <p className="mt-3 text-sm font-bold text-neutral-900">No notifications</p>
                <p className="mt-1 text-xs text-neutral-400">System activity will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {latest.map((n) => (
                  <NotificationItem key={n.id} notification={n} onClick={() => activate(n)} />
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => { setOpen(false); navigate('/admin/notifications') }}
            className="block w-full border-t border-neutral-100 bg-neutral-50/60 px-4 py-3 text-center text-xs font-bold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}
