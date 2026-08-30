import { Close, Plus } from '../icons'
import { round2, tierError } from '../../lib/bundles'

// Bundle offers editor: a "buy N for a fixed price" tier list with add / edit /
// remove / activate-deactivate. The product base price is passed in only to show
// live savings and validation — it is never modified here.
export default function BundleOffersEditor({ value = [], onChange, enabled, onToggle, basePrice }) {
  const update = (index, patch) =>
    onChange(value.map((t, i) => (i === index ? { ...t, ...patch } : t)))
  const add = () => onChange([...value, { quantity: '', bundlePrice: '', label: '', active: true }])
  const remove = (index) => onChange(value.filter((_, i) => i !== index))

  const base = Number(basePrice || 0)

  return (
    <div className="space-y-4">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-left"
      >
        <span>
          <span className="block text-xs font-bold text-neutral-900 dark:text-white">Bundle offer</span>
          <span className="mt-0.5 block text-[11px] font-medium text-neutral-500">
            Offer “buy N for a fixed price” deals. The base price is never changed.
          </span>
        </span>
        <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white dark:bg-neutral-950 shadow transition-transform ${enabled ? 'translate-x-[1.375rem]' : 'translate-x-0.5'}`} />
        </span>
      </button>

      {enabled && (
        <div className="space-y-3">
          {value.length === 0 && (
            <p className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 px-4 py-6 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              No tiers yet — add one like “Buy 2 for 170”.
            </p>
          )}

          {value.map((tier, index) => {
            const err = tierError(tier, base)
            const qty = Number(tier.quantity)
            const price = Number(tier.bundlePrice)
            const full = base && qty ? round2(base * qty) : 0
            const save = !err ? round2(full - price) : 0
            return (
              <div key={tier.id || index} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Buy</span>
                  <input
                    type="number" min="2" step="1"
                    value={tier.quantity}
                    onChange={(e) => update(index, { quantity: e.target.value })}
                    placeholder="2"
                    aria-label="Bundle quantity"
                    className="w-16 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2.5 py-2 text-center text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-neutral-950 dark:focus:border-white"
                  />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">for</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={tier.bundlePrice}
                    onChange={(e) => update(index, { bundlePrice: e.target.value })}
                    placeholder="170"
                    aria-label="Bundle price"
                    className="w-24 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2.5 py-2 text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-neutral-950 dark:focus:border-white"
                  />
                  <input
                    value={tier.label}
                    onChange={(e) => update(index, { label: e.target.value })}
                    placeholder="Label (optional) e.g. Best Value"
                    aria-label="Bundle label"
                    className="min-w-[9rem] flex-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-neutral-950 dark:focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={() => update(index, { active: !(tier.active !== false) })}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      tier.active !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                        : 'bg-neutral-100 text-neutral-500 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                    }`}
                  >
                    {tier.active !== false ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="grid h-8 w-8 place-items-center rounded-md text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    aria-label="Remove bundle tier"
                  >
                    <Close size={15} />
                  </button>
                </div>
                <div className="mt-2 pl-1 text-[11px] font-semibold">
                  {err ? (
                    <span className="text-rose-600 dark:text-rose-400">{err}</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Save {save} vs {full} — buyers pick {qty} pieces for {price}
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 transition hover:border-neutral-950 hover:text-neutral-950 dark:hover:border-white dark:hover:text-white"
          >
            <Plus size={14} /> Add tier
          </button>
        </div>
      )}
    </div>
  )
}
