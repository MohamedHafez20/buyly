import { useState } from 'react'
import { useStore } from '../../context/useStore'
import { listAllReviews, moderateReview, deleteAdminReview } from '../../services/reviews'
import { useResource } from '../../lib/useResource'
import { formatDate } from '../../lib/format'
import { LoadingState, ErrorState } from '../../components/States'
import { PageHeader, Card, StatusBadge, inputCls } from '../../components/admin/ui'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import StarRating from '../../components/StarRating'
import { Trash, Check, Close } from '../../components/icons'

export default function AdminReviews() {
  const { notify } = useStore()
  const [status, setStatus] = useState('all')
  
  // Load data using the stable signature
  const { data, loading, error, reload } = useResource(
    () => listAllReviews({ status }),
    [status]
  )
  const reviews = data || []

  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [moderatingId, setModeratingId] = useState(null)

  const handleModerate = async (id, nextStatus) => {
    setModeratingId(id)
    try {
      await moderateReview(id, nextStatus)
      notify(`Review status updated to ${nextStatus}`)
      reload()
    } catch (err) {
      notify(err.message || 'Could not update review status')
    } finally {
      setModeratingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await deleteAdminReview(target.id)
      notify('Review permanently deleted')
      setTarget(null)
      reload()
    } catch (err) {
      notify(err.message || 'Could not delete review')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reviews Moderation" 
        subtitle={loading ? 'Loading reviews…' : `Moderate and manage all ${reviews.length} product reviews`} 
      />

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
          <label>
            <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-450 dark:text-neutral-500">Filter Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Loading review directory" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800/40 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 bg-neutral-50/50 dark:bg-neutral-800/20">
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Reviewer</th>
                  <th className="px-6 py-3.5">Rating & Comment</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/30">
                {reviews.map((r) => {
                  const customerName = r.name || 'Anonymous User'
                  
                  return (
                    <tr key={r.id} className="text-xs hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">
                        {r.productName || 'Unknown Product'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-neutral-900 dark:text-white truncate">
                          {customerName}
                        </p>
                        <p className="text-[10px] text-neutral-450 dark:text-neutral-500 truncate mt-0.5">
                          {r.user?.email || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 max-w-sm">
                        <StarRating value={r.rating} size={12} />
                        {r.comment && (
                          <p className="mt-1 text-neutral-600 dark:text-neutral-400 truncate text-[11px]">
                            {r.comment}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status || 'approved'} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status !== 'approved' && (
                            <button
                              onClick={() => handleModerate(r.id, 'approved')}
                              disabled={moderatingId === r.id}
                              className="theme-transition grid h-8.5 w-8.5 place-items-center text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl cursor-pointer disabled:opacity-30"
                              title="Approve Review"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {r.status !== 'rejected' && (
                            <button
                              onClick={() => handleModerate(r.id, 'rejected')}
                              disabled={moderatingId === r.id}
                              className="theme-transition grid h-8.5 w-8.5 place-items-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-white rounded-xl cursor-pointer disabled:opacity-30"
                              title="Reject Review"
                            >
                              <Close size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => setTarget(r)}
                            disabled={moderatingId === r.id}
                            className="theme-transition grid h-8.5 w-8.5 place-items-center text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-455 rounded-xl cursor-pointer disabled:opacity-30"
                            title="Delete Review"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {reviews.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                No reviews found
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(target)}
        title="Delete Review Comment"
        message={`The review comment from "${target?.name}" will be permanently deleted. This will re-calculate product ratings.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => (deleting ? null : setTarget(null))}
      />
    </div>
  )
}
