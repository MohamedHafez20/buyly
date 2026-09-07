import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/useNotifications'
import { ErrorState } from '../components/States'
import { Spinner } from '../components/States'
import NotificationItem from '../components/notifications/NotificationItem'
import { Bell, Check } from '../components/icons'

export default function Notifications() {
  const {
    items, unread, loading, loadingMore, error, hasMore, total,
    isAuthenticated, refresh, loadMore, markRead, markAllRead, remove,
  } = useNotifications()
  const [tab, setTab] = useState('all')
  const navigate = useNavigate()

  // Load the latest feed when the page opens (also refreshes the shared badge).
  useEffect(() => {
    if (isAuthenticated) refresh()
  }, [isAuthenticated, refresh])

  const visible = useMemo(
    () => (tab === 'unread' ? items.filter((n) => !n.isRead) : items),
    [items, tab],
  )

  const activate = (n) => {
    markRead(n.id)
    if (n.actionUrl) navigate(n.actionUrl)
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-neutral-100 text-neutral-400"><Bell size={22} /></span>
        <h1 className="mt-5 text-2xl font-black uppercase tracking-tight text-neutral-900">Your notifications</h1>
        <p className="mt-2 text-sm font-medium text-neutral-500">Sign in to see order updates, offers, and announcements.</p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center justify-center bg-black px-8 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900">Notifications</h1>
          <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {unread > 0 ? `${unread} unread · ${total} total` : `${total} notification${total === 1 ? '' : 's'}`}
          </p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 border border-neutral-300 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black cursor-pointer"
          >
            <Check size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mt-5 flex items-center gap-6">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: `Unread${unread ? ` (${unread})` : ''}` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative pb-1.5 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
              tab === t.id ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {t.label}
            <span className={`absolute inset-x-0 -bottom-px h-px origin-center bg-neutral-900 transition-transform duration-300 ${tab === t.id ? 'scale-x-100' : 'scale-x-0'}`} />
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="mt-6">
        {loading && items.length === 0 ? (
          <div className="grid place-items-center py-24"><Spinner size={26} /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : visible.length === 0 ? (
          <div className="grid place-items-center border border-dashed border-neutral-200 py-24 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400"><Bell size={20} /></span>
            <p className="mt-4 text-sm font-extrabold uppercase tracking-widest text-neutral-900">
              {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="mt-1.5 text-xs font-medium text-neutral-400">
              {tab === 'unread' ? "You're all caught up." : 'Order updates and offers will show up here.'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200">
              {visible.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onClick={() => activate(n)}
                  onDelete={() => remove(n.id)}
                />
              ))}
            </div>

            {tab === 'all' && hasMore && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 border border-neutral-300 px-7 py-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black disabled:opacity-60 cursor-pointer"
                >
                  {loadingMore && <Spinner size={13} />}
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
