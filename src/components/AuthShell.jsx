import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import heroBanner from '../assets/hero_banner.png'
import { ArrowLeft } from './icons'

// Two-column auth frame: form on the left, brand panel on the right.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-2">
      {/* form side */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-900">
          <ArrowLeft size={15} /> Back to store
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Link to="/" className="inline-flex">
              <img src={logo} alt="Buyly" className="h-9 w-auto" />
            </Link>
            <h1 className="mt-8 text-2xl font-extrabold uppercase tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>}

            <div className="mt-8">{children}</div>

            {footer && <p className="mt-8 text-center text-sm text-slate-500">{footer}</p>}
          </div>
        </div>
      </div>

      {/* brand side */}
      <div className="relative hidden overflow-hidden bg-slate-900 lg:block">
        <img src={heroBanner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <span className="text-2xl font-extrabold uppercase tracking-[0.2em] text-white">Buyly</span>
          <div>
            <h2 className="text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white">
              Premium gear.<br />Fair prices.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              Join thousands of shoppers who trust Buyly for electronics, fashion, and everyday essentials — delivered with care.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Shared input row: leading icon, the field itself, and an optional trailing control.
export function AuthField({ icon: Icon, error, trailing, ...inputProps }) {
  return (
    <div>
      <div className="relative">
        {Icon && <Icon size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          {...inputProps}
          className={`w-full border bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-slate-900'
          }`}
        />
        {trailing}
      </div>
      {error && <p className="mt-1.5 text-xs font-semibold text-rose-500">{error}</p>}
    </div>
  )
}

// A demo social button (no real OAuth in this project).
export function SocialButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 border border-slate-300 bg-white py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition-colors hover:bg-slate-50"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.9-3a7.2 7.2 0 0 1-10.7-3.8H1.4v3.1A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.4 14.2a7.2 7.2 0 0 1 0-4.6V6.5H1.4a12 12 0 0 0 0 10.8z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 0 0 1.4 6.5l4 3.1A7.2 7.2 0 0 1 12 4.8z" />
      </svg>
      Continue with Google
    </button>
  )
}
