import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../context/useStore'
import { useAuth } from '../context/useAuth'
import AuthShell, { AuthField, SocialButton } from '../components/AuthShell'
import { Spinner } from '../components/States'
import { Mail, Lock, Eye, EyeOff } from '../components/icons'

export default function Login() {
  const { notify } = useStore()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const err = {}
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) err.email = 'Enter a valid email'
    if (form.password.length < 6) err.password = 'Password must be at least 6 characters'
    setErrors(err)
    if (Object.keys(err).length) return

    setSubmitting(true)
    try {
      const user = await login(form.email, form.password)
      notify(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(user.role === 'admin' && redirect === '/' ? '/admin' : redirect, { replace: true })
    } catch (error) {
      setSubmitting(false)
      if (error.status === 401) {
        setErrors({ password: 'Incorrect email or password' })
      } else {
        notify(error.message || 'Could not sign in')
      }
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Enter your details to continue."
      footer={
        <>
          New to Buyly?{' '}
          <Link to="/signup" className="font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
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
          autoComplete="current-password"
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

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-slate-500">
            <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900" />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => notify('Password reset is not available in this demo')}
            className="font-semibold text-slate-600 hover:text-slate-900"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 bg-slate-900 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
        >
          {submitting ? <><Spinner size={14} className="border-white/40 border-t-white" /> Signing in…</> : 'Sign in'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or</span>
        <span className="h-px flex-1 bg-slate-100" />
      </div>

      <SocialButton onClick={() => notify('Social sign-in is not available in this demo')} />
    </AuthShell>
  )
}
