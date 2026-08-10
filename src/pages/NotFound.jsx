import { Link } from 'react-router-dom'
import { ArrowRight } from '../components/icons'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-28 text-center">
      <p className="text-8xl font-extrabold tracking-tight text-slate-900">404</p>
      <h1 className="mt-4 text-2xl font-extrabold uppercase tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-3 text-sm text-slate-500">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center gap-2 bg-slate-900 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-slate-700"
      >
        Back to home <ArrowRight size={15} />
      </Link>
    </div>
  )
}
