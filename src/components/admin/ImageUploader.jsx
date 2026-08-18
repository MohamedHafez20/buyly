import { useRef, useState } from 'react'
import { resolveImg } from '../../lib/api'
import { uploadImages } from '../../services/upload'
import { AlertTriangle, Close, ImagePlus } from '../icons'
import { Spinner } from '../States'

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
const MAX_BYTES = 5 * 1024 * 1024

export default function ImageUploader({ value = [], onChange, max = 6 }) {
  const inputRef = useRef(null)
  const [pending, setPending] = useState([])
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type)) return 'Unsupported format. Use PNG, JPG, WEBP or GIF.'
    if (file.size > MAX_BYTES) return `"${file.name}" is too large. Maximum size is 5 MB.`
    return null
  }

  const handleFiles = async (fileList) => {
    setError(null)
    const files = Array.from(fileList)
    const room = max - value.length - pending.length
    if (room <= 0) {
      setError(`You can upload at most ${max} images`)
      return
    }

    for (const file of files.slice(0, room)) {
      const problem = validate(file)
      if (problem) {
        setError(problem)
        continue
      }

      const tempId = `${Date.now()}-${Math.random()}`
      const previewUrl = URL.createObjectURL(file)
      setPending((items) => [...items, { tempId, previewUrl, status: 'uploading' }])

      try {
        const [url] = await uploadImages(file)
        onChange([...value, url])
        setPending((items) => items.filter((item) => item.tempId !== tempId))
        URL.revokeObjectURL(previewUrl)
      } catch (err) {
        setPending((items) => items.map((item) => (item.tempId === tempId ? { ...item, status: 'error' } : item)))
        setError(err.message || 'Upload failed')
      }
    }
  }

  const handleDrag = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(event.type === 'dragenter' || event.type === 'dragover')
  }

  const removeAt = (index) => onChange(value.filter((_, itemIndex) => itemIndex !== index))
  const dismissPending = (tempId) => setPending((items) => items.filter((item) => item.tempId !== tempId))
  const atCapacity = value.length + pending.length >= max

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setDragActive(false)
          if (event.dataTransfer.files?.length) handleFiles(event.dataTransfer.files)
        }}
        className={`grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 ${dragActive ? 'rounded-lg bg-sky-50 p-1 ring-2 ring-sky-200' : ''}`}
      >
        {value.map((src, index) => (
          <div key={src + index} className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 shadow-sm">
            <img src={resolveImg(src)} alt={`Product image ${index + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            {index === 0 && (
              <span className="absolute left-2 top-2 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                Primary
              </span>
            )}
            <div className="absolute inset-0 flex items-start justify-end bg-neutral-950/20 p-2 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="grid h-8 w-8 place-items-center rounded-md bg-white text-neutral-600 shadow-md transition hover:bg-rose-600 hover:text-white"
                aria-label="Remove image"
              >
                <Close size={14} />
              </button>
            </div>
          </div>
        ))}

        {pending.map((item) => (
          <div key={item.tempId} className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
            <img src={item.previewUrl} alt="Uploading preview" className="h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 grid place-items-center bg-white/45">
              {item.status === 'uploading' ? (
                <div className="flex flex-col items-center gap-1.5">
                  <Spinner size={20} className="border-sky-200 border-t-sky-600" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Uploading</span>
                </div>
              ) : (
                <div className="px-1 text-center">
                  <AlertTriangle size={16} className="mx-auto text-rose-600" />
                  <button type="button" onClick={() => dismissPending(item.tempId)} className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-rose-600 hover:underline">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {!atCapacity && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`grid aspect-square place-items-center rounded-lg border-2 border-dashed transition ${
              dragActive
                ? 'border-sky-500 bg-sky-50 text-sky-700'
                : 'border-neutral-300 bg-neutral-50 text-neutral-400 hover:border-neutral-500 hover:bg-white hover:text-neutral-800'
            }`}
          >
            <span className="flex flex-col items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-md border border-neutral-200 bg-white">
                <ImagePlus size={18} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Add image</span>
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={(event) => {
          if (event.target.files?.length) handleFiles(event.target.files)
          event.target.value = ''
        }}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3">
        <p className="text-xs font-medium text-neutral-500">
          PNG, JPG, WEBP or GIF up to 5 MB each. The first image is used as primary.
        </p>
        <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-500">
          {value.length} / {max} images
        </span>
      </div>

      {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
    </div>
  )
}
