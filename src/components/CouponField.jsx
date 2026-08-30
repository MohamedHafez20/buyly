import { useState } from 'react'
import { Check, Close } from './icons'

// Coupon entry. It only collects the code and displays the backend's verdict
// (the applied coupon or an error) — all validation and the discount amount are
// computed server-side and arrive via the cart summary.
export default function CouponField({ coupon, summary, onApply, onClear }) {
  const [code, setCode] = useState('')
  const applied = summary?.coupon
  const error = coupon && summary?.couponError ? summary.couponError : ''

  const submit = (e) => {
    e.preventDefault()
    const value = code.trim()
    if (value) onApply(value)
  }

  // A valid coupon is applied — show it with a remove control.
  if (applied) {
    return (
      <div className="mt-5 flex items-center justify-between border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          <Check size={14} /> {applied.code} applied
        </span>
        <button
          onClick={onClear}
          className="p-1 text-emerald-700/70 hover:text-emerald-900 dark:text-emerald-400/70 dark:hover:text-emerald-200"
          aria-label="Remove coupon"
        >
          <Close size={15} />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-5">
      <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
        Discount code
      </label>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="flex-1 border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold uppercase tracking-wide outline-none transition focus:border-black dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
        />
        <button
          type="submit"
          className="bg-black px-5 text-[10px] font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
          disabled={!code.trim()}
        >
          Apply
        </button>
      </div>
      {error && (
        <p className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-rose-600">
          <span>{error}</span>
          <button type="button" onClick={onClear} className="underline underline-offset-2">Clear</button>
        </p>
      )}
    </form>
  )
}
