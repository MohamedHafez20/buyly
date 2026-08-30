import { Navigate } from 'react-router-dom'
import { enableAdminStorePreview } from '../../lib/adminStorePreview'

export default function ViewStoreAsUser() {
  enableAdminStorePreview()
  return <Navigate to="/" replace />
}
