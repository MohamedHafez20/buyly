import { AlertTriangle } from '../icons'
import { Spinner } from '../States'
import { secondaryBtnCls } from './ui'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy = false, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-neutral-950/35 backdrop-blur-sm" onClick={busy ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-2xl">
        <div className="flex gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-rose-50 text-rose-600">
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold text-neutral-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-500">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={onCancel} disabled={busy} className={secondaryBtnCls}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {busy && <Spinner size={13} className="border-white/40 border-t-white" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
