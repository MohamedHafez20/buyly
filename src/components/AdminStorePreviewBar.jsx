import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { disableAdminStorePreview, isAdminStorePreview } from '../lib/adminStorePreview'
import { LayoutDashboard } from './icons'

export default function AdminStorePreviewBar() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const active = isAdminStorePreview()

  if (!isAdmin || !active) return null

  const backToAdmin = () => {
    disableAdminStorePreview()
    navigate('/admin')
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        type="button"
        onClick={backToAdmin}
        className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-neutral-900 shadow-xl shadow-neutral-950/10 transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
      >
        <LayoutDashboard size={15} />
        Back to Admin Dashboard
      </button>
    </div>
  )
}
