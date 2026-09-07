import { notificationMeta } from '../../lib/notificationMeta'
import { timeAgo } from '../../lib/format'
import { Trash } from '../icons'

// One notification card, shared by the navbar dropdown, the /notifications page,
// and the admin center. Unread items get a tinted background, a heavier title
// and a small dot — a subtle distinction that doesn't clutter the list.
//
// Props:
//   notification – the notification object
//   onClick      – activate (mark read + navigate); omit to render non-clickable
//   onDelete     – show a delete affordance when provided
//   onToggleRead – optional read/unread toggle (admin center)
export default function NotificationItem({ notification, onClick, onDelete, onToggleRead }) {
  const { Icon, chip } = notificationMeta(notification.type)
  const unread = !notification.isRead

  return (
    <div
      className={`group relative flex items-start gap-3 px-4 py-3.5 transition-colors ${
        unread ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'bg-white hover:bg-neutral-50'
      }`}
    >
      {/* Unread accent bar */}
      {unread && <span className="absolute inset-y-0 left-0 w-0.5 bg-indigo-500" />}

      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={`flex min-w-0 flex-1 items-start gap-3 text-left ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${chip}`}>
          <Icon size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className={`truncate text-sm ${unread ? 'font-bold text-neutral-900' : 'font-semibold text-neutral-700'}`}>
              {notification.title}
            </span>
            {unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />}
          </span>
          <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-neutral-500">
            {notification.message}
          </span>
          <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {timeAgo(notification.createdAt)}
          </span>
        </span>
      </button>

      {(onToggleRead || onDelete) && (
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          {onToggleRead && (
            <button
              type="button"
              onClick={onToggleRead}
              className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              title={unread ? 'Mark as read' : 'Mark as unread'}
            >
              {unread ? 'Read' : 'Unread'}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="grid h-7 w-7 place-items-center rounded-md text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600"
              title="Delete notification"
            >
              <Trash size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
