import { useRef, useState } from 'react'
import { ChevronUp, ChevronDown, Close, Plus, ImagePlus } from '../icons'
import { resolveImg } from '../../lib/api'
import { uploadImages } from '../../services/upload'
import { Spinner } from '../States'

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
// The native <input type="color"> needs a full #rrggbb value; fall back to black
// while the admin is still typing a hex by hand.
const safeHex = (hex) => (HEX_RE.test(hex) ? hex : '#000000')

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
const MAX_BYTES = 5 * 1024 * 1024

// A single color row's image control: upload one photo shown as the storefront
// hero when this swatch is selected. Reuses the shared upload service.
function ColorImage({ src, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const pick = async (file) => {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) return setError('Use PNG, JPG, WEBP or GIF')
    if (file.size > MAX_BYTES) return setError('Max size is 5 MB')
    setError(null)
    setUploading(true)
    try {
      const [url] = await uploadImages(file)
      onChange(url)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title={src ? 'Change color image' : 'Add color image'}
        className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-400 transition hover:border-neutral-950 hover:text-neutral-900 dark:hover:border-white dark:hover:text-white"
      >
        {uploading ? (
          <Spinner size={14} className="border-neutral-300 border-t-neutral-800" />
        ) : src ? (
          <img src={resolveImg(src)} alt="Color" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus size={15} />
        )}
      </button>
      {src && !uploading && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="mt-1 block w-full text-center text-[8px] font-bold uppercase tracking-wider text-neutral-400 hover:text-rose-600"
        >
          Remove
        </button>
      )}
      {error && <p className="mt-1 w-16 text-[8px] font-bold text-rose-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(e) => {
          if (e.target.files?.[0]) pick(e.target.files[0])
          e.target.value = ''
        }}
        className="hidden"
      />
    </div>
  )
}

// Editor for a product's color variants. Each variant is { name, hex, image }.
// Supports add / edit (name + color picker + image) / remove / reorder.
export default function ColorsEditor({ value = [], onChange }) {
  const update = (index, patch) =>
    onChange(value.map((c, i) => (i === index ? { ...c, ...patch } : c)))

  const add = () => onChange([...value, { name: '', hex: '#111111', image: '' }])
  const remove = (index) => onChange(value.filter((_, i) => i !== index))

  const move = (index, dir) => {
    const target = index + dir
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 px-4 py-6 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          No colors yet — add the variants shoppers can choose from.
        </p>
      )}

      {value.map((color, index) => (
        <div
          key={index}
          className="flex flex-wrap items-center gap-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2.5"
        >
          {/* Color picker swatch */}
          <label className="relative shrink-0" title="Pick color">
            <span
              className="block h-9 w-9 rounded-lg border border-black/10 shadow-inner"
              style={{ backgroundColor: safeHex(color.hex) }}
            />
            <input
              type="color"
              value={safeHex(color.hex)}
              onChange={(e) => update(index, { hex: e.target.value })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label={`Color for variant ${index + 1}`}
            />
          </label>

          {/* Name */}
          <input
            value={color.name}
            onChange={(e) => update(index, { name: e.target.value })}
            placeholder="e.g. Navy Blue"
            className="min-w-[7rem] flex-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-950 dark:text-white outline-none transition focus:border-neutral-950 dark:focus:border-white focus:ring-4 focus:ring-neutral-950/5 dark:focus:ring-white/5"
          />

          {/* Hex value (editable) */}
          <input
            value={color.hex}
            onChange={(e) => {
              let hex = e.target.value.trim()
              if (hex && !hex.startsWith('#')) hex = `#${hex}`
              update(index, { hex })
            }}
            placeholder="#1E3A8A"
            spellCheck={false}
            className="w-24 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2.5 py-2 font-mono text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-200 outline-none transition focus:border-neutral-950 dark:focus:border-white"
          />

          {/* Per-color image (optional) — shown as hero when this swatch is picked */}
          <ColorImage src={color.image} onChange={(image) => update(index, { image })} />

          {/* Reorder */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              className="grid h-8 w-7 place-items-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-neutral-800 dark:hover:text-white"
              aria-label="Move color up"
            >
              <ChevronUp size={15} />
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === value.length - 1}
              className="grid h-8 w-7 place-items-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-neutral-800 dark:hover:text-white"
              aria-label="Move color down"
            >
              <ChevronDown size={15} />
            </button>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => remove(index)}
            className="grid h-8 w-8 place-items-center rounded-md text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
            aria-label="Remove color"
          >
            <Close size={15} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 transition hover:border-neutral-950 hover:text-neutral-950 dark:hover:border-white dark:hover:text-white"
      >
        <Plus size={14} /> Add color
      </button>
    </div>
  )
}
