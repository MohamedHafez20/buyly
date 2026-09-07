import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../context/useStore'
import { useAuth } from '../context/useAuth'
import NotificationBell from './NotificationBell'
import {
  Cart,
  Heart,
  Search,
  Menu,
  Close,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Bag,
  Bell,
} from './icons'
import { iconForCategory } from '../lib/categoryIcons'
import { isAdminStorePreview } from '../lib/adminStorePreview'

export default function Navbar() {
  const { cartCount, wishlist, categories } = useStore()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [country, setCountry] = useState('EGYPT')
  const [countryOpen, setCountryOpen] = useState(false)
  const [collectionsOpen, setCollectionsOpen] = useState(false)

  const menuRef = useRef(null)
  const countryRef = useRef(null)
  const collectionsRef = useRef(null)
  const searchInputRef = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()

  const params = new URLSearchParams(location.search)
  const currentCategory = params.get('category') || 'all'
  const currentGender = params.get('gender') || 'all'
  const isSale = location.search.includes('sort=discount')
  const adminPreview = isAdminStorePreview()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (countryRef.current && !countryRef.current.contains(e.target)) setCountryOpen(false)
      if (collectionsRef.current && !collectionsRef.current.contains(e.target)) setCollectionsOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Close dropdowns & drawers on route change
  useEffect(() => {
    queueMicrotask(() => {
      setOpen(false)
      setSearchOpen(false)
      setMenuOpen(false)
      setCountryOpen(false)
      setCollectionsOpen(false)
    })
  }, [location.pathname, location.search])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const submitSearch = (e) => {
    e?.preventDefault()
    if (!q.trim()) return
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`)
    setSearchOpen(false)
  }

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  const navLinkClass = (active) =>
    `relative py-1 text-xs font-black uppercase tracking-[0.16em] transition-colors duration-200 whitespace-nowrap cursor-pointer ${
      active
        ? 'text-neutral-950 after:scale-x-100'
        : 'text-neutral-600 hover:text-neutral-950 after:scale-x-0 hover:after:scale-x-100'
    } after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-neutral-950 after:transition-transform after:duration-200 after:origin-left`

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white/95 backdrop-blur-md ${
        scrolled ? 'border-b border-neutral-200/90 shadow-xs' : 'border-b border-neutral-200/60'
      }`}
    >
      {/* Main Navbar Bar */}
      <div className="relative mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LEFT SECTION: Mobile Hamburger + Desktop Primary Nav Links */}
        <div className="flex items-center gap-6">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="lg:hidden -ml-2 grid h-10 w-10 place-items-center rounded-full text-neutral-800 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
            onClick={() => setOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link
              to="/shop"
              className={navLinkClass(location.pathname === '/shop' && currentCategory === 'all' && currentGender === 'all' && !isSale)}
            >
              Shop All
            </Link>

            <Link
              to="/shop?gender=men"
              className={navLinkClass(currentGender === 'men')}
            >
              Men
            </Link>

            <Link
              to="/shop?gender=women"
              className={navLinkClass(currentGender === 'women')}
            >
              Women
            </Link>

            {/* Collections Dropdown */}
            <div className="relative" ref={collectionsRef}>
              <button
                type="button"
                onClick={() => setCollectionsOpen((s) => !s)}
                className={`flex items-center gap-1 py-1 text-xs font-black uppercase tracking-[0.16em] transition-colors cursor-pointer ${
                  collectionsOpen || currentCategory !== 'all'
                    ? 'text-neutral-950'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <span>Collections</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${collectionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {collectionsOpen && (
                <div className="absolute left-0 top-8 z-50 w-56 border border-neutral-200 bg-white py-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-1.5 border-b border-neutral-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">All Categories</p>
                  </div>
                  <div className="py-1">
                    {categories.map((c) => {
                      const Ic = iconForCategory(c)
                      return (
                        <Link
                          key={c.id}
                          to={`/shop?category=${c.id}`}
                          onClick={() => setCollectionsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
                        >
                          {Ic && <Ic size={14} className="text-neutral-400" />}
                          <span>{c.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sale Link with Accent Tag */}
            <Link
              to="/shop?sort=discount"
              className="relative py-1 text-xs font-black uppercase tracking-[0.16em] text-rose-600 hover:text-rose-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Sale
              <span className="ml-1.5 inline-block bg-rose-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 leading-none rounded-xs">
                Hot
              </span>
            </Link>
          </nav>
        </div>

        {/* CENTER SECTION: Brand Logo (Mathematically Centered on Desktop) */}
        <div className="flex items-center justify-center lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-10">
          <Link to="/" className="flex items-center group cursor-pointer" aria-label="Buyly Home">
            <span className="text-xl sm:text-2xl font-black uppercase tracking-[0.28em] text-neutral-950 transition-opacity group-hover:opacity-80">
              BUYLY
            </span>
          </Link>
        </div>

        {/* RIGHT SECTION: Action Buttons (Search, Notifications, Country, Wishlist, User, Cart) */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={() => setSearchOpen((s) => !s)}
            className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
            aria-label="Search Store"
          >
            <Search size={18} />
          </button>

          {/* Notifications Bell — live user notification feed */}
          <NotificationBell />

          {/* Country / Region Selector Indicator */}
          <div className="relative hidden md:block" ref={countryRef}>
            <button
              type="button"
              onClick={() => setCountryOpen((s) => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-800 transition-colors cursor-pointer"
              aria-label="Select Country"
            >
              <span>{country}</span>
              <ChevronDown size={11} className="text-neutral-500" />
            </button>

            {countryOpen && (
              <div className="absolute right-0 top-10 z-50 w-40 border border-neutral-200 bg-white py-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 border-b border-neutral-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Select Region</p>
                </div>
                {['EGYPT', 'UNITED STATES', 'UNITED KINGDOM', 'UAE', 'SAUDI ARABIA'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCountry(c)
                      setCountryOpen(false)
                    }}
                    className={`block w-full px-3 py-1.5 text-left text-[10px] font-bold tracking-wider uppercase transition-colors hover:bg-neutral-50 cursor-pointer ${
                      country === c ? 'text-black font-black bg-neutral-100' : 'text-neutral-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <Link
            to="/wishlist"
            className="relative grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart size={18} />
            {wishlist.length > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-rose-600 text-[8px] font-black text-white leading-none ring-2 ring-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* User Account Button & Dropdown */}
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((s) => !s)}
                className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
                aria-label="User Account Menu"
              >
                <User size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 z-50 w-56 border border-neutral-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="border-b border-neutral-100 px-4 py-3">
                    <p className="text-xs font-black text-neutral-950 truncate uppercase tracking-wider">{user.name}</p>
                    <p className="text-[10px] font-medium text-neutral-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
                  >
                    <Bag size={15} /> My Orders
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
                  >
                    <Bell size={15} /> Notifications
                  </Link>
                  {isAdmin && !adminPreview && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
                    >
                      <LayoutDashboard size={15} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
              aria-label="Sign in"
            >
              <User size={18} />
            </Link>
          )}

          {/* Cart Bag Button */}
          <Link
            to="/cart"
            className="relative grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
            aria-label="Shopping Cart"
          >
            <Cart size={18} />
            {cartCount > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-neutral-950 text-[8px] font-black text-white leading-none ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* SEARCH SLIDE-DOWN OVERLAY */}
      {searchOpen && (
        <div className="border-t border-neutral-200 bg-white shadow-lg animate-in slide-in-from-top-1 duration-200">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
            <form onSubmit={submitSearch} className="relative flex items-center">
              <Search size={18} className="pointer-events-none absolute left-4 text-neutral-400" />
              <input
                ref={searchInputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products, compression, hoodies, accessories..."
                className="w-full border border-neutral-200 bg-neutral-50/80 py-3 pl-12 pr-12 text-sm font-semibold text-neutral-950 outline-none transition focus:border-black focus:bg-white rounded-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 p-1.5 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                aria-label="Close Search"
              >
                <Close size={18} />
              </button>
            </form>

            <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-neutral-500">
              <span className="font-black uppercase tracking-wider text-neutral-400">Popular:</span>
              {['Compression', 'Hoodies', 'Sweatpants', 'Oversized', 'Best Sellers'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    navigate(`/shop?q=${encodeURIComponent(tag)}`)
                    setSearchOpen(false)
                  }}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold uppercase tracking-wider text-[10px] rounded-none transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MENU DRAWER */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Drawer Content */}
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white p-6 shadow-2xl flex flex-col transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <span className="text-xl font-black uppercase tracking-[0.25em] text-neutral-950">BUYLY</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                aria-label="Close Menu"
              >
                <Close size={22} />
              </button>
            </div>

            {/* Mobile Search Inside Drawer */}
            <div className="mt-5">
              <form onSubmit={submitSearch} className="relative flex items-center">
                <Search size={15} className="pointer-events-none absolute left-3 text-neutral-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search sportswear..."
                  className="w-full border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-xs font-bold text-neutral-900 outline-none focus:border-black rounded-none"
                />
              </form>
            </div>

            {/* Navigation List */}
            <nav className="mt-6 flex-1 space-y-4 overflow-y-auto pr-1">
              <Link
                to="/shop"
                onClick={() => setOpen(false)}
                className="block text-sm font-black uppercase tracking-widest text-neutral-950 hover:text-neutral-600 transition-colors"
              >
                Shop All Collection
              </Link>
              <Link
                to="/shop?sort=discount"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between text-sm font-black uppercase tracking-widest text-rose-600 hover:text-rose-700 transition-colors"
              >
                <span>Sale & Offers</span>
                <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5">HOT</span>
              </Link>

              <div className="border-t border-neutral-100 my-4" />
              <p className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">Categories</p>

              <div className="mt-2 space-y-2.5">
                {categories.map((c) => {
                  const Ic = iconForCategory(c)
                  const active = currentCategory === c.id
                  return (
                    <Link
                      key={c.id}
                      to={`/shop?category=${c.id}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                        active ? 'text-black font-black' : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      {Ic && <Ic size={16} className={active ? 'text-black' : 'text-neutral-400'} />}
                      <span>{c.name}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="border-t border-neutral-100 my-4" />
              <p className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">Region</p>
              <div className="flex gap-2 flex-wrap pt-1">
                {['EGYPT', 'US', 'UK', 'UAE', 'KSA'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCountry(c)}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border cursor-pointer ${
                      country === c ? 'border-black bg-black text-white' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </nav>

            {/* Footer Auth */}
            <div className="border-t border-neutral-100 pt-5 mt-auto">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-black text-neutral-900 uppercase tracking-wider truncate">{user.name}</p>
                    <p className="text-[10px] font-medium text-neutral-400 truncate">{user.email}</p>
                  </div>
                  {isAdmin && !adminPreview && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 border border-neutral-200 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-800 hover:bg-neutral-50 transition-colors"
                    >
                      <LayoutDashboard size={14} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 bg-black py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 bg-black py-3 text-center text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="flex-1 border border-neutral-200 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-800 hover:bg-neutral-50 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
              <p className="mt-4 text-[10px] uppercase tracking-widest text-neutral-400 text-center">
                © {new Date().getFullYear()} Buyly Performance
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
