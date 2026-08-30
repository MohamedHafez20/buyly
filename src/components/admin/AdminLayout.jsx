import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
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
  Globe,
  Settings,
  Tag,
  Star,
  Boxes,
  Eye,
  Megaphone,
  Bag,
  ChevronDown,
} from '../icons'

const sidebarItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Receipt },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/users', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/countries', label: 'Countries', icon: Globe },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
]

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
    isActive
      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
  }`

const menuItemCls =
  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  // Guards against double-firing while the logout/redirect is in flight.
  const loggingOut = useRef(false)

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  // Close the account menu on outside-click or Escape.
  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // Sign out: close the dropdown, clear auth state, and go straight to /login
  // with a replace so the admin page leaves no history entry. Navigating to the
  // same route the auth guard would choose avoids any race/flash where the
  // dashboard briefly re-renders after the user becomes unauthenticated.
  const handleLogout = () => {
    if (loggingOut.current) return
    loggingOut.current = true
    setMenuOpen(false)
    setOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const initials = (user?.name || 'Admin User')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const SidebarInner = (
    <div className="flex h-full flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-[1.15rem]">
        <Link to="/admin" className="group flex items-center gap-3">
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 ring-1 ring-inset ring-white/15 transition-transform duration-200 group-hover:scale-[1.06]">
            <Bag size={20} strokeWidth={2.2} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="font-display text-lg font-bold leading-none tracking-tight text-neutral-950">Buyly</span>
              <span className="rounded-md bg-neutral-900 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none tracking-wider text-white">Admin</span>
            </span>
            <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Commerce Console</span>
          </span>
        </Link>
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
        <Link
          to="/admin/view-store"
          onClick={() => setOpen(false)}
          className="mb-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
        >
          <Eye size={16} />
          <span>View Store as User</span>
        </Link>
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
    <div className="flex min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-950">
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="group relative w-full max-w-md">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition group-focus-within:text-neutral-600" />
              <input
                type="text"
                placeholder="Search orders, products, customers..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/80 py-2.5 pl-10 pr-16 text-sm font-medium text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-sans text-[10px] font-bold text-neutral-400 shadow-sm md:flex">
                Ctrl&nbsp;K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/admin/view-store"
              className="hidden items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs font-bold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 sm:inline-flex"
            >
              <Eye size={15} />
              View Store
            </Link>
            <button
              aria-label="Notifications"
              className="relative rounded-xl border border-neutral-200 bg-white p-2.5 text-neutral-500 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <span className="hidden h-7 w-px bg-neutral-200 sm:block" />

            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`flex items-center gap-2.5 rounded-xl border py-1.5 pl-1.5 pr-2 transition sm:pr-2.5 ${
                  menuOpen ? 'border-neutral-300 bg-neutral-50 shadow-sm' : 'border-neutral-200 bg-white shadow-sm hover:bg-neutral-50'
                }`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-[11px] font-bold uppercase text-white ring-1 ring-inset ring-white/10">
                  {initials || 'A'}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block max-w-[10rem] truncate text-xs font-bold text-neutral-900">{user?.name || 'Admin User'}</span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Administrator</span>
                </span>
                <ChevronDown size={15} className={`hidden text-neutral-400 transition-transform duration-200 sm:block ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-950/10"
                >
                  <div className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50/60 px-4 py-3.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold uppercase text-white ring-1 ring-inset ring-white/10">
                      {initials || 'A'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-neutral-900">{user?.name || 'Admin User'}</p>
                      <p className="truncate text-xs text-neutral-400">{user?.email || 'Administrator'}</p>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <Link to="/admin/view-store" onClick={() => setMenuOpen(false)} role="menuitem" className={menuItemCls}>
                      <Eye size={16} className="text-neutral-400" />
                      View Store as User
                    </Link>
                    <Link to="/admin/settings" onClick={() => setMenuOpen(false)} role="menuitem" className={menuItemCls}>
                      <Settings size={16} className="text-neutral-400" />
                      Store Settings
                    </Link>
                  </div>
                  <div className="border-t border-neutral-100 p-1.5">
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
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
