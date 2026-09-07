// Minimal, premium MEN / WOMEN / ALL tab strip used on the Home and Shop pages.
// Text-only tabs (no buttons/pills): the active tab is dark with a slightly
// heavier weight and a thin animated underline; inactive tabs are muted gray
// with a subtle hover. "all" is a UI-only value — the backend never stores it.
const GENDER_TABS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'all', label: 'All' },
]

export default function GenderTabs({ value = 'all', onChange, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-7 sm:gap-9 ${className}`} role="tablist" aria-label="Shop by gender">
      {GENDER_TABS.map((tab) => {
        const active = value === tab.value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(tab.value)}
            className={`relative pb-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 cursor-pointer sm:text-xs ${
              active
                ? 'font-bold text-neutral-900'
                : 'font-semibold text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {tab.label}
            <span
              className={`pointer-events-none absolute inset-x-0 -bottom-px h-px origin-center bg-neutral-900 transition-transform duration-300 ease-out ${
                active ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
