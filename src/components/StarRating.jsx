import { Star } from './icons'

export default function StarRating({ value = 0, size = 15, showValue = false, reviews }) {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  return (
    <span className="inline-flex items-center gap-1 text-amber-400">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} filled={i < full || (i === full && half)} />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          {value.toFixed(1)}
          {reviews != null && <span className="text-slate-400"> ({reviews.toLocaleString()})</span>}
        </span>
      )}
    </span>
  )
}
