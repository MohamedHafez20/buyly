import { useState } from 'react'
import { useStore } from '../../context/useStore'
import { useAuth } from '../../context/useAuth'
import { listUsers, updateUserRole, deleteUser } from '../../services/admin'
import { useResource } from '../../lib/useResource'
import { formatDate } from '../../lib/format'
import { LoadingState, ErrorState } from '../../components/States'
import { PageHeader, Card, StatusBadge } from '../../components/admin/ui'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Trash } from '../../components/icons'

export default function AdminUsers() {
  const { notify } = useStore()
  const { user: me } = useAuth()
  const { data, loading, error, reload, setData } = useResource(() => listUsers())
  const users = data || []
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const changeRole = async (id, role) => {
    setUpdatingId(id)
    try {
      const updated = await updateUserRole(id, role)
      setData((prev) => (prev || []).map((u) => (u._id === id ? { ...u, role: updated.role } : u)))
      notify(`Role updated to ${role}`)
    } catch (err) {
      notify(err.message || 'Could not update role')
    } finally {
      setUpdatingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await deleteUser(target._id)
      setData((prev) => (prev || []).filter((u) => u._id !== target._id))
      notify('User deleted')
      setTarget(null)
    } catch (err) {
      notify(err.message || 'Could not delete user')
    } finally {
      setDeleting(false)
    }
  }

  const getAvatarGradient = (name = '') => {
    const code = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const grads = [
      'from-violet-500 to-indigo-500 text-white',
      'from-blue-500 to-sky-500 text-white',
      'from-emerald-500 to-teal-500 text-white',
      'from-orange-500 to-amber-500 text-white',
      'from-rose-500 to-pink-500 text-white',
    ]
    return grads[code % grads.length]
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Users" 
        subtitle={loading ? 'Loading users…' : `Manage roles and catalog access for ${users.length} accounts`} 
      />

      {loading ? (
        <LoadingState label="Loading user directory" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800/40 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 bg-neutral-50/50 dark:bg-neutral-800/20">
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Date Joined</th>
                  <th className="px-6 py-3.5">Account Role</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/30">
                {users.map((u) => {
                  const isSelf = me?.id === u._id
                  const customerName = u.name || 'Anonymous User'
                  
                  return (
                    <tr key={u._id} className="text-xs hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr text-[10px] font-extrabold uppercase ${getAvatarGradient(customerName)}`}>
                            {customerName[0]}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-900 dark:text-white truncate">
                              {customerName} {isSelf && (
                                <span className="inline-block rounded-md bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-neutral-500 ml-1">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-neutral-450 dark:text-neutral-500 truncate mt-0.5">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {isSelf ? (
                          <StatusBadge status={u.role} />
                        ) : (
                          <select
                            value={u.role}
                            disabled={updatingId === u._id}
                            onChange={(e) => changeRole(u._id, e.target.value)}
                            className={`border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider outline-none rounded-xl transition duration-150 cursor-pointer disabled:opacity-50 ${
                              u.role === 'admin'
                                ? 'bg-neutral-950 text-white border-neutral-950 dark:bg-neutral-800 dark:border-neutral-700'
                                : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200/50 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800'
                            }`}
                          >
                            <option value="user" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">user</option>
                            <option value="admin" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setTarget(u)}
                          disabled={isSelf}
                          className="theme-transition grid h-8.5 w-8.5 place-items-center text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-455 rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ml-auto"
                          aria-label="Delete user"
                        >
                          <Trash size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                No user profiles found
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Delete User Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(target)}
        title="Delete User Account"
        message={`"${target?.name}" (${target?.email}) will be permanently deleted. This will remove all their catalog data and store settings.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => (deleting ? null : setTarget(null))}
      />
    </div>
  )
}
