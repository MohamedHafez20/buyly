import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminNotifications } from '../../context/useAdminNotifications'
import { useNotificationFeed } from '../../lib/useNotificationFeed'
import {
  listAdminNotifications,
  getAdminUnreadCount,
  getAdminNotificationStats,
  setAdminNotificationRead,
  markAllAdminNotificationsRead,
  deleteAdminNotification,
} from '../../services/notifications'
import { notificationMeta } from '../../lib/notificationMeta'
import { PageHeader, Card, inputCls, primaryBtnCls, secondaryBtnCls } from '../../components/admin/ui'
import { ErrorState, Spinner } from '../../components/States'
import NotificationItem from '../../components/notifications/NotificationItem'
import SendNotificationModal from '../../components/admin/SendNotificationModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Bell, Check, Megaphone, Filter } from '../../components/icons'

// Admin-relevant types offered in the filter dropdown.
const TYPE_FILTERS = [
  'admin_new_order', 'admin_new_user', 'admin_order_cancelled', 'admin_payment_issue',
  'admin_low_stock', 'admin_out_of_stock', 'admin_review', 'admin_contact', 'admin_system',
  'announcement', 'promotion', 'price_offer', 'custom',
]

function StatCard({ label, value, tone = 'neutral' }) {
  const tones = {
    neutral: 'text-neutral-900',
    indigo: 'text-indigo-600',
    rose: 'text-rose-600',
    emerald: 'text-emerald-600',
  }
  return (
    <Card className="p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
      <p className={`mt-1.5 font-display text-2xl font-bold ${tones[tone]}`}>{value}</p>
    </Card>
  )
}

export default function AdminNotifications() {
  const ctx = useAdminNotifications() // shared header badge feed
  const navigate = useNavigate()

  const [type, setType] = useState('all')
  const [read, setRead] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState(null)
  const [sendOpen, setSendOpen] = useState(false)
  const [target, setTarget] = useState(null) // pending delete
  const [deleting, setDeleting] = useState(false)

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const params = useMemo(() => ({ type, read, search }), [type, read, search])

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

  const feed = useNotificationFeed({ api, params })

  const loadStats = useCallback(() => {
    getAdminNotificationStats().then(setStats).catch(() => {})
  }, [])

  // Refetch the table whenever a filter changes (and on mount); refresh stats too.
  useEffect(() => {
    feed.refresh()
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, read, search])

  // Keep the header badge + stats in sync after any mutation.
  const syncBadge = useCallback(() => { ctx.refresh(); loadStats() }, [ctx, loadStats])

  const activate = (n) => {
    feed.markRead(n.id)
    syncBadge()
    if (n.actionUrl) navigate(n.actionUrl)
  }

  const toggleRead = async (n) => {
    feed.setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: !x.isRead } : x)))
    try {
      await setAdminNotificationRead(n.id, !n.isRead)
    } catch {
      feed.refresh()
    }
    syncBadge()
  }

  const confirmDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await feed.remove(target.id)
      setTarget(null)
      syncBadge()
    } finally {
      setDeleting(false)
    }
  }

  const markAll = () => { feed.markAllRead(); syncBadge() }

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="System activity, alerts, and custom messages">
        <button onClick={markAll} disabled={!feed.unread} className={secondaryBtnCls}>
          <Check size={15} /> Mark all read
        </button>
        <button onClick={() => setSendOpen(true)} className={primaryBtnCls}>
          <Megaphone size={15} /> Send notification
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={stats ? stats.total : '—'} />
        <StatCard label="Unread" value={stats ? stats.unread : '—'} tone="rose" />
        <StatCard label="Read" value={stats ? stats.read : '—'} tone="emerald" />
        <StatCard label="Live badge" value={feed.unread} tone="indigo" />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_170px]">
          <label className="relative">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Search</span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title or message…"
              className={inputCls}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              <option value="all">All types</option>
              {TYPE_FILTERS.map((t) => (
                <option key={t} value={t}>{notificationMeta(t).label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</span>
            <select value={read} onChange={(e) => setRead(e.target.value)} className={inputCls}>
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </label>
        </div>
      </Card>

      {/* List */}
      {feed.loading && feed.items.length === 0 ? (
        <div className="grid place-items-center py-24"><Spinner size={26} /></div>
      ) : feed.error ? (
        <ErrorState message={feed.error} onRetry={feed.refresh} />
      ) : feed.items.length === 0 ? (
        <Card className="grid place-items-center py-20 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400"><Bell size={20} /></span>
          <p className="mt-4 text-sm font-bold text-neutral-900">No notifications found</p>
          <p className="mt-1 text-xs text-neutral-400">
            {type !== 'all' || read !== 'all' || search ? 'Try adjusting your filters.' : 'System activity will appear here.'}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-neutral-100 bg-neutral-50/60 px-4 py-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <Filter size={12} /> {feed.total} result{feed.total === 1 ? '' : 's'}
          </div>
          <div className="divide-y divide-neutral-100">
            {feed.items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => activate(n)}
                onToggleRead={() => toggleRead(n)}
                onDelete={() => setTarget(n)}
              />
            ))}
          </div>
          {feed.hasMore && (
            <div className="border-t border-neutral-100 p-4 text-center">
              <button onClick={feed.loadMore} disabled={feed.loadingMore} className={secondaryBtnCls}>
                {feed.loadingMore && <Spinner size={13} />}
                Load more
              </button>
            </div>
          )}
        </Card>
      )}

      <SendNotificationModal open={sendOpen} onClose={() => setSendOpen(false)} onSent={syncBadge} />
      <ConfirmDialog
        open={Boolean(target)}
        title="Delete notification"
        message="This notification will be permanently removed from your inbox."
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => (deleting ? null : setTarget(null))}
      />
    </div>
  )
}
