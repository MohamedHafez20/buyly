import { useState } from 'react'
import { useStore } from '../../context/useStore'
import {
  listAllCountries,
  createCountry,
  updateCountry,
  deleteCountry,
} from '../../services/countries'
import { useResource } from '../../lib/useResource'
import { LoadingState, ErrorState, Spinner } from '../../components/States'
import { PageHeader, Card, StatusBadge, inputCls, primaryBtnCls } from '../../components/admin/ui'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Pencil, Trash, Save, Close, Globe } from '../../components/icons'

const blank = { name: '', code: '', enabled: true, order: 0, shippingRate: '', taxRate: '' }

export default function AdminCountries() {
  const { notify } = useStore()
  const { data, loading, error, reload } = useResource(() => listAllCountries())
  const countries = data || []

  const [editing, setEditing] = useState(null) // id | 'new' | null
  const [form, setForm] = useState(blank)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const startNew = () => { setForm(blank); setFormError(''); setEditing('new') }
  const startEdit = (c) => {
    setForm({
      name: c.name,
      code: c.code || '',
      enabled: c.enabled,
      order: c.order || 0,
      shippingRate: c.shippingRate !== null && c.shippingRate !== undefined ? String(c.shippingRate) : '',
      taxRate: c.taxRate !== null && c.taxRate !== undefined ? String(c.taxRate) : '',
    })
    setFormError('')
    setEditing(c.id)
  }
  const cancel = () => { setEditing(null); setForm(blank); setFormError('') }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setFormError('Country name is required')
    setFormError('')
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      enabled: form.enabled,
      order: Number(form.order) || 0,
      shippingRate: form.shippingRate === '' ? null : Number(form.shippingRate),
      taxRate: form.taxRate === '' ? null : Number(form.taxRate),
    }
    try {
      if (editing === 'new') { await createCountry(payload); notify('Country added') }
      else { await updateCountry(editing, payload); notify('Country updated') }
      cancel()
      reload()
    } catch (err) {
      if (err.status === 409) setFormError('That country already exists')
      else setFormError(err.message || 'Could not save country')
    } finally {
      setSaving(false)
    }
  }

  // Quick enable/disable straight from the table.
  const toggle = async (c) => {
    try {
      await updateCountry(c.id, { enabled: !c.enabled })
      reload()
    } catch (err) {
      notify(err.message || 'Could not update country')
    }
  }

  const confirmDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await deleteCountry(target.id)
      notify('Country deleted')
      setTarget(null)
      reload()
    } catch (err) {
      notify(err.message || 'Could not delete country')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Countries"
        subtitle={loading ? 'Loading countries…' : `${countries.length} countries available at checkout`}
      >
        {!editing && (
          <button onClick={startNew} className={primaryBtnCls}>Add Country</button>
        )}
      </PageHeader>

      {editing && (
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              {editing === 'new' ? 'Add Country' : 'Edit Country'}
            </h2>
            <button onClick={cancel} className="p-1 text-neutral-400 hover:text-neutral-900" aria-label="Close">
              <Close size={18} />
            </button>
          </div>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Name</span>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. United States" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">ISO code</span>
              <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className={inputCls} maxLength={2} placeholder="US" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Display order</span>
              <input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Status</span>
              <select value={form.enabled ? 'active' : 'hidden'} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.value === 'active' }))} className={inputCls}>
                <option value="active">Enabled</option>
                <option value="hidden">Disabled</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Custom Shipping Rate (optional)</span>
              <input type="number" step="0.01" min="0" value={form.shippingRate} onChange={(e) => setForm((f) => ({ ...f, shippingRate: e.target.value }))} className={inputCls} placeholder="e.g. 15.00" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Custom Tax Rate % (optional)</span>
              <input type="number" step="0.01" min="0" max="100" value={form.taxRate} onChange={(e) => setForm((f) => ({ ...f, taxRate: e.target.value }))} className={inputCls} placeholder="e.g. 12" />
            </label>
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
        <LoadingState label="Loading countries" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                  <th className="px-6 py-3.5">Country</th>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Shipping Rate</th>
                  <th className="px-6 py-3.5">Tax Rate</th>
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {countries.map((c) => (
                  <tr key={c.id} className="text-xs hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-400">
                          <Globe size={16} />
                        </span>
                        <span className="font-display font-bold text-neutral-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-500">{c.code || '—'}</td>
                    <td className="px-6 py-4 text-neutral-600 font-semibold">{c.shippingRate !== null && c.shippingRate !== undefined ? `$${c.shippingRate.toFixed(2)}` : 'Store Default'}</td>
                    <td className="px-6 py-4 text-neutral-600 font-semibold">{c.taxRate !== null && c.taxRate !== undefined ? `${c.taxRate}%` : 'Store Default'}</td>
                    <td className="px-6 py-4 text-neutral-500">{c.order}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggle(c)} aria-label="Toggle status" className="cursor-pointer">
                        <StatusBadge status={c.enabled ? 'active' : 'hidden'} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => startEdit(c)} className="grid h-8.5 w-8.5 place-items-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 cursor-pointer" aria-label="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setTarget(c)} className="grid h-8.5 w-8.5 place-items-center rounded-xl text-neutral-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer" aria-label="Delete">
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {countries.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">No countries yet</p>
            </div>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete Country"
        message={`"${target?.name}" will be removed from checkout.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => (deleting ? null : setTarget(null))}
      />
    </div>
  )
}
