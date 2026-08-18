import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useStore } from '../context/useStore'
import { useAuth } from '../context/useAuth'
import { hydrateCart } from '../lib/cart'
import { currency } from '../lib/format'
import { createOrder } from '../services/orders'
import ProductImage from '../components/ProductImage'
import OrderSummary from '../components/OrderSummary'
import { Shield, Check } from '../components/icons'

const initialFor = (user) => ({
  email: user?.email || '', firstName: '', lastName: '', address: '', city: '', zip: '', country: 'United States',
  card: '', exp: '', cvc: '', name: '', method: 'card',
})

export default function Checkout() {
  const { cart, clearCart, notify } = useStore()
  const { isAuthenticated, user } = useAuth()
  const totals = hydrateCart(cart)
  const navigate = useNavigate()
  const [form, setForm] = useState(() => initialFor(user))
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)

  if (totals.items.length === 0 && !placing) return <Navigate to="/cart" replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!/^\d{4,10}$/.test(form.zip.trim())) e.zip = 'Enter a valid ZIP'
    if (form.method === 'card') {
      if (form.card.replace(/\s/g, '').length < 15) e.card = 'Enter a valid card number'
      if (!/^\d{2}\s*\/\s*\d{2}$/.test(form.exp)) e.exp = 'MM/YY'
      if (!/^\d{3,4}$/.test(form.cvc)) e.cvc = '3-4 digits'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    if (!validate()) {
      notify('Please fix the highlighted fields')
      return
    }
    // Placing an order requires a real backend session.
    if (!isAuthenticated) {
      notify('Please sign in to complete your order')
      navigate('/login?redirect=/checkout')
      return
    }

    setPlacing(true)
    const shippingAddress = `${form.firstName} ${form.lastName}, ${form.address}, ${form.city} ${form.zip}, ${form.country}`
    try {
      const order = await createOrder({
        items: totals.items.map((i) => ({ product: i.id, quantity: i.qty })),
        shippingAddress,
      })
      clearCart()
      navigate('/order-success', {
        state: { orderId: order._id, total: order.total, email: form.email },
      })
    } catch (err) {
      setPlacing(false)
      if (err.status === 401) {
        notify('Your session expired — please sign in again')
        navigate('/login?redirect=/checkout')
        return
      }
      // Stock / validation errors from the backend surface their message here.
      notify(err.message || 'Could not place your order')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* breadcrumbs */}
      <nav className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
        <Link to="/cart" className="hover:text-black transition-colors">Cart</Link>
        <span className="mx-2 text-neutral-300">/</span>
        <span className="text-neutral-600">Checkout</span>
      </nav>

      <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-neutral-900">Checkout</h1>

      {!isAuthenticated && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border border-amber-200 bg-amber-50 p-4 text-xs font-semibold uppercase tracking-wider text-amber-800">
          <span>You'll need to sign in to place this order.</span>
          <Link to="/login?redirect=/checkout" className="underline underline-offset-4 hover:text-amber-950">Sign in now</Link>
        </div>
      )}

      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section step={1} title="Contact Information">
            <Field label="Email address" error={errors.email} className="sm:col-span-2">
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputCls(errors.email)} />
            </Field>
          </Section>

          <Section step={2} title="Shipping Address">
            <Field label="First name" error={errors.firstName}>
              <input value={form.firstName} onChange={set('firstName')} className={inputCls(errors.firstName)} />
            </Field>
            <Field label="Last name" error={errors.lastName}>
              <input value={form.lastName} onChange={set('lastName')} className={inputCls(errors.lastName)} />
            </Field>
            <Field label="Address" error={errors.address} className="sm:col-span-2">
              <input value={form.address} onChange={set('address')} placeholder="123 Main Street, Apt 4" className={inputCls(errors.address)} />
            </Field>
            <Field label="City" error={errors.city}>
              <input value={form.city} onChange={set('city')} className={inputCls(errors.city)} />
            </Field>
            <Field label="ZIP / Postal code" error={errors.zip}>
              <input value={form.zip} onChange={set('zip')} className={inputCls(errors.zip)} />
            </Field>
            <Field label="Country" className="sm:col-span-2">
              <select value={form.country} onChange={set('country')} className={inputCls()}>
                {['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section step={3} title="Payment Method">
            <div className="sm:col-span-2">
              <div className="mb-4 flex flex-col sm:flex-row gap-2">
                {[
                  ['card', '💳 Credit Card'],
                  ['paypal', '🅿️ PayPal'],
                  ['cod', '💵 Cash on Delivery'],
                ].map(([v, label]) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setForm((f) => ({ ...f, method: v }))}
                    className={`flex-1 border px-3 h-11 text-[10px] font-bold tracking-widest uppercase transition-colors duration-150 rounded-none cursor-pointer ${
                      form.method === v
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {form.method === 'card' && (
              <>
                <Field label="Card number" error={errors.card} className="sm:col-span-2">
                  <input
                    inputMode="numeric"
                    value={form.card}
                    onChange={(e) => setForm((f) => ({ ...f, card: formatCard(e.target.value) }))}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className={inputCls(errors.card)}
                  />
                </Field>
                <Field label="Name on card" className="sm:col-span-2">
                  <input value={form.name} onChange={set('name')} className={inputCls()} />
                </Field>
                <Field label="Expiry (MM/YY)" error={errors.exp}>
                  <input value={form.exp} onChange={set('exp')} placeholder="MM/YY" maxLength={5} className={inputCls(errors.exp)} />
                </Field>
                <Field label="CVC" error={errors.cvc}>
                  <input inputMode="numeric" value={form.cvc} onChange={set('cvc')} placeholder="123" maxLength={4} className={inputCls(errors.cvc)} />
                </Field>
              </>
            )}
            {form.method === 'paypal' && (
              <p className="sm:col-span-2 text-xs text-neutral-400 py-2 font-medium">
                You will be redirected to the secure PayPal portal to complete your transaction in the next step.
              </p>
            )}
            {form.method === 'cod' && (
              <p className="sm:col-span-2 text-xs text-neutral-400 py-2 font-medium">
                Pay with cash or contactless card upon delivery of your items.
              </p>
            )}

            <div className="sm:col-span-2 mt-2 flex items-center gap-2 text-[9px] tracking-wider uppercase font-bold text-neutral-400 select-none">
              <Shield size={13} /> Demostore Billing · No real charges will be processed
            </div>
          </Section>
        </div>

        {/* summary sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary totals={totals}>
            <ul className="mt-5 space-y-3.5 border-t border-neutral-100 pt-5">
              {totals.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <div className="relative overflow-hidden border border-neutral-100 h-12 w-10 shrink-0">
                    <ProductImage product={i} className="h-full w-full object-cover" emojiSize="1.2rem" />
                    <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-black text-[8px] font-bold text-white leading-none">
                      {i.qty}
                    </span>
                  </div>
                  <span className="flex-1 truncate text-xs font-bold text-neutral-700 uppercase tracking-wide">{i.name}</span>
                  <span className="text-xs font-black text-neutral-900">{currency(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <button
              type="submit"
              disabled={placing}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-black py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 rounded-none cursor-pointer"
            >
              {placing ? 'Placing Order...' : <>Complete Order · {currency(totals.total)}</>}
            </button>
            <p className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-[9px] uppercase font-bold tracking-widest text-neutral-400">
              <Check size={11} className="text-emerald-600" /> Secure SSL Connection
            </p>
          </OrderSummary>
        </div>
      </form>
    </div>
  )
}

const inputCls = (err) =>
  `w-full border bg-white px-3.5 py-2.5 text-xs font-semibold outline-none transition duration-150 rounded-none ${
    err
      ? 'border-rose-400 focus:border-rose-500'
      : 'border-neutral-200 focus:border-black'
  }`

const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

function Section({ step, title, children }) {
  return (
    <section className="border border-neutral-200/60 bg-white p-6">
      <h2 className="mb-5 flex items-center gap-2.5 text-xs font-extrabold text-neutral-900 uppercase tracking-wider select-none">
        <span className="grid h-5 w-5 place-items-center bg-black text-white text-[9px] font-bold">{step}</span>
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({ label, error, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[10px] font-extrabold tracking-wider text-neutral-400 uppercase select-none">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[10px] font-bold text-rose-600 uppercase tracking-wide">{error}</span>}
    </label>
  )
}
