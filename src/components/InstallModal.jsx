import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { Close, Download, Monitor, Smartphone, Share, Plus, Check, ChevronRight, ArrowRight, ExternalLink } from './icons'
import logo from '../assets/logo.svg'

// ----- small building blocks -----

function StepRow({ n, title, children, icon: Icon }) {
  return (
    <li className="flex gap-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center border border-neutral-900 bg-neutral-900 text-[11px] font-black text-white">
        {String(n).padStart(2, '0')}
      </span>
      <div className="pt-0.5">
        <p className="flex items-center gap-1.5 text-sm font-bold text-neutral-900">
          {title}
          {Icon && <Icon size={15} className="text-neutral-500" />}
        </p>
        {children && <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{children}</p>}
      </div>
    </li>
  )
}

function PlatformCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 border border-neutral-200 bg-white p-4 text-left transition-colors hover:border-neutral-900 focus-visible:border-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15 cursor-pointer"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center border border-neutral-200 text-neutral-800 transition-colors group-hover:border-neutral-900">
        <Icon size={20} />
      </span>
      <span className="flex-1">
        <span className="block text-xs font-extrabold uppercase tracking-widest text-neutral-900">{title}</span>
        <span className="mt-0.5 block text-xs text-neutral-500">{description}</span>
      </span>
      <ChevronRight size={16} className="text-neutral-300 transition-colors group-hover:text-neutral-900" />
    </button>
  )
}

function ManualSteps({ title, note, children }) {
  return (
    <div>
      <h3 className="text-sm font-extrabold uppercase tracking-tight text-neutral-900">{title}</h3>
      <ol className="mt-5 space-y-5">{children}</ol>
      {note && <p className="mt-6 border-t border-neutral-100 pt-4 text-[11px] leading-relaxed text-neutral-400">{note}</p>}
    </div>
  )
}

// ----- the modal -----

