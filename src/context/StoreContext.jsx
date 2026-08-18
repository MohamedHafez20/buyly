import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { StoreContext } from './storeContext'
import { listCategories } from '../services/categories'

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// Capture the minimal product snapshot a cart line needs to render.
const snapshot = (product) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  brand: product.brand || '',
  price: product.price,
  oldPrice: product.oldPrice || null,
  image: (product.images && product.images[0]) || product.image || null,
  category: product.category || null,
  categorySlug: product.categorySlug || null,
})

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { product, qty = 1 } = action
      const existing = state.find((i) => i.id === product.id)
      if (existing) {
        return state.map((i) =>
          i.id === product.id ? { ...i, qty: Math.min(i.qty + qty, 99) } : i
        )
      }
      return [...state, { ...snapshot(product), qty }]
    }
    case 'setQty':
      return state
        .map((i) => (i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i))
        .filter((i) => i.qty > 0)
    case 'remove':
      return state.filter((i) => i.id !== action.id)
    case 'clear':
      return []
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, () => load('buyly.cart', []))
  const [wishlist, setWishlist] = useState(() => load('buyly.wishlist', []))
  const [toast, setToast] = useState(null)

  // Categories are needed app-wide (navbar, home, shop) — fetch once here.
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState(null)
  const [categoriesTick, setCategoriesTick] = useState(0)

  // Event-driven refresh (used by the admin category screens). Setting state
  // here is fine — it runs from a handler, not synchronously inside an effect.
  const reloadCategories = useCallback(() => {
    setCategoriesLoading(true)
    setCategoriesError(null)
    setCategoriesTick((t) => t + 1)
  }, [])

  useEffect(() => {
    let active = true
    listCategories()
      .then((data) => {
        if (active) setCategories(data)
      })
      .catch((err) => {
        if (active) setCategoriesError(err.message || 'Failed to load categories')
      })
      .finally(() => {
        if (active) setCategoriesLoading(false)
      })
    return () => {
      active = false
    }
  }, [categoriesTick])

  useEffect(() => localStorage.setItem('buyly.cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('buyly.wishlist', JSON.stringify(wishlist)), [wishlist])

  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const addToCart = useCallback((product, qty = 1) => {
    dispatch({ type: 'add', product, qty })
    notify(`Added ${product.name} to cart`)
  }, [notify])

  const setQty = useCallback((id, qty) => dispatch({ type: 'setQty', id, qty }), [])
  const removeFromCart = useCallback((id) => dispatch({ type: 'remove', id }), [])
  const clearCart = useCallback(() => dispatch({ type: 'clear' }), [])

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const has = prev.includes(product.id)
      notify(has ? `Removed from wishlist` : `Saved ${product.name} to wishlist`)
      return has ? prev.filter((x) => x !== product.id) : [...prev, product.id]
    })
  }, [notify])

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart])

  const isWished = useCallback((id) => wishlist.includes(id), [wishlist])

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      wishlist,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWished,
      toast,
      notify,
      categories,
      categoriesLoading,
      categoriesError,
      reloadCategories,
    }),
    [cart, cartCount, wishlist, addToCart, setQty, removeFromCart, clearCart, toggleWishlist, isWished, toast, notify, categories, categoriesLoading, categoriesError, reloadCategories],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
