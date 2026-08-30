import { useState } from 'react'
import { useStore } from '../../context/useStore'
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../services/coupons'
import { useResource } from '../../lib/useResource'
import { currency, formatDate } from '../../lib/format'
import { LoadingState, ErrorState, Spinner } from '../../components/States'
import { PageHeader, Card, StatusBadge, inputCls, primaryBtnCls } from '../../components/admin/ui'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Pencil, Trash, Save, Close } from '../../components/icons'

const blank = {
  code: '', type: 'percent', value: 10, active: true,
  expiresAt: '', minSubtotal: 0, usageLimit: '', perUserLimit: '',
}

// Backend stores null for "unlimited"; the form uses '' for empty inputs.
const toForm = (c) => ({
  code: c.code,
  type: c.type,
  value: c.value,
  active: c.active,
  expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
  minSubtotal: c.minSubtotal ?? 0,
  usageLimit: c.usageLimit ?? '',
  perUserLimit: c.perUserLimit ?? '',
})

export default function AdminCoupons() {
  const { notify } = useStore()
  const { data, loading, error, reload } = useResource(() => listCoupons())
  const coupons = data || []

  const [editing, setEditing] = useState(null) // id | 'new' | null
  const [form, setForm] = useState(blank)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const startNew = () => { setForm(blank); setFormError(''); setEditing('new') }
  const startEdit = (c) => { setForm(toForm(c)); setFormError(''); setEditing(c.id) }
  const cancel = () => { setEditing(null); setForm(blank); setFormError('') }
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    if (!form.code.trim()) return setFormError('Coupon code is required')
    setFormError('')
    setSaving(true)
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      active: form.active,
      expiresAt: form.expiresAt || null,
      minSubtotal: Number(form.minSubtotal) || 0,
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
      perUserLimit: form.perUserLimit === '' ? null : Number(form.perUserLimit),
    }
    try {
      if (editing === 'new') { await createCoupon(payload); notify('Coupon created') }
      else { await updateCoupon(editing, payload); notify('Coupon updated') }
      cancel()
      reload()
    } catch (err) {
      if (err.status === 409) setFormError('A coupon with that code already exists')
      else setFormError(err.message || 'Could not save coupon')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await deleteCoupon(target.id)
      notify('Coupon deleted')
      setTarget(null)
      reload()
    } catch (err) {
      notify(err.message || 'Could not delete coupon')
    } finally {
      setDeleting(false)
    }
  }

  const describe = (c) =>
    c.type === 'percent' ? `${c.value}% off` : `${currency(c.value)} off`

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        subtitle={loading ? 'Loading coupons…' : `${coupons.length} discount codes`}
      >
        {!editing && <button onClick={startNew} className={primaryBtnCls}>Add Coupon</button>}
      </PageHeader>

      {editing && (
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              {editing === 'new' ? 'Create Coupon' : 'Edit Coupon'}
            </h2>
            <button onClick={cancel} className="p-1 text-neutral-400 hover:text-neutral-900" aria-label="Close"><Close size={18} /></button>
          </div>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Code">
              <input value={form.code} onChange={setField('code')} className={inputCls} placeholder="WELCOME10" />
            </Labeled>
            <Labeled label="Discount type">
              <select value={form.type} onChange={setField('type')} className={inputCls}>
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </Labeled>
            <Labeled label={form.type === 'percent' ? 'Percent off (0-100)' : 'Amount off'}>
              <input type="number" min="0" step="0.01" value={form.value} onChange={setField('value')} className={inputCls} />
            </Labeled>
            <Labeled label="Minimum subtotal">
              <input type="number" min="0" step="0.01" value={form.minSubtotal} onChange={setField('minSubtotal')} className={inputCls} />
            </Labeled>
            <Labeled label="Expiry date (optional)">
              <input type="date" value={form.expiresAt} onChange={setField('expiresAt')} className={inputCls} />
            </Labeled>
            <Labeled label="Status">
              <select value={form.active ? 'active' : 'draft'} onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === 'active' }))} className={inputCls}>
                <option value="active">Active</option>
                <option value="draft">Inactive</option>
              </select>
            </Labeled>
            <Labeled label="Total usage limit (blank = unlimited)">
              <input type="number" min="0" value={form.usageLimit} onChange={setField('usageLimit')} className={inputCls} />
            </Labeled>
            <Labeled label="Per-user limit (blank = unlimited)">
              <input type="number" min="0" value={form.perUserLimit} onChange={setField('perUserLimit')} className={inputCls} />
            </Labeled>
            {formError && <p className="sm:col-span-2 text-[10px] font-bold uppercase tracking-wider text-rose-600">{formError}</p>}
            <div className="sm:col-span-2 flex items-center gap-3 border-t border-neutral-100 pt-4">
              <button type="submit" disabled={saving} className={primaryBtnCls}>
                {saving ? <><Spinner size={13} className="border-white/40 border-t-white" /> Saving…</> : <><Save size={13} /> Save</>}
              </button>
              <button type="button" onClick={cancel} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <LoadingState label="Loading coupons" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Discount</th>
                  <th className="px-6 py-3.5">Min</th>
                  <th className="px-6 py-3.5">Used</th>
                  <th className="px-6 py-3.5">Expires</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="text-xs hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-neutral-900">{c.code}</td>
                    <td className="px-6 py-4 text-neutral-700">{describe(c)}</td>
                    <td className="px-6 py-4 text-neutral-500">{c.minSubtotal ? currency(c.minSubtotal) : '—'}</td>
                    <td className="px-6 py-4 text-neutral-500">{c.usedCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}</td>
                    <td className="px-6 py-4 text-neutral-500">{c.expiresAt ? formatDate(c.expiresAt) : '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={c.active ? 'active' : 'draft'} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => startEdit(c)} className="grid h-8.5 w-8.5 place-items-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 cursor-pointer" aria-label="Edit"><Pencil size={15} /></button>
                        <button onClick={() => setTarget(c)} className="grid h-8.5 w-8.5 place-items-center rounded-xl text-neutral-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer" aria-label="Delete"><Trash size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {coupons.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">No coupons yet</p>
            </div>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete Coupon"
        message={`"${target?.code}" will be permanently removed.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => (deleting ? null : setTarget(null))}
      />
    </div>
  )
}

function Labeled({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">{label}</span>
      {children}
    </label>
  )
}