export default function InstallModal({ onClose, initialView }) {
  // This component is conditionally mounted only while open, so useState
  // initialisers give the correct starting view without resetting in an effect.
  const { canInstall, installed, platform, iosSafari, supportsNativePrompt, promptInstall } = usePwaInstall()
  const [view, setView] = useState(() => (installed ? 'success' : initialView || 'home')) // home | select | ios | ios-other | android | desktop | success
  const [status, setStatus] = useState('idle') // idle | loading | dismissed
  const [visible, setVisible] = useState(false)

  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  // The platform-specific manual instruction view for the current device.
  const manualViewForPlatform = platform === 'ios' ? (iosSafari ? 'ios' : 'ios-other') : platform === 'android' ? 'android' : 'desktop'

  const requestClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 180)
  }, [onClose])

  // Play the enter animation on mount (setState runs in the rAF callback, not the effect body).
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Body scroll lock + focus management + Escape + focus trap.
  useEffect(() => {
    previouslyFocused.current = document.activeElement
    const { body } = document
    const prevOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const focusFirst = () => {
      const el = panelRef.current?.querySelector('button, a[href], input, [tabindex]:not([tabindex="-1"])')
      ;(el || panelRef.current)?.focus()
    }
    const t = setTimeout(focusFirst, 60)

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        requestClose()
        return
      }
      if (e.key !== 'Tab') return
      const nodes = panelRef.current?.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])')
      if (!nodes || nodes.length === 0) return
      const list = [...nodes].filter((n) => !n.disabled)
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)

    return () => {
      body.style.overflow = prevOverflow
      clearTimeout(t)
      document.removeEventListener('keydown', onKey, true)
      previouslyFocused.current?.focus?.()
    }
  }, [requestClose])

  const openApp = () => {
    window.location.href = '/'
    requestClose()
  }

  const runNativeInstall = async () => {
    setStatus('loading')
    const result = await promptInstall()
    if (result === 'accepted') {
      setView('success')
      setStatus('idle')
    } else if (result === 'dismissed') {
      setStatus('dismissed')
    } else {
      setStatus('idle')
      setView(manualViewForPlatform) // native became unavailable → manual fallback
    }
  }

  // Primary action on the "home" view depends on capability + state.
  const primaryAction = () => {
    if (supportsNativePrompt && canInstall) return runNativeInstall
    return () => setView(manualViewForPlatform)
  }
  const primaryLabel = () => {
    if (status === 'loading') return 'Installing…'
    if (status === 'dismissed') return 'Try installing again'
    if (supportsNativePrompt && canInstall) return 'Install BUYLY'
    return 'How to install'
  }

  const platformName = platform === 'ios' ? 'iPhone / iPad' : platform === 'android' ? 'Android' : 'Windows / Desktop'

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      {/* backdrop */}
      <div
        aria-hidden="true"
        onClick={requestClose}
        className={`absolute inset-0 bg-neutral-950/50 backdrop-blur-[2px] transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden border border-neutral-200 bg-white shadow-2xl transition-all duration-200 ease-out focus:outline-none ${
          visible ? 'translate-y-0 opacity-100 sm:scale-100' : 'translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95'
        }`}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-7 w-auto" />
            <span id="install-modal-title" className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-900">
              Install BUYLY
            </span>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close installation dialog"
            className="grid h-8 w-8 place-items-center text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15 cursor-pointer"
          >
            <Close size={18} />
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto px-6 py-6">
          {/* ---- HOME (auto-detected primary action) ---- */}
          {view === 'home' && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-neutral-400">Detected: {platformName}</p>
              <h2 className="mt-2 text-lg font-extrabold uppercase tracking-tight text-neutral-900">
                Get the BUYLY app
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Install BUYLY for a faster, full-screen shopping experience with instant launch from your home screen.
              </p>

              {status === 'dismissed' && (
                <p className="mt-4 border border-neutral-200 bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-600">
                  No problem — installation was cancelled. You can try again anytime, or view the manual steps below.
                </p>
              )}

              {!supportsNativePrompt && platform !== 'ios' && (
                <p className="mt-4 border border-neutral-200 bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-600">
                  Your current browser doesn&apos;t support one-tap install. Use the step-by-step guide, or open BUYLY in Chrome or Edge.
                </p>
              )}

              <button
                type="button"
                onClick={primaryAction()}
                disabled={status === 'loading'}
                className="mt-6 flex w-full items-center justify-center gap-2 bg-black py-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 active:bg-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {status === 'loading' ? (
                  <><Spinner /> Installing…</>
                ) : (
                  <><Download size={15} /> {primaryLabel()}</>
                )}
              </button>

              <button
                type="button"
                onClick={() => setView('select')}
                className="mt-3 w-full py-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15 cursor-pointer"
              >
                Choose another device
              </button>
            </div>
          )}

          {/* ---- SELECT PLATFORM ---- */}
          {view === 'select' && (
            <div>
              <h2 className="text-lg font-extrabold uppercase tracking-tight text-neutral-900">Choose your device</h2>
              <p className="mt-1.5 text-sm text-neutral-500">Select where you&apos;d like to install BUYLY.</p>
              <div className="mt-5 space-y-2.5">
                <PlatformCard icon={Monitor} title="Windows / Desktop" description="Install as a desktop app in Chrome or Edge." onClick={() => setView('desktop')} />
                <PlatformCard icon={Smartphone} title="Android" description="Add BUYLY to your home screen." onClick={() => setView('android')} />
                <PlatformCard icon={Smartphone} title="iPhone / iPad" description="Install via Safari — Add to Home Screen." onClick={() => setView('ios')} />
              </div>
            </div>
          )}

          {/* ---- iOS SAFARI STEPS ---- */}
          {view === 'ios' && (
            <ManualSteps
              title="Install on iPhone or iPad"
              note="After adding, BUYLY appears on your Home Screen and opens full-screen like a native app."
            >
              <StepRow n={1} title="Open BUYLY in Safari" icon={ExternalLink}>
                iOS installation is only available through the Safari browser.
              </StepRow>
              <StepRow n={2} title="Tap the Share button" icon={Share}>
                It&apos;s the square-with-an-arrow icon in Safari&apos;s toolbar.
              </StepRow>
              <StepRow n={3} title="Choose “Add to Home Screen”" icon={Plus}>
                Scroll the share sheet if you don&apos;t see it right away.
              </StepRow>
              <StepRow n={4} title="Tap “Add”">
                Confirm in the top-right corner to finish.
              </StepRow>
            </ManualSteps>
          )}

          {/* ---- iOS NON-SAFARI FALLBACK ---- */}
          {view === 'ios-other' && (
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-tight text-neutral-900">You&apos;re using another browser</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                On iPhone and iPad, apps can only be installed from <strong className="text-neutral-900">Safari</strong>. Open BUYLY in Safari, then use <strong className="text-neutral-900">Share → Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setView('ios')}
                className="mt-6 flex w-full items-center justify-center gap-2 border border-neutral-300 py-3.5 text-[11px] font-extrabold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15 cursor-pointer"
              >
                View Safari instructions <ChevronRight size={15} />
              </button>
            </div>
          )}

          {/* ---- ANDROID MANUAL ---- */}
          {view === 'android' && (
            <ManualSteps
              title="Install on Android"
              note="Menu wording is “Install app” or “Add to Home screen” depending on your browser version."
            >
              <StepRow n={1} title="Open BUYLY in Chrome" icon={ExternalLink} />
              <StepRow n={2} title="Tap the browser menu (⋮)">Top-right corner of the browser.</StepRow>
              <StepRow n={3} title="Select “Install app” or “Add to Home screen”" icon={Plus} />
              <StepRow n={4} title="Confirm the installation">Tap “Install” / “Add” to finish.</StepRow>
            </ManualSteps>
          )}

          {/* ---- DESKTOP MANUAL ---- */}
          {view === 'desktop' && (
            <ManualSteps
              title="Install on Windows / Desktop"
              note="Native install is available in Chromium browsers such as Chrome and Edge. Other browsers can still bookmark BUYLY for quick access."
            >
              <StepRow n={1} title="Open BUYLY in Chrome or Edge" icon={ExternalLink} />
              <StepRow n={2} title="Find the install icon in the address bar" icon={Download}>
                A small monitor / download icon appears on the right of the URL bar. You can also use the browser menu.
              </StepRow>
              <StepRow n={3} title="Click “Install BUYLY”">Confirm in the dialog that appears.</StepRow>
            </ManualSteps>
          )}

          {/* ---- SUCCESS / ALREADY INSTALLED ---- */}
          {view === 'success' && (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Check size={28} />
              </div>
              <h2 className="mt-5 text-lg font-extrabold uppercase tracking-tight text-neutral-900">
                {installed ? 'BUYLY is installed' : 'BUYLY is ready!'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {installed
                  ? 'BUYLY is installed on this device. Launch it anytime from your home screen.'
                  : 'BUYLY has been added to your device. Enjoy a faster, app-like experience.'}
              </p>
              <button
                type="button"
                onClick={openApp}
                className="mt-6 flex w-full items-center justify-center gap-2 bg-black py-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/25 cursor-pointer"
              >
                {installed ? 'Open BUYLY' : 'Start shopping'} <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* footer back-nav for sub-views */}
        {view !== 'home' && view !== 'success' && (
          <div className="border-t border-neutral-100 px-6 py-3">
            <button
              type="button"
              onClick={() => setView(installed ? 'success' : 'home')}
              className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15 cursor-pointer"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
    />
  )
}
