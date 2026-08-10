import { useStore } from '../context/useStore'
import { Check } from './icons'

export default function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        key={toast.id}
        className="flex animate-[toast_.3s_ease-out] items-center gap-2.5 bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-xl"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
          <Check size={13} />
        </span>
        {toast.message}
      </div>
    </div>
  )
}
