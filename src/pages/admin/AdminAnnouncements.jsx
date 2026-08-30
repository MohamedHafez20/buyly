import { useRef, useState } from 'react'
import { useStore } from '../../context/useStore'
import {
  listAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  reorderAnnouncements,
} from '../../services/announcements'
import { useResource } from '../../lib/useResource'
import { FONT_FAMILY_OPTIONS } from '../../lib/announcementStyle'
import { LoadingState, ErrorState, Spinner } from '../../components/States'
import { PageHeader, Card, StatusBadge, inputCls, primaryBtnCls, secondaryBtnCls } from '../../components/admin/ui'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import AnnouncementBarView from '../../components/AnnouncementBarView'
import { Pencil, Trash, Save, Close } from '../../components/icons'

// Default STYLE values (mirror the backend model). Content + behaviour are kept
// when resetting style; only these visual fields are restored.
const DEFAULT_STYLE = {
  backgroundType: 'solid',
  backgroundColor: '#111111',
  textColor: '#ffffff',
  accentColor: '#facc15',
  fontFamily: 'system',
  fontSize: 'md',
  fontWeight: 'medium',
  textTransform: 'none',
  letterSpacing: 0,
  textAlign: 'center',
  paddingY: 10,
  borderRadius: 0,
  borderColor: '',
  borderWidth: 0,
  icon: '',
}

const DEFAULT_BAR = {
  message: '', promoCode: '', linkUrl: '', linkText: '',
  ...DEFAULT_STYLE,
  isActive: true, startDate: '', endDate: '', dismissible: true,
  animation: 'none', autoRotateSeconds: 5,
}

const ICON_CHOICES = ['', '🚚', '🎉', '🔥', '⭐', '💸', '🎁', '⏰', '🛍️', '✨']
const GRADIENT_PRESETS = [
  'linear-gradient(90deg,#6d28d9,#db2777)',
  'linear-gradient(90deg,#0ea5e9,#22c55e)',
  'linear-gradient(90deg,#f59e0b,#ef4444)',
  'linear-gradient(90deg,#111827,#374151)',
]

// Normalise an API bar into editable form state (dates → yyyy-mm-dd inputs).
const toForm = (bar) => ({
  ...DEFAULT_BAR,
  ...bar,
  startDate: bar.startDate ? String(bar.startDate).slice(0, 10) : '',
  endDate: bar.endDate ? String(bar.endDate).slice(0, 10) : '',
})

