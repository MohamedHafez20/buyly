import { swatchProps } from '../../lib/colorSwatch'
import { buildCombos } from '../../lib/variants'

// Per-variant inventory editor: a stock cell for every color/size combination.
// SKUs are generated server-side; product-level stock becomes the sum of these.
export default function VariantsEditor({ colors = [], sizes = [], value = [], onChange, enabled, onToggle }) {
  const combos = buildCombos(colors, sizes)
  const stockOf = (color, size) =>
    value.find((v) => v.color === color && v.size === size)?.stock ?? 0

  const setStock = (color, size, stock) => {
    const map = new Map(value.map((v) => [`${v.color}|${v.size}`, v]))
    onChange(
      combos.map((cb) => ({
        color: cb.color,
        size: cb.size,
        stock:
          cb.color === color && cb.size === size
            ? stock
            : map.get(`${cb.color}|${cb.size}`)?.stock ?? 0,
      })),
    )
  }

  const total = combos.reduce((sum, cb) => sum + stockOf(cb.color, cb.size), 0)
  const ready = colors.length > 0 && sizes.length > 0

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-left"
      >
        <span>
          <span className="block text-xs font-bold text-neutral-900 dark:text-white">Track stock per variant</span>
          <span className="mt-0.5 block text-[11px] font-medium text-neutral-500">
            Set inventory for each color + size combination instead of one product total.
          </span>
        </span>
        <span
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-700'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white dark:bg-neutral-950 shadow transition-transform ${
              enabled ? 'translate-x-[1.375rem]' : 'translate-x-0.5'
            }`}
          />
        </span>
      </button>

      {enabled && !ready && (
        <p className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 px-4 py-6 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Add at least one color and one size above to build the variant grid.
        </p>
      )}

      {enabled && ready && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900">
                  <th className="sticky left-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-3 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                    Color \ Size
                  </th>
                  {sizes.map((s) => (
                    <th key={s} className="px-3 py-2.5 text-center text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {colors.map((c) => {
                  const sw = swatchProps(c)
                  return (
                    <tr key={c.name} className="border-t border-neutral-100 dark:border-neutral-800">
                      <td className="sticky left-0 z-10 bg-white dark:bg-neutral-950 px-3 py-2">
                        <span className="flex items-center gap-2">
                          <span
                            style={sw.style}
                            className={`h-3.5 w-3.5 shrink-0 rounded-full border ${sw.className}`}
                          />
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">{c.name}</span>
                        </span>
                      </td>
                      {sizes.map((s) => (
                        <td key={s} className="px-2 py-1.5 text-center">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={stockOf(c.name, s)}
                            onChange={(e) => {
                              const n = Math.max(0, Math.floor(Number(e.target.value) || 0))
                              setStock(c.name, s, n)
                            }}
                            aria-label={`Stock for ${c.name} ${s}`}
                            className="w-16 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2 py-1.5 text-center text-xs font-semibold text-neutral-900 dark:text-white outline-none transition focus:border-neutral-950 dark:focus:border-white"
                          />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-neutral-500">
            <span>{combos.length} variant{combos.length === 1 ? '' : 's'} · SKUs generated automatically</span>
            <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 font-bold text-neutral-700 dark:text-neutral-200">
              Total stock: {total}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
