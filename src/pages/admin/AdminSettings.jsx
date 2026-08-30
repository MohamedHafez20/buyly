import { useState } from 'react'
import { useStore } from '../../context/useStore'
import { getAdminSettings, updateSettings } from '../../services/settings'
import { useResource } from '../../lib/useResource'
import { LoadingState, ErrorState, Spinner } from '../../components/States'
import { PageHeader, Card, inputCls, primaryBtnCls } from '../../components/admin/ui'
import ImageUploader from '../../components/admin/ImageUploader'
import { Save } from '../../components/icons'

export default function AdminSettings() {
  const { notify } = useStore()
  const { data, loading, error, reload } = useResource(() => getAdminSettings())

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Settings"
        subtitle="Pricing rules, currency and payment options used across the storefront and checkout."
      />
      {loading || !data ? (
        <LoadingState label="Loading settings" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        // Keyed so the form re-initialises from fresh data after each save.
        <SettingsForm key={data.updatedAt || 'settings'} initial={data} notify={notify} onSaved={reload} />
      )}
    </div>
  )
}

// The editable form initialises its state from `initial` exactly once (via the
// useState initialiser), which keeps it lint-clean — no setState-in-effect.
function SettingsForm({ initial, notify, onSaved }) {
  const [form, setForm] = useState(() => structuredClone(initial))
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const togglePayment = (key) =>
    setForm((f) => ({
      ...f,
      paymentMethods: f.paymentMethods.map((m) =>
        m.key === key ? { ...m, enabled: !m.enabled } : m,
      ),
    }))
  const setPaymentLabel = (key, label) =>
    setForm((f) => ({
      ...f,
      paymentMethods: f.paymentMethods.map((m) => (m.key === key ? { ...m, label } : m)),
    }))

  const save = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.storeName.trim()) return setFormError('Store name is required')
    if (!form.paymentMethods.some((m) => m.enabled))
      return setFormError('At least one payment method must be enabled')

    setSaving(true)
    try {
      await updateSettings({
        storeName: form.storeName.trim(),
        currency: form.currency.trim().toUpperCase(),
        authImage: form.authImage || '',
        freeShippingThreshold: Number(form.freeShippingThreshold),
        shippingFlatRate: Number(form.shippingFlatRate),
        taxRatePercent: Number(form.taxRatePercent),
        paymentMethods: form.paymentMethods,
      })
      notify('Settings saved')
      onSaved()
    } catch (err) {
      setFormError(err.message || 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
        <form onSubmit={save} className="space-y-6">
          

          <Card className="p-6">
            <h2 className="mb-1 font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              Login page image
            </h2>
            <p className="mb-5 text-sm text-neutral-500">
              Shown on the brand panel of the sign-in and sign-up pages. Leave empty to use the default banner.
            </p>
            <ImageUploader
              max={1}
              value={form.authImage ? [form.authImage] : []}
              onChange={(imgs) => setForm((f) => ({ ...f, authImage: imgs[0] || '' }))}
            />
          </Card>

          <Card className="p-6">
            <h2 className="mb-1 font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              Pricing rules
            </h2>
            <p className="mb-5 text-sm text-neutral-500">
              These drive every cart and order total. Changing them re-prices all live carts instantly.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Labeled label="Free shipping threshold">
                <input type="number" min="0" step="0.01" value={form.freeShippingThreshold} onChange={setField('freeShippingThreshold')} className={inputCls} />
              </Labeled>
              <Labeled label="Flat shipping rate">
                <input type="number" min="0" step="0.01" value={form.shippingFlatRate} onChange={setField('shippingFlatRate')} className={inputCls} />
              </Labeled>
              <Labeled label="Tax rate (%)">
                <input type="number" min="0" max="100" step="0.01" value={form.taxRatePercent} onChange={setField('taxRatePercent')} className={inputCls} />
              </Labeled>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-5 font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              Payment methods
            </h2>
            <div className="space-y-3">
              {form.paymentMethods.map((m) => (
                <div key={m.key} className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 p-3">
                  <span className="w-16 shrink-0 font-mono text-xs font-bold uppercase text-neutral-500">{m.key}</span>
                  <input
                    value={m.label}
                    onChange={(e) => setPaymentLabel(m.key, e.target.value)}
                    className={`${inputCls} flex-1 min-w-[160px]`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePayment(m.key)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      m.enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                    }`}
                  >
                    {m.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {formError && (
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">{formError}</p>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className={primaryBtnCls}>
              {saving ? <><Spinner size={13} className="border-white/40 border-t-white" /> Saving…</> : <><Save size={14} /> Save settings</>}
            </button>
          </div>
        </form>
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
