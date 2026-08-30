import { barContainerStyle, promoPillStyle, linkStyle } from '../lib/announcementStyle'

// Pure renderer for a single announcement bar. It draws entirely from the style
// object it is given — the storefront feeds it API data, the admin editor feeds
// it in-progress form state, and both look identical. It holds no data logic of
// its own (no fetching, no dismissal state); the caller owns that.
//
// Announcements are not visitor-dismissible: there is no close control. The admin
// shows/hides bars from the admin panel (active flag / schedule).
//
// Props:
//   bar      — the style/content object
//   animate  — optional animation key to play on mount
//              ('slide-in' | 'slide-x' | 'fade')
export default function AnnouncementBarView({ bar, animate }) {
  if (!bar) return null

  const animClass =
    animate === 'slide-in' ? 'buyly-ann-slide'
    : animate === 'slide-x' ? 'buyly-ann-slide-x'
    : animate === 'fade' ? 'buyly-ann-fade'
    : ''

  // Guard against corrupted icon data. A real icon is an emoji/symbol (all
  // non-ASCII); if the stored value contains any ASCII character it is junk —
  // e.g. an emoji that was mangled into "??" before it was saved — so drop it
  // rather than render "??" on the storefront.
  const icon =
    bar.icon && ![...bar.icon].some((c) => c.codePointAt(0) <= 0x7f) ? bar.icon : ''

  return (
    <div className="w-full overflow-hidden" style={{ background: bar.backgroundColor }}>
      <div
        className={`relative mx-auto flex w-full max-w-7xl items-center gap-2 px-9 sm:px-12 ${animClass}`}
        style={barContainerStyle(bar)}
        role="status"
      >
        {/* Content — centered block that wraps/truncates gracefully on mobile. */}
        <div
          className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1"
          style={{ justifyContent: justify(bar.textAlign) }}
        >
          {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}

          <span className="min-w-0 truncate sm:whitespace-normal">{bar.message}</span>

          {bar.promoCode && (
            <span
              className="shrink-0 px-2 py-0.5 text-[0.85em] font-bold tracking-wider"
              style={promoPillStyle(bar)}
            >
              {bar.promoCode}
            </span>
          )}

          {bar.linkUrl && bar.linkText && (
            <a
              href={bar.linkUrl}
              className="shrink-0 font-bold underline underline-offset-2"
              style={linkStyle(bar)}
            >
              {bar.linkText}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// Map textAlign to a flex justification for the wrapping content row.
const justify = (align) =>
  align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
