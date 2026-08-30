// Pure mapping from an announcement bar's style fields to concrete CSS. Both the
// storefront <AnnouncementBar/> and the admin live preview render through this
// helper, so the preview is guaranteed to match production exactly. No colours,
// fonts, or sizes are hardcoded in components — everything derives from here.

// Supported font-family keys (mirror the backend list) → web-safe stacks so the
// preview and storefront resolve to the identical typeface.
export const FONT_STACKS = {
  system: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", ui-monospace, monospace',
  rounded: '"Trebuchet MS", "Segoe UI", sans-serif',
  condensed: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif',
}

export const FONT_FAMILY_OPTIONS = [
  { value: 'system', label: 'System Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Monospace' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'condensed', label: 'Condensed' },
]

const FONT_SIZE_PRESETS = { sm: 13, md: 15, lg: 18 }
const FONT_WEIGHTS = { normal: 400, medium: 600, bold: 800 }

// Resolve a fontSize field ("sm"/"md"/"lg" or a number/px) to a px string.
export const resolveFontSize = (fontSize) => {
  if (fontSize in FONT_SIZE_PRESETS) return `${FONT_SIZE_PRESETS[fontSize]}px`
  const n = Number(fontSize)
  return Number.isNaN(n) ? '15px' : `${n}px`
}

// Inline style for the bar's outer container.
export function barContainerStyle(bar = {}) {
  const {
    backgroundColor = '#111111',
    textColor = '#ffffff',
    fontFamily = 'system',
    fontSize = 'md',
    fontWeight = 'medium',
    textTransform = 'none',
    letterSpacing = 0,
    textAlign = 'center',
    paddingY = 10,
    borderRadius = 0,
    borderColor = '',
    borderWidth = 0,
  } = bar

  const hasBorder = Number(borderWidth) > 0 && borderColor
  return {
    // `background` accepts both hex and gradient strings.
    background: backgroundColor,
    color: textColor,
    fontFamily: FONT_STACKS[fontFamily] || FONT_STACKS.system,
    fontSize: resolveFontSize(fontSize),
    fontWeight: FONT_WEIGHTS[fontWeight] || 600,
    textTransform,
    letterSpacing: `${Number(letterSpacing) || 0}px`,
    textAlign,
    paddingTop: `${Number(paddingY) || 0}px`,
    paddingBottom: `${Number(paddingY) || 0}px`,
    borderRadius: `${Number(borderRadius) || 0}px`,
    border: hasBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
    lineHeight: 1.35,
  }
}

// Inline style for the promo-code pill (highlighted with the accent colour).
export function promoPillStyle(bar = {}) {
  const { accentColor = '#facc15', borderRadius = 0 } = bar
  return {
    color: accentColor,
    border: `1px solid ${accentColor}`,
    // A rounded bar radius also rounds the pill; keep a sensible minimum.
    borderRadius: `${Math.max(Number(borderRadius) || 0, 4)}px`,
  }
}

// Inline style for the call-to-action link (accent-coloured).
export function linkStyle(bar = {}) {
  return { color: bar.accentColor || '#facc15' }
}