export default function AdminAnnouncements() {
  const { notify } = useStore()
  const { data, loading, error, reload, setData } = useResource(() => listAllAnnouncements())
  const bars = data || []

  const [editing, setEditing] = useState(null) // bar id | 'new' | null
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // --- drag-to-reorder ---
  const dragFrom = useRef(null)
  const onDrop = async (toIndex) => {
    const from = dragFrom.current
    dragFrom.current = null
    if (from === null || from === toIndex) return
    const next = [...bars]
    const [moved] = next.splice(from, 1)
    next.splice(toIndex, 0, moved)
    setData(next) // optimistic
    try {
      const saved = await reorderAnnouncements(next.map((b) => b.id))
      setData(saved)
      notify('Order updated')
    } catch (err) {
      notify(err.message || 'Could not reorder')
      reload()
    }
  }

  const confirmDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await deleteAnnouncement(target.id)
      notify('Announcement deleted')
      setTarget(null)
      reload()
    } catch (err) {
      notify(err.message || 'Could not delete')
    } finally {
      setDeleting(false)
    }
  }

  const editingBar = editing && editing !== 'new' ? bars.find((b) => b.id === editing) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcement Bars"
        subtitle={loading ? 'Loading…' : `${bars.length} bar${bars.length !== 1 ? 's' : ''} — drag to reorder`}
      >
        {!editing && <button onClick={() => setEditing('new')} className={primaryBtnCls}>Add Bar</button>}
      </PageHeader>

      {editing ? (
        <AnnouncementEditor
          key={editing}
          initial={editing === 'new' ? DEFAULT_BAR : toForm(editingBar)}
          isNew={editing === 'new'}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload() }}
          notify={notify}
        />
      ) : loading ? (
        <LoadingState label="Loading announcement bars" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : bars.length === 0 ? (
        <Card><div className="py-12 text-center text-xs font-bold uppercase tracking-wider text-neutral-400">No announcement bars yet</div></Card>
      ) : (
        <Card>
          <ul className="divide-y divide-neutral-100">
            {bars.map((b, i) => (
              <li
                key={b.id}
                draggable
                onDragStart={() => { dragFrom.current = i }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50/70"
              >
                <span className="cursor-grab select-none text-neutral-300" title="Drag to reorder">⠿</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {b.icon && <span>{b.icon}</span>}
                    <p className="truncate font-display font-bold text-neutral-900">{b.message}</p>
                  </div>
                  <p className="mt-0.5 text-[11px] font-semibold text-neutral-400">
                    {schedule(b)}
                  </p>
                </div>
                {/* Tiny live thumbnail of the bar */}
                <div className="hidden w-56 overflow-hidden rounded md:block" style={{ fontSize: 10 }}>
                  <AnnouncementBarView bar={b} />
                </div>
                <StatusBadge status={b.isActive ? 'active' : 'draft'} />
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setEditing(b.id)} className="grid h-8.5 w-8.5 place-items-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900" aria-label="Edit"><Pencil size={15} /></button>
                  <button onClick={() => setTarget(b)} className="grid h-8.5 w-8.5 place-items-center rounded-xl text-neutral-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete"><Trash size={15} /></button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete Announcement Bar"
        message={`"${target?.message}" will be permanently removed.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => (deleting ? null : setTarget(null))}
      />
    </div>
  )
}

const schedule = (b) => {
  const s = b.startDate ? new Date(b.startDate).toLocaleDateString() : null
  const e = b.endDate ? new Date(b.endDate).toLocaleDateString() : null
  if (s && e) return `Scheduled ${s} → ${e}`
  if (s) return `Starts ${s}`
  if (e) return `Ends ${e}`
  return 'Always on'
}

// ---------------------------------------------------------------------------
// Editor: holds the in-progress form state, drives the LIVE PREVIEW with it, and
// saves through the backend (which owns all validation).
// ---------------------------------------------------------------------------
function AnnouncementEditor({ initial, isNew, onCancel, onSaved, notify }) {
  const [form, setForm] = useState(() => ({ ...initial }))
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const resetStyle = () => setForm((f) => ({ ...f, ...DEFAULT_STYLE }))

  // Switching background type swaps in a sensible default value so the preview
  // always reflects the chosen type (hex for solid, gradient string for gradient).
  const changeBgType = (v) => setForm((f) => {
    if (v === f.backgroundType) return f
    if (v === 'gradient') {
      const isGrad = /-gradient\(/.test(f.backgroundColor)
      return { ...f, backgroundType: 'gradient', backgroundColor: isGrad ? f.backgroundColor : GRADIENT_PRESETS[0] }
    }
    const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(f.backgroundColor)
    return { ...f, backgroundType: 'solid', backgroundColor: isHex ? f.backgroundColor : '#111111' }
  })

  const save = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    setSaving(true)
    // Convert empty date strings to null so the backend treats them as "unset".
    const payload = { ...form, startDate: form.startDate || null, endDate: form.endDate || null }
    try {
      if (isNew) await createAnnouncement(payload)
      else await updateAnnouncement(form.id, payload)
      notify(isNew ? 'Announcement created' : 'Announcement updated')
      onSaved()
    } catch (err) {
      // Surface backend field-level validation errors on the form.
      const fields = err.data?.error?.fields
      if (fields) setFieldErrors(fields)
      notify(err.message || 'Could not save — check the highlighted fields')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* LIVE PREVIEW — the exact storefront component fed the in-progress form. */}
      <Card className="overflow-hidden">
        <div className="border-b border-neutral-100 px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
          Live preview
        </div>
        <div className="bg-neutral-50 p-4">
          <div className="overflow-hidden rounded-lg shadow-sm">
            <AnnouncementBarView bar={form} animate={form.animation} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CONTENT */}
        <Card className="p-5 space-y-4">
          <SectionLabel>Content</SectionLabel>
          <Field label="Message" error={fieldErrors.message}>
            <input value={form.message} onChange={(e) => set('message', e.target.value)} className={inputCls} placeholder="Free shipping on orders over $75" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Promo code (optional)"><input value={form.promoCode} onChange={(e) => set('promoCode', e.target.value)} className={inputCls} /></Field>
            <Field label="Icon (optional)">
              <div className="flex flex-wrap gap-1">
                {ICON_CHOICES.map((ic) => (
                  <button type="button" key={ic || 'none'} onClick={() => set('icon', ic)}
                    className={`h-9 w-9 rounded-lg border text-base ${form.icon === ic ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                    {ic || '∅'}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Link URL (optional)"><input value={form.linkUrl} onChange={(e) => set('linkUrl', e.target.value)} className={inputCls} placeholder="/shop" /></Field>
            <Field label="Link text (optional)"><input value={form.linkText} onChange={(e) => set('linkText', e.target.value)} className={inputCls} placeholder="Shop Now" /></Field>
          </div>
        </Card>

        {/* BEHAVIOR */}
        <Card className="p-5 space-y-4">
          <SectionLabel>Behaviour</SectionLabel>
          <div className="flex flex-wrap gap-4">
            <Toggle label="Active" checked={form.isActive} onChange={(v) => set('isActive', v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date" error={fieldErrors.startDate}><input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputCls} /></Field>
            <Field label="End date" error={fieldErrors.endDate}><input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Animation">
              <select value={form.animation} onChange={(e) => set('animation', e.target.value)} className={inputCls}>
                <option value="none">None</option>
                <option value="slide-in">Slide in</option>
                <option value="fade">Fade</option>
              </select>
            </Field>
            <Range label={`Auto-rotate: ${form.autoRotateSeconds}s`} min={2} max={60} value={form.autoRotateSeconds} onChange={(v) => set('autoRotateSeconds', v)} />
          </div>
        </Card>

        {/* COLOURS */}
        <Card className="p-5 space-y-4">
          <SectionLabel>Colours & background</SectionLabel>
          <Field label="Background type">
            <Segmented value={form.backgroundType} onChange={changeBgType}
              options={[['solid', 'Solid'], ['gradient', 'Gradient']]} />
          </Field>
          {form.backgroundType === 'solid' ? (
            <ColorField label="Background colour" value={form.backgroundColor} onChange={(v) => set('backgroundColor', v)} error={fieldErrors.backgroundColor} />
          ) : (
            <Field label="Gradient (CSS)" error={fieldErrors.backgroundColor}>
              <input value={form.backgroundColor} onChange={(e) => set('backgroundColor', e.target.value)} className={inputCls} placeholder="linear-gradient(90deg,#f00,#00f)" />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {GRADIENT_PRESETS.map((g) => (
                  <button type="button" key={g} onClick={() => set('backgroundColor', g)} className="h-7 w-12 rounded border border-neutral-200" style={{ background: g }} aria-label="Use gradient" />
                ))}
              </div>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Text colour" value={form.textColor} onChange={(v) => set('textColor', v)} error={fieldErrors.textColor} />
            <ColorField label="Accent colour" value={form.accentColor} onChange={(v) => set('accentColor', v)} error={fieldErrors.accentColor} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Border colour" value={form.borderColor || '#000000'} onChange={(v) => set('borderColor', v)} error={fieldErrors.borderColor} allowClear onClear={() => set('borderColor', '')} cleared={!form.borderColor} />
            <Range label={`Border width: ${form.borderWidth}px`} min={0} max={10} value={form.borderWidth} onChange={(v) => set('borderWidth', v)} />
          </div>
        </Card>

        {/* TYPOGRAPHY & SPACING */}
        <Card className="p-5 space-y-4">
          <SectionLabel>Typography & spacing</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Font family">
              <select value={form.fontFamily} onChange={(e) => set('fontFamily', e.target.value)} className={inputCls}>
                {FONT_FAMILY_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </Field>
            <Field label="Font size" error={fieldErrors.fontSize}>
              <select value={form.fontSize} onChange={(e) => set('fontSize', e.target.value)} className={inputCls}>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Font weight">
              <select value={form.fontWeight} onChange={(e) => set('fontWeight', e.target.value)} className={inputCls}>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="bold">Bold</option>
              </select>
            </Field>
            <Field label="Text transform">
              <select value={form.textTransform} onChange={(e) => set('textTransform', e.target.value)} className={inputCls}>
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </Field>
          </div>
          <Field label="Alignment">
            <Segmented value={form.textAlign} onChange={(v) => set('textAlign', v)} options={[['left', 'Left'], ['center', 'Center'], ['right', 'Right']]} />
          </Field>
          <Range label={`Letter spacing: ${form.letterSpacing}px`} min={-5} max={20} value={form.letterSpacing} onChange={(v) => set('letterSpacing', v)} error={fieldErrors.letterSpacing} />
          <Range label={`Vertical padding: ${form.paddingY}px`} min={0} max={60} value={form.paddingY} onChange={(v) => set('paddingY', v)} error={fieldErrors.paddingY} />
          <Range label={`Border radius: ${form.borderRadius}px`} min={0} max={40} value={form.borderRadius} onChange={(v) => set('borderRadius', v)} error={fieldErrors.borderRadius} />
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className={primaryBtnCls}>
          {saving ? <><Spinner size={13} className="border-white/40 border-t-white" /> Saving…</> : <><Save size={14} /> {isNew ? 'Create bar' : 'Save changes'}</>}
        </button>
        <button type="button" onClick={resetStyle} className={secondaryBtnCls}>Reset to default style</button>
        <button type="button" onClick={onCancel} className="ml-auto inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-neutral-500 hover:text-neutral-900">
          <Close size={15} /> Cancel
        </button>
      </div>
    </form>
  )
}

// --- small presentational helpers ---
function SectionLabel({ children }) {
  return <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">{children}</h2>
}
function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-rose-600">{error}</span>}
    </label>
  )
}
function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 text-xs font-bold text-neutral-700">
      <span className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-neutral-900' : 'bg-neutral-300'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-4' : 'left-0.5'}`} />
      </span>
      {label}
    </button>
  )
}
function Segmented({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg border border-neutral-200 p-0.5">
      {options.map(([v, label]) => (
        <button type="button" key={v} onClick={() => onChange(v)}
          className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${value === v ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'}`}>
          {label}
        </button>
      ))}
    </div>
  )
}
function Range({ label, min, max, value, onChange, error }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-neutral-900" />
      {error && <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-rose-600">{error}</span>}
    </label>
  )
}
function ColorField({ label, value, onChange, error, allowClear, onClear, cleared }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 shrink-0 cursor-pointer rounded border border-neutral-200 bg-white p-0.5" />
        <input value={cleared ? '' : value} onChange={(e) => onChange(e.target.value)} placeholder={allowClear ? 'none' : '#000000'} className={`${inputCls} font-mono`} />
        {allowClear && !cleared && <button type="button" onClick={onClear} className="text-[10px] font-bold uppercase text-neutral-400 hover:text-rose-600">clear</button>}
      </div>
      {error && <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-rose-600">{error}</span>}
    </label>
  )
}
