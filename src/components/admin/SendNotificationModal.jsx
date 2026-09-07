import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../context/useStore'
import { sendCustomNotification } from '../../services/notifications'
import { listUsers } from '../../services/admin'
import { SENDABLE_TYPES } from '../../lib/notificationMeta'
import { inputCls, primaryBtnCls, secondaryBtnCls } from './ui'
import { Spinner } from '../States'
import { Close, Megaphone, AlertTriangle } from '../icons'

const AUDIENCES = [
  { value: 'all', label: 'All customers', hint: 'Every customer account' },
  { value: 'user', label: 'A specific customer', hint: 'Pick one account' },
  { value: 'admins', label: 'All admins', hint: 'Fellow administrators' },
]

export default function SendNotificationModal({ open, onClose, onSent }) {
  const { notify } = useStore()
  const blank = useMemo(
    () => ({ audience: 'all', userId: '', type: 'announcement', title: '', message: '', actionUrl: '' }),
    [],
  )
  const [form, setForm] = useState(blank)
  const [users, setUsers] = useState([])
  const [sending, setSending] = useState(false)
  const [confirmAll, setConfirmAll] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Reset each time the modal opens — render-phase adjustment (not an effect) so
  // there is no cascading-render warning.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setForm(blank)
      setConfirmAll(false)
    }
  }

  // Load customers once, lazily, when the admin chooses to target one.
  useEffect(() => {
    if (open && form.audience === 'user' && users.length === 0) {
      listUsers().then((list) => setUsers(list.filter((u) => u.role === 'user'))).catch(() => {})
    }
  }, [open, form.audience, users.length])

  if (!open) return null

  const canSubmit =
    form.title.trim() &&
    form.message.trim() &&
    (form.audience !== 'user' || form.userId)

  const doSend = async () => {
    setSending(true)
    try {
      const res = await sendCustomNotification({
        audience: form.audience,
        userId: form.audience === 'user' ? form.userId : undefined,
        type: form.type,
        title: form.title.trim(),
        message: form.message.trim(),
        actionUrl: form.actionUrl.trim(),
      })
      notify(res.message || 'Notification sent')
      onSent?.()
      onClose()
    } catch (err) {
      notify(err.message || 'Could not send notification')
    } finally {
      setSending(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    // Broadcasts to every customer get a confirmation step.
    if (form.audience === 'all' && !confirmAll) {
      setConfirmAll(true)
      return
    }
    doSend()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" onClick={sending ? undefined : onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-50 text-indigo-600"><Megaphone size={17} /></span>
            <div>
              <h3 className="font-display text-base font-bold text-neutral-950">Send notification</h3>
              <p className="text-[11px] text-neutral-400">Compose and deliver a notification</p>
            </div>
          </div>
          <button onClick={onClose} disabled={sending} className="rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950">
            <Close size={18} />
          </button>
        </div>

        {confirmAll ? (
          <div className="p-5">
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle size={20} className="shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-bold text-amber-900">Send to every customer?</p>
                <p className="mt-1 text-xs text-amber-800">
                  This delivers “{form.title.trim()}” to all customer accounts. This can’t be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => setConfirmAll(false)} disabled={sending} className={secondaryBtnCls}>Back</button>
              <button onClick={doSend} disabled={sending} className={primaryBtnCls}>
                {sending && <Spinner size={13} className="border-white/40 border-t-white" />}
                Yes, send to all
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Audience</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {AUDIENCES.map((a) => (
                  <button
                    type="button"
                    key={a.value}
                    onClick={() => setForm((f) => ({ ...f, audience: a.value }))}
                    className={`rounded-lg border px-3 py-2.5 text-left transition ${
                      form.audience === a.value
                        ? 'border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-500/15'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span className="block text-xs font-bold text-neutral-900">{a.label}</span>
                    <span className="mt-0.5 block text-[10px] text-neutral-400">{a.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {form.audience === 'user' && (
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Customer</label>
                <select value={form.userId} onChange={set('userId')} className={inputCls}>
                  <option value="">Select a customer…</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Type</label>
                <select value={form.type} onChange={set('type')} className={inputCls}>
                  {SENDABLE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Action link (optional)</label>
                <input value={form.actionUrl} onChange={set('actionUrl')} placeholder="/shop?sort=discount" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Title</label>
              <input value={form.title} onChange={set('title')} placeholder="e.g. Weekend flash sale" className={inputCls} maxLength={120} />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Message</label>
              <textarea value={form.message} onChange={set('message')} rows={3} placeholder="Write the notification message…" className={inputCls} maxLength={500} />
            </div>

            <div className="flex justify-end gap-2.5 border-t border-neutral-100 pt-4">
              <button type="button" onClick={onClose} disabled={sending} className={secondaryBtnCls}>Cancel</button>
              <button type="submit" disabled={!canSubmit || sending} className={primaryBtnCls}>
                {sending && <Spinner size={13} className="border-white/40 border-t-white" />}
                {form.audience === 'all' ? 'Continue' : 'Send notification'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
