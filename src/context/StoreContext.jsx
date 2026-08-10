import { useEffect, useMemo, useReducer, useState, useCallback } from 'react'
import { StoreContext } from './storeContext'

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

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
      return [...state, { id: product.id, qty }]
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

  // Memoized so the context value identity only changes when real state does.
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
    }),
    [cart, cartCount, wishlist, addToCart, setQty, removeFromCart, clearCart, toggleWishlist, isWished, toast, notify],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
