import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Search } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import {
  Close,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Tags,
  Users,
} from '../icons'

const sidebarItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Receipt },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/users', label: 'Customers', icon: Users },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
    isActive
      ? 'bg-neutral-950 text-white shadow-sm'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
  }`

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const SidebarInner = (
    <div className="flex h-full flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-5">
        <Link to="/admin" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-neutral-950 font-display text-sm font-black text-white">
            B
          </span>
          <span>
            <span className="block font-display text-lg font-bold leading-none text-neutral-950">Buyly</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Admin console</span>
          </span>
        </Link>
      </div>

      <div className="border-b border-neutral-200 px-3 py-3">
        <div className="flex items-center justify-between gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white text-[10px] font-bold uppercase text-neutral-700 shadow-sm ring-1 ring-neutral-200">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold leading-tight text-neutral-900">
                {user?.name || 'Admin User'}
              </p>
              <p className="mt-0.5 truncate text-[10px] font-semibold text-neutral-400">Administrator</p>
            </div>
          </div>
          <ChevronDown size={14} className="shrink-0 text-neutral-400" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Manage</p>
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-neutral-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-neutral-500 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-950">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 h-screen w-64">{SidebarInner}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-neutral-950/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950"
              aria-label="Close menu"
            >
              <Close size={20} />
            </button>
            {SidebarInner}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="relative w-full max-w-sm">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search orders, products..."
                className="w-full rounded-md border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm font-medium text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-950/5"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="relative rounded-md border border-neutral-200 bg-white p-2 text-neutral-500 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-950"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </button>

            <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2 py-1.5 shadow-sm">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-neutral-950 text-[10px] font-bold uppercase text-white">
                {user?.name?.[0] || 'A'}
              </div>
              <span className="hidden pr-1 text-xs font-bold text-neutral-700 sm:inline">
                {user?.name || 'Admin User'} <span className="font-semibold text-neutral-400">Admin</span>
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
