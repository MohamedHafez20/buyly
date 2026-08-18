import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../context/useStore'
import { useAuth } from '../context/useAuth'
import { Cart, Heart, Search, Menu, Close, User, LayoutDashboard, LogOut } from './icons'
import { iconForCategory } from '../lib/categoryIcons'

const getLinkClass = (active) =>
  `text-[13px] font-medium tracking-wide py-1.5 relative transition-colors duration-250 hover:text-black cursor-pointer after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[1.5px] after:bg-black after:transition-transform after:duration-300 after:ease-out ${
    active
      ? 'text-black after:scale-x-100 font-semibold'
      : 'text-neutral-500 after:scale-x-0 hover:after:scale-x-100 after:origin-left'
  }`

export default function Navbar() {
  const { cartCount, wishlist, categories } = useStore()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()

  const params = new URLSearchParams(location.search)
  const currentCategory = params.get('category') || 'all'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close the account dropdown on outside click.
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  const submit = (e) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`)
  }

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    setOpen(false)
    navigate('/')
  }

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white/95 backdrop-blur-md ${
      scrolled
        ? 'border-b border-neutral-100 shadow-xs py-1.5'
        : 'border-b border-neutral-100/60 py-3'
    }`}>
      {/* announcement bar */}
      <div className="bg-black py-2 text-center text-[10px] font-bold tracking-[0.25em] text-white uppercase select-none">
        FREE SHIPPING ON ORDERS OVER $75 · USE CODE: FREESHIP75
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 sm:px-6">
        {/* Left Side: Brand Logo and Navigation grouped closely together */}
        <div className="flex items-center gap-8 xl:gap-12">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-neutral-700 hover:text-black p-1 transition-colors cursor-pointer"
              onClick={() => setOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={20} />
            </button>

            <Link to="/" className="flex items-center shrink-0 cursor-pointer">
              <span className="text-xl font-black uppercase tracking-[0.25em] text-neutral-900 transition-opacity hover:opacity-80">BUYLY</span>
            </Link>
          </div>

          {/* Desktop Navigation Grouped Left-Center */}
          <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">
            <Link
              to="/shop"
              className={getLinkClass(location.pathname === '/shop' && currentCategory === 'all')}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.id}`}
                className={getLinkClass(location.pathname === '/shop' && currentCategory === c.id)}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side: Search and Action Icons */}
        <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
          {/* Desktop Search box */}
          <form onSubmit={submit} className="hidden lg:block">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="w-36 xl:w-44 border border-neutral-200 bg-neutral-50/50 py-1.5 pl-8 pr-3 text-xs font-semibold text-neutral-800 outline-none transition-all focus:w-44 xl:focus:w-52 focus:border-black focus:bg-white rounded-none cursor-pointer"
              />
            </div>
          </form>

          {/* User Account */}
          {isAuthenticated ? (
            <div className="relative hidden sm:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="grid h-9 w-9 place-items-center text-neutral-500 hover:text-black rounded-full hover:bg-neutral-50 transition cursor-pointer"
                aria-label="Account menu"
              >
                <User size={18} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 z-50 w-52 border border-neutral-200 bg-white shadow-lg">
                  <div className="border-b border-neutral-100 px-4 py-3">
                    <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-[10px] font-medium text-neutral-400 truncate">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 hover:text-black transition-colors"
                    >
                      <LayoutDashboard size={15} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden sm:grid h-9 w-9 place-items-center text-neutral-500 hover:text-black rounded-full hover:bg-neutral-50 transition cursor-pointer" aria-label="Account">
              <User size={18} />
            </Link>
          )}

          {/* Wishlist */}
          <Link to="/wishlist" className="relative h-9 w-9 place-items-center text-neutral-500 hover:text-black rounded-full hover:bg-neutral-50 grid transition cursor-pointer" aria-label="Wishlist">
            <Heart size={18} />
            {wishlist.length > 0 && (
              <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-600 text-[8px] font-bold text-white leading-none">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Bag */}
          <Link to="/cart" className="relative h-9 w-9 place-items-center text-neutral-500 hover:text-black rounded-full hover:bg-neutral-50 grid transition cursor-pointer" aria-label="Cart">
            <Cart size={18} />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-black text-[8px] font-bold text-white leading-none">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* mobile search bar */}
      <div className="border-t border-neutral-100 px-4 py-2 lg:hidden">
        <form onSubmit={submit}>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sportswear..."
              className="w-full rounded-none border border-neutral-200 bg-neutral-50/50 py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:border-black focus:bg-white cursor-pointer"
            />
          </div>
        </form>
      </div>

      {/* slide-out mobile menu drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setOpen(false)} />

          {/* drawer panel */}
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white p-6 shadow-2xl flex flex-col transition-all duration-300">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <span className="text-lg font-black uppercase tracking-[0.25em] text-neutral-900">BUYLY</span>
              <button onClick={() => setOpen(false)} className="text-neutral-500 hover:text-black p-1 transition-colors cursor-pointer" aria-label="Close menu">
                <Close size={20} />
              </button>
            </div>

            <nav className="mt-6 flex-1 space-y-4 overflow-y-auto">
              <Link
                to="/shop"
                onClick={() => setOpen(false)}
                className={`block text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                  location.pathname === '/shop' && currentCategory === 'all'
                    ? 'text-black'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Shop All
              </Link>
              <div className="border-t border-neutral-100 my-4" />
              <p className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Collections</p>
              <div className="mt-2 space-y-3">
                {categories.map((c) => {
                  const Ic = iconForCategory(c)
                  const active = location.pathname === '/shop' && currentCategory === c.id
                  return (
                    <Link
                      key={c.id}
                      to={`/shop?category=${c.id}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        active
                          ? 'text-black font-extrabold'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      {Ic && <Ic size={16} className={active ? 'text-black' : 'text-neutral-400'} />}
                      <span>{c.name}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>

            <div className="border-t border-neutral-100 pt-5 mt-auto">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-[10px] font-medium text-neutral-400 truncate">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-none border border-neutral-200 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-700 transition-colors hover:bg-neutral-50 cursor-pointer"
                    >
                      <LayoutDashboard size={14} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-none bg-black py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 cursor-pointer"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-none bg-black py-3 text-center text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 cursor-pointer"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-none border border-neutral-200 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-700 transition-colors hover:bg-neutral-50 cursor-pointer"
                  >
                    Sign up
                  </Link>
                </div>
              )}
              <p className="mt-5 text-[10px] uppercase tracking-wider text-neutral-400 text-center">© {new Date().getFullYear()} Buyly Performance.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
