import { useState } from 'react'
import { useStore } from '../../context/useStore'
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../services/categories'
import { useResource } from '../../lib/useResource'
import { resolveImg } from '../../lib/api'
import { LoadingState, ErrorState, Spinner } from '../../components/States'
import { PageHeader, Card, StatusBadge } from '../../components/admin/ui'
import ImageUploader from '../../components/admin/ImageUploader'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Pencil, Trash, Save, Close, Tags } from '../../components/icons'

const iconOptions = ['shirt', 'layers', 'wind', 'footprints', 'watch']
const blank = { name: '', description: '', icon: 'shirt', status: 'active', image: '' }

export default function AdminCategories() {
  const { notify, reloadCategories } = useStore()
  const { data, loading, error, reload } = useResource(() => listCategories())
  const categories = data || []

  const [editing, setEditing] = useState(null) // category id or 'new' or null
  const [form, setForm] = useState(blank)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const startNew = () => {
    setForm(blank)
    setFormError('')
    setEditing('new')
  }
  const startEdit = (c) => {
    setForm({ name: c.name, description: c.description || '', icon: c.icon || 'shirt', status: c.status || 'active', image: c.image || '' })
    setFormError('')
    setEditing(c.id)
  }
  const cancel = () => {
    setEditing(null)
    setForm(blank)
    setFormError('')
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setFormError('Category name is required')
      return
    }
    setFormError('')
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon,
      status: form.status,
      image: form.image || '',
    }
    try {
      if (editing === 'new') {
        await createCategory(payload)
        notify('Category created')
      } else {
        await updateCategory(editing, payload)
        notify('Category updated')
      }
      cancel()
      reload()
      reloadCategories()
    } catch (err) {
      setSaving(false)
      if (err.status === 409) setFormError('A category with that name already exists')
      else setFormError(err.message || 'Could not save category')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await deleteCategory(target.id)
      notify('Category deleted')
      setTarget(null)
      reload()
      reloadCategories()
    } catch (err) {
      notify(err.message || 'Could not delete category')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Categories" 
        subtitle={loading ? 'Loading categories…' : `Manage and structure your ${categories.length} store categories`}
      >
        {!editing && (
          <button
            onClick={startNew}
            className="theme-transition inline-flex items-center gap-2 bg-neutral-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 rounded-xl shadow-xs"
          >
            Add Category
          </button>
        )}
      </PageHeader>

      {/* Editing Form Card */}
      {editing && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/40 pb-3">
            <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
              {editing === 'new' ? 'Create New Category' : 'Modify Category'}
            </h2>
            <button 
              onClick={cancel} 
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" 
              aria-label="Close form"
            >
              <Close size={18} />
            </button>
          </div>

          <form onSubmit={save} className="grid gap-4.5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Name</span>
              <input 
                value={form.name} 
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
                className={inputCls} 
                placeholder="e.g. Short Sleeves" 
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Icon Type</span>
              <select 
                value={form.icon} 
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} 
                className={inputCls}
              >
                {iconOptions.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Description</span>
              <input 
                value={form.description} 
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
                className={inputCls} 
                placeholder="e.g. Lightweight & breathable training tees for fitness" 
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Visibility Status</span>
              <select 
                value={form.status} 
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} 
                className={inputCls}
              >
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
            
            <div className="sm:col-span-2 space-y-1.5">
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Category Cover Image</span>
              <ImageUploader value={form.image ? [form.image] : []} onChange={(imgs) => setForm((f) => ({ ...f, image: imgs[0] || '' }))} max={1} />
            </div>

            {formError && (
              <p className="sm:col-span-2 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {formError}
              </p>
            )}

            <div className="sm:col-span-2 flex flex-wrap items-center gap-3 border-t border-neutral-100 dark:border-neutral-800/40 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="theme-transition inline-flex items-center gap-2 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-neutral-850 dark:hover:bg-neutral-100 disabled:opacity-60 rounded-xl"
              >
                {saving ? (
                  <>
                    <Spinner size={13} className="border-white/40 border-t-white dark:border-neutral-900/40 dark:border-t-neutral-900" /> 
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={13} /> 
                    Save Category
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={cancel} 
                className="theme-transition px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <LoadingState label="Loading category items" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800/40 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 bg-neutral-50/50 dark:bg-neutral-800/20">
                  <th className="px-6 py-3.5">Category Details</th>
                  <th className="px-6 py-3.5">Icon Slug</th>
                  <th className="px-6 py-3.5">Products Count</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/30">
                {categories.map((c) => (
                  <tr key={c.id} className="text-xs hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 flex items-center justify-center text-neutral-400">
                          {resolveImg(c.image) ? (
                            <img src={resolveImg(c.image)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Tags size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-bold text-neutral-900 dark:text-white truncate">
                            {c.name}
                          </p>
                          <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                            {c.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-500 dark:text-neutral-400">
                      {c.icon || 'shirt'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-lg bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-extrabold text-neutral-700 dark:text-neutral-300">
                        {c.productCount} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => startEdit(c)} 
                          className="theme-transition grid h-8.5 w-8.5 place-items-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl cursor-pointer" 
                          aria-label="Edit category"
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          onClick={() => setTarget(c)} 
                          className="theme-transition grid h-8.5 w-8.5 place-items-center text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl cursor-pointer" 
                          aria-label="Delete category"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {categories.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                No categories available yet
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(target)}
        title="Delete Category"
        message={`"${target?.name}" will be permanently removed. Note that categories still containing active products cannot be deleted.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => (deleting ? null : setTarget(null))}
      />
    </div>
  )
}

const inputCls =
  'w-full border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-neutral-950 dark:text-white px-3.5 py-2.5 text-xs font-semibold outline-none transition duration-150 focus:border-neutral-950 dark:focus:border-white focus:ring-4 focus:ring-neutral-950/5 dark:focus:ring-white/5 rounded-xl'
