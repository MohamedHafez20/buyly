import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/useNotifications'
import { Bell, Check } from './icons'
import { Spinner } from './States'
import NotificationItem from './notifications/NotificationItem'

// Storefront navbar bell: unread badge + dropdown of the latest notifications.
// Opening the dropdown refreshes the feed; clicking a card marks it read and
// navigates to its action URL. Hidden entirely for signed-out visitors.
export default function NotificationBell() {
  const { unread, items, loading, isAuthenticated, refresh, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  // Close on outside click / Escape.
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

  if (!isAuthenticated) return null

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
        className="relative grid h-9 w-9 place-items-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black sm:h-10 sm:w-10 cursor-pointer"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[8px] font-black leading-none text-white ring-2 ring-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[22rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-neutral-950">Notifications</p>
              {unread > 0 && (
                <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-black leading-none text-white">{unread} new</span>
              )}
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 transition-colors hover:text-indigo-700 cursor-pointer"
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
                <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-neutral-900">You're all caught up</p>
                <p className="mt-1 text-[11px] font-medium text-neutral-400">New notifications will appear here.</p>
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
            onClick={() => { setOpen(false); navigate('/notifications') }}
            className="block w-full border-t border-neutral-100 bg-neutral-50/60 px-4 py-3 text-center text-[10px] font-extrabold uppercase tracking-widest text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black cursor-pointer"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}
