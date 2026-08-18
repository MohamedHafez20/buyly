import { AlertTriangle, Refresh } from './icons'

// Minimal spinner in the brand's neutral palette.
export function Spinner({ size = 20, className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  )
}

// Full-section loading state with a centered spinner.
export function LoadingState({ label = 'Loading', className = '' }) {
  return (
    <div className={`grid place-items-center py-24 text-center ${className}`}>
      <Spinner size={26} />
      <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-400">{label}</p>
    </div>
  )
}

// Error state with an optional retry button, styled like the empty states.
export function ErrorState({ message = 'Something went wrong', onRetry, className = '' }) {
  return (
    <div className={`grid place-items-center border border-dashed border-neutral-200 py-20 text-center ${className}`}>
      <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600">
        <AlertTriangle size={20} />
      </div>
      <p className="mt-4 text-sm font-extrabold uppercase tracking-widest text-neutral-900">Unable to load</p>
      <p className="mt-1.5 max-w-sm text-xs font-medium text-neutral-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 bg-black px-7 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 rounded-none cursor-pointer"
        >
          <Refresh size={13} /> Try again
        </button>
      )}
    </div>
  )
}

// Skeleton placeholder shaped like a ProductCard, for grid loading states.
export function ProductCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col">
      <div className="aspect-[3/4] w-full bg-neutral-100 border border-neutral-100" />
      <div className="pt-3 space-y-2">
        <div className="h-2 w-12 bg-neutral-100" />
        <div className="h-3 w-3/4 bg-neutral-100" />
        <div className="h-3 w-16 bg-neutral-100" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
