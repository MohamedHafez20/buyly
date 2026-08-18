import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { LoadingState } from './States'

// Route guard for the /admin area. Waits for the session to resolve, then:
//  - not signed in     -> send to login (with return path)
//  - signed in, not admin -> friendly 403 screen
export default function RequireAdmin({ children }) {
  const { loading, isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <LoadingState label="Checking access" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-white px-4 text-center">
        <div>
          <p className="text-5xl">🔒</p>
          <h1 className="mt-4 text-2xl font-extrabold uppercase tracking-tight text-neutral-900">Admin access only</h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Your account doesn’t have permission to view this area.
          </p>
          <Link to="/" className="mt-6 inline-block bg-black px-7 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 rounded-none">
            Back to store
          </Link>
        </div>
      </div>
    )
  }

  return children
}
