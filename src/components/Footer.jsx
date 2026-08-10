import { Link } from 'react-router-dom'
import { categories } from '../data/products'
import { Truck, Shield, Refresh, Headset } from './icons'

const perks = [
  { icon: Truck, title: 'Free Shipping', text: 'On orders over $75' },
  { icon: Refresh, title: '30-Day Returns', text: 'Hassle-free refund policy' },
  { icon: Shield, title: 'Secure Checkout', text: '256-bit SSL encryption' },
  { icon: Headset, title: 'Premium Support', text: '24/7 client care desk' },
]

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200/60 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Perks list */}
        <div className="grid grid-cols-2 gap-6 border-b border-neutral-200/50 py-10 md:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center bg-white border border-neutral-200 text-neutral-800 rounded-full">
                <p.icon size={15} />
              </span>
              <div>
                <p className="text-[10px] font-extrabold text-neutral-900 uppercase tracking-wider">{p.title}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5 font-medium">{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer directories */}
        <div className="grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="text-lg font-black uppercase tracking-[0.2em] text-neutral-950">BUYLY</span>
            <p className="mt-3.5 max-w-xs text-xs text-neutral-500 leading-relaxed font-medium">
              High-performance training gear engineered for comfort, versatility, and speed. Designed in-house, worn worldwide.
            </p>
            <div className="mt-6">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-900">JOIN THE LIST</h4>
              <p className="mt-1 text-[10px] text-neutral-400 font-medium">Receive 15% off your first order plus early access to new releases.</p>
              <form className="mt-4 flex max-w-sm gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className="min-w-0 flex-1 border-b border-neutral-300 bg-transparent py-2 text-xs font-semibold text-neutral-800 outline-none transition focus:border-black rounded-none"
                />
                <button className="bg-black px-6 py-2 text-[10px] font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 rounded-none cursor-pointer">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <FooterCol title="Shop" links={categories.map((c) => ({ label: c.name, to: `/shop?category=${c.id}` }))} />
          <FooterCol title="Information" links={[{ label: 'Our Story' }, { label: 'Sustainability' }, { label: 'Careers' }, { label: 'Retail Stores' }]} />
          <FooterCol title="Support" links={[{ label: 'Contact Us' }, { label: 'Shipping & Delivery' }, { label: 'Returns & Exchanges' }, { label: 'Size Guide' }]} />
        </div>

        {/* Copyright & bottom links */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-neutral-200/50 py-6 text-[10px] uppercase font-bold tracking-wider text-neutral-400 sm:flex-row">
          <p>© {new Date().getFullYear()} BUYLY PERFORMANCE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-[10px] font-extrabold text-neutral-900 uppercase tracking-widest">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l, i) => (
          <li key={i}>
            {l.to ? (
              <Link to={l.to} className="text-xs text-neutral-400 hover:text-black font-semibold transition-colors">{l.label}</Link>
            ) : (
              <a href="#" className="text-xs text-neutral-400 hover:text-black font-semibold transition-colors">{l.label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
