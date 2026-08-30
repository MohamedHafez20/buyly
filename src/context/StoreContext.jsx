import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { StoreContext } from './storeContext'
import { listCategories } from '../services/categories'
import { mergeServerCart, replaceServerCart } from '../services/cart'
import { getServerWishlist, mergeServerWishlist, toggleServerWishlist } from '../services/wishlist'
import { lineKey } from '../lib/cart'
import { useAuth } from './useAuth'

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// Capture the minimal product snapshot a cart line needs to render, plus the
// selected variant (color/size/sku) when one was chosen.
const snapshot = (product, variant = null) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  brand: product.brand || '',
  price: product.price,
  oldPrice: product.oldPrice || null,
  image: (product.images && product.images[0]) || product.image || null,
  category: product.category || null,
  categorySlug: product.categorySlug || null,
  color: variant?.color || '',
  size: variant?.size || '',
  sku: variant?.sku || '',
})

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { product, qty = 1, variant = null } = action
      const line = { ...snapshot(product, variant), qty }
      const key = lineKey(line)
      const existing = state.find((i) => lineKey(i) === key)
      if (existing) {
        return state.map((i) =>
          lineKey(i) === key ? { ...i, qty: Math.min(i.qty + qty, 99) } : i
        )
      }
      return [...state, line]
    }
    // A bundle is one line: a fixed-price tier plus its per-piece variant picks.
    case 'addBundle': {
      const { product, tier, pieces } = action
      const uid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`
      const line = {
        uid,
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand || '',
        price: product.price,
        oldPrice: product.oldPrice || null,
        image: (product.images && product.images[0]) || product.image || null,
        category: product.category || null,
        categorySlug: product.categorySlug || null,
        bundleTierId: tier.id,
        bundleQuantity: tier.quantity,
        bundlePrice: tier.bundlePrice,
        bundleLabel: tier.label || '',
        pieces: pieces.map((p) => ({ color: p.color || '', size: p.size || '', sku: p.sku || '' })),
        qty: 1,
      }
      return [...state, line]
    }
    case 'setQty':
      return state
        .map((i) => (lineKey(i) === action.key ? { ...i, qty: Math.max(1, action.qty) } : i))
        .filter((i) => i.qty > 0)
    case 'remove':
      return state.filter((i) => lineKey(i) !== action.key)
    case 'clear':
      return []
    // Adopt the server-owned cart wholesale (used after login merges the guest
    // cart into the persisted one).
    case 'replace':
      return action.items
    default:
      return state
  }
}

// Map a server-priced cart line back onto the local snapshot shape.
const fromServerLine = (line) =>
  line.bundleTierId
    ? {
        uid: line.uid,
        id: line.product,
        name: line.name,
        slug: line.slug,
        brand: '',
        price: line.price,
        oldPrice: null,
        image: line.image || null,
        category: null,
        categorySlug: null,
        bundleTierId: line.bundleTierId,
        bundleQuantity: line.bundleQuantity,
        bundlePrice: line.bundlePrice,
        bundleLabel: line.bundleLabel || '',
        pieces: line.pieces || [],
        qty: 1,
      }
    : {
        id: line.product,
        name: line.name,
        slug: line.slug,
        brand: '',
        price: line.price,
        oldPrice: null,
        image: line.image || null,
        category: null,
        categorySlug: null,
        color: line.color || '',
        size: line.size || '',
        sku: line.sku || '',
        qty: line.quantity,
      }

// The shape the cart API expects (ordinary variant line or bundle line).
const toServerLines = (cart) =>
  cart.map((i) =>
    i.bundleTierId
      ? { product: i.id, quantity: 1, uid: i.uid, bundleTierId: i.bundleTierId, pieces: i.pieces || [] }
      : { product: i.id, quantity: i.qty, color: i.color || '', size: i.size || '', sku: i.sku || '' },
  )

export function StoreProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, () => load('buyly.cart', []))
  const [wishlist, setWishlist] = useState(() => load('buyly.wishlist', []))
  const [toast, setToast] = useState(null)

  // --- Server-owned cart persistence (authenticated users) ---------------
  // The local cart above is an instant client mirror that also lets guests
  // shop offline. When a user is signed in, the backend owns the durable cart:
  // on login we merge the guest cart into it, then write local changes through.
  const { isAuthenticated, user } = useAuth()
  const cartRef = useRef(cart)
  useEffect(() => { cartRef.current = cart }, [cart])
  const wishlistRef = useRef(wishlist)
  useEffect(() => { wishlistRef.current = wishlist }, [wishlist])
  // Two refs guard the login merge: `started` blocks a duplicate merge under
  // React StrictMode's double-invoke, `done` gates write-through until the
  // merge has resolved (so we never overwrite the server cart with a partial one).
  const mergeStartedFor = useRef(null)
  const mergeDoneFor = useRef(null)
  const wishlistMergeStartedFor = useRef(null)
  const suppressWishlistPersist = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      mergeStartedFor.current = null
      mergeDoneFor.current = null
      wishlistMergeStartedFor.current = null
      return
    }
    if (mergeStartedFor.current === user.id) return
    mergeStartedFor.current = user.id
    mergeServerCart(toServerLines(cartRef.current))
      .then((server) => {
        dispatch({ type: 'replace', items: (server.items || []).map(fromServerLine) })
      })
      .catch(() => {
        // Non-blocking: storefront keeps working from the local mirror.
      })
      .finally(() => {
        mergeDoneFor.current = user.id
      })
  }, [isAuthenticated, user])

  // Write-through: once the login merge is done, mirror local cart changes to
  // the server. Replace semantics keep it idempotent (no quantity doubling).
  useEffect(() => {
    if (!isAuthenticated || !user || mergeDoneFor.current !== user.id) return
    const t = setTimeout(() => {
      replaceServerCart(toServerLines(cart)).catch(() => {})
    }, 400)
    return () => clearTimeout(t)
  }, [cart, isAuthenticated, user])

  // The persisted wishlist belongs to the authenticated user. Guest wishes live
  // locally until login, where they are union-merged into the server wishlist.
  useEffect(() => {
    let active = true
    if (!isAuthenticated || !user) {
      wishlistMergeStartedFor.current = null
      suppressWishlistPersist.current = true
      queueMicrotask(() => {
        if (active) setWishlist(load('buyly.wishlist', []))
      })
      return () => {
        active = false
      }
    }
    if (wishlistMergeStartedFor.current === user.id) return
    wishlistMergeStartedFor.current = user.id
    const localWishlist = wishlistRef.current
    mergeServerWishlist(localWishlist)
      .then((ids) => {
        if (!active) return
        setWishlist(ids)
        localStorage.removeItem('buyly.wishlist')
      })
      .catch(() => {
        getServerWishlist()
          .then((ids) => {
            if (active) setWishlist(ids)
          })
          .catch(() => {})
      })
    return () => {
      active = false
    }
  }, [isAuthenticated, user])

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
  useEffect(() => {
    if (isAuthenticated) return
    if (suppressWishlistPersist.current) {
      suppressWishlistPersist.current = false
      return
    }
    localStorage.setItem('buyly.wishlist', JSON.stringify(wishlist))
  }, [wishlist, isAuthenticated])

  // Applied coupon code. Validation and the discount amount are always resolved
  // by the backend (via the cart summary) — this only remembers the code the
  // shopper entered so it carries from cart to checkout.
  const [coupon, setCoupon] = useState(() => load('buyly.coupon', ''))
  useEffect(() => localStorage.setItem('buyly.coupon', JSON.stringify(coupon)), [coupon])
  const applyCoupon = useCallback((code) => setCoupon((code || '').trim().toUpperCase()), [])
  const clearCoupon = useCallback(() => setCoupon(''), [])

  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const addToCart = useCallback((product, qty = 1, variant = null) => {
    dispatch({ type: 'add', product, qty, variant })
    notify(`Added ${product.name} to cart`)
  }, [notify])

  const addBundleToCart = useCallback((product, tier, pieces) => {
    dispatch({ type: 'addBundle', product, tier, pieces })
    notify(`Added ${tier.quantity}-piece bundle to cart`)
  }, [notify])

  const setQty = useCallback((key, qty) => dispatch({ type: 'setQty', key, qty }), [])
  const removeFromCart = useCallback((key) => dispatch({ type: 'remove', key }), [])
  const clearCart = useCallback(() => {
    dispatch({ type: 'clear' })
    setCoupon('') // a fresh cart starts without a coupon
  }, [])

  const toggleWishlist = useCallback((product) => {
    const productId = product.id
    const previousWishlist = wishlistRef.current
    const wasWished = previousWishlist.includes(productId)
    const optimistic = wasWished
      ? previousWishlist.filter((id) => id !== productId)
      : [...previousWishlist, productId]

    setWishlist(optimistic)
    notify(wasWished ? 'Removed from wishlist' : `Saved ${product.name} to wishlist`)

    if (!isAuthenticated) return

    toggleServerWishlist(productId)
      .then(({ wishlist: serverWishlist }) => {
        if (Array.isArray(serverWishlist)) setWishlist(serverWishlist)
      })
      .catch(() => {
        setWishlist(previousWishlist)
        notify('Could not update wishlist')
      })
  }, [isAuthenticated, notify])

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart])

  const isWished = useCallback((id) => wishlist.includes(id), [wishlist])

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      wishlist,
      addToCart,
      addBundleToCart,
      setQty,
      removeFromCart,
      clearCart,
      coupon,
      applyCoupon,
      clearCoupon,
      toggleWishlist,
      isWished,
      toast,
      notify,
      categories,
      categoriesLoading,
      categoriesError,
      reloadCategories,
    }),
    [cart, cartCount, wishlist, addToCart, addBundleToCart, setQty, removeFromCart, clearCart, coupon, applyCoupon, clearCoupon, toggleWishlist, isWished, toast, notify, categories, categoriesLoading, categoriesError, reloadCategories],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
