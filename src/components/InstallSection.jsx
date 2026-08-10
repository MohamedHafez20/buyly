import { useState } from 'react'
import { usePwaInstall } from '../hooks/usePwaInstall'
import InstallModal from './InstallModal'
import { Download, Check, Sparkle, Smartphone, Wind } from './icons'
import logo from '../assets/logo.svg'

const perks = [
  { icon: Sparkle, label: 'Instant launch' },
  { icon: Wind, label: 'Faster browsing' },
  { icon: Smartphone, label: 'Home-screen access' },
]

export default function InstallSection() {
  const { installed } = usePwaInstall()
  const [open, setOpen] = useState(false)
  const [initialView, setInitialView] = useState(undefined)

  const openInstall = (view) => {
    setInitialView(view)
    setOpen(true)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid items-stretch gap-0 overflow-hidden border border-neutral-200 bg-white lg:grid-cols-2">
        {/* copy */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-neutral-400">Shop BUYLY like an app</p>
          <h2 className="mt-3 text-2xl font-extrabold uppercase tracking-tight text-neutral-900 sm:text-3xl">
            Install BUYLY on your device
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            Get a faster, full-screen shopping experience. Add BUYLY to your home screen and launch it instantly — no app store required.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {perks.map((p) => (
              <li key={p.label} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                <p.icon size={15} className="text-neutral-900" /> {p.label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {installed ? (
              <>
                <span className="inline-flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">
                  <Check size={15} /> BUYLY is installed
                </span>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 border border-neutral-300 px-8 py-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15 cursor-pointer"
                >
                  Open BUYLY
                </a>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openInstall(undefined)}
                  className="group inline-flex items-center gap-2 bg-black px-8 py-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 active:bg-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/25 focus-visible:ring-offset-2 cursor-pointer"
                >
                  <Download size={15} className="transition-transform group-hover:-translate-y-0.5" />
                  Install BUYLY
                </button>
                <button
                  type="button"
                  onClick={() => openInstall('select')}
                  className="inline-flex items-center gap-2 px-2 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15 cursor-pointer"
                >
                  How to install
                </button>
              </>
            )}
          </div>
        </div>

        {/* app-icon showcase */}
        <div className="relative hidden items-center justify-center border-t border-neutral-200 bg-neutral-50 p-12 lg:flex lg:border-l lg:border-t-0">
          <div className="flex flex-col items-center">
            {/* home-screen style app tile */}
            <div className="grid h-28 w-28 place-items-center rounded-[26px] border border-neutral-200 bg-white shadow-lg">
              <img src={logo} alt="BUYLY app icon" className="h-16 w-16 object-contain" />
            </div>
            <span className="mt-4 text-xs font-bold tracking-wide text-neutral-600">Buyly</span>
            <div className="mt-1 flex gap-1" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
            </div>
          </div>
        </div>
      </div>

      {open && <InstallModal onClose={() => setOpen(false)} initialView={initialView} />}
    </section>
  )
}
