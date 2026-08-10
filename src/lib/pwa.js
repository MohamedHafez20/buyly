// Central PWA install logic. Imported once at startup so the (one-shot)
// `beforeinstallprompt` event is captured before React finishes mounting.

const hasWindow = typeof window !== 'undefined'

// ---- platform / browser detection (best-effort, never throws) ----
function detect() {
  if (!hasWindow) return { platform: 'desktop', browser: 'other', iosSafari: false }
  const ua = window.navigator.userAgent || ''
  // iPadOS 13+ reports as "MacIntel" with touch — treat as iOS.
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /android/i.test(ua)
  const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'

  // On iOS every engine is WebKit; only Safari supports Add to Home Screen.
  const iosOtherBrowser = /crios|fxios|edgios|opios|mercury/i.test(ua)
  let browser = 'other'
  if (isIOS) browser = iosOtherBrowser ? 'ios-other' : 'safari'
  else if (/edg\//i.test(ua)) browser = 'edge'
  else if (/opr\/|opera/i.test(ua)) browser = 'opera'
  else if (/chrome|chromium/i.test(ua)) browser = 'chrome'
  else if (/firefox/i.test(ua)) browser = 'firefox'
  else if (/safari/i.test(ua)) browser = 'safari'

  return { platform, browser, iosSafari: isIOS && !iosOtherBrowser }
}

export const { platform, browser, iosSafari } = detect()

// A browser can only run the native install prompt if it fires beforeinstallprompt.
// Chromium desktop/Android do; Firefox and all iOS browsers do not.
export const supportsNativePrompt = platform !== 'ios' && /chrome|chromium|edg|opr/i.test(hasWindow ? navigator.userAgent : '')

function isStandalone() {
  if (!hasWindow) return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
    window.navigator.standalone === true
  )
}

// ---- reactive store (stable snapshot for useSyncExternalStore) ----
let deferredPrompt = null
let installed = isStandalone()
let snapshot = { canInstall: false, installed }
const subscribers = new Set()

function refresh() {
  snapshot = { canInstall: !!deferredPrompt, installed }
  subscribers.forEach((fn) => fn())
}

if (hasWindow) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // stop Chrome's mini-infobar; we trigger it ourselves
    deferredPrompt = e
    refresh()
  })
  window.addEventListener('appinstalled', () => {
    installed = true
    deferredPrompt = null
    refresh()
  })
  // React to the app being launched/closed in standalone mode.
  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', (e) => {
    if (e.matches) installed = true
    refresh()
  })
}

export function subscribe(cb) {
  subscribers.add(cb)
  return () => subscribers.delete(cb)
}

export function getSnapshot() {
  return snapshot
}

// Trigger the native install prompt. Returns 'accepted' | 'dismissed' | 'unavailable'.
export async function promptInstall() {
  if (!deferredPrompt) return 'unavailable'
  try {
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    deferredPrompt = null // a prompt event can only be used once
    refresh()
    return choice?.outcome === 'accepted' ? 'accepted' : 'dismissed'
  } catch {
    deferredPrompt = null
    refresh()
    return 'unavailable'
  }
}
