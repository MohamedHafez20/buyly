import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/useStore'
import { useAuth } from '../context/useAuth'
import AuthShell, { AuthField, SocialButton } from '../components/AuthShell'
import { Spinner } from '../components/States'
import { User, Mail, Lock, Eye, EyeOff } from '../components/icons'

export default function Signup() {
  const { notify } = useStore()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [agree, setAgree] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const err = {}
    if (!form.name.trim()) err.name = 'Enter your name'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) err.email = 'Enter a valid email'
    if (form.password.length < 6) err.password = 'Use at least 6 characters'
    if (form.confirm !== form.password) err.confirm = 'Passwords do not match'
    setErrors(err)
    if (Object.keys(err).length) return
    if (!agree) {
      notify('Please accept the Terms to continue')
      return
    }

    setSubmitting(true)
    try {
      const user = await register(form.name.trim(), form.email, form.password)
      notify(`Account created — welcome, ${user.name.split(' ')[0]}!`)
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitting(false)
      if (error.status === 409) {
        setErrors({ email: 'That email is already registered' })
      } else {
        notify(error.message || 'Could not create your account')
      }
    }
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Join Buyly for faster checkout, order tracking, and members-only deals."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <AuthField
          icon={User}
          type="text"
          value={form.name}
          onChange={set('name')}
          placeholder="Full name"
          autoComplete="name"
          error={errors.name}
        />
        <AuthField
          icon={Mail}
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="Email address"
          autoComplete="email"
          error={errors.email}
        />
        <AuthField
          icon={Lock}
          type={showPw ? 'text' : 'password'}
          value={form.password}
          onChange={set('password')}
          placeholder="Password"
          autoComplete="new-password"
          error={errors.password}
          trailing={
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />
        <AuthField
          icon={Lock}
          type={showPw ? 'text' : 'password'}
          value={form.confirm}
          onChange={set('confirm')}
          placeholder="Confirm password"
          autoComplete="new-password"
          error={errors.confirm}
        />

        <label className="flex items-start gap-2.5 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 accent-slate-900"
          />
          <span>
            I agree to Buyly&apos;s <span className="font-semibold text-slate-700">Terms of Service</span> and{' '}
            <span className="font-semibold text-slate-700">Privacy Policy</span>.
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 bg-slate-900 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
        >
          {submitting ? <><Spinner size={14} className="border-white/40 border-t-white" /> Creating…</> : 'Create account'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or</span>
        <span className="h-px flex-1 bg-slate-100" />
      </div>

      <SocialButton onClick={() => notify('Social sign-up is not available in this demo')} />
    </AuthShell>
  )
}
