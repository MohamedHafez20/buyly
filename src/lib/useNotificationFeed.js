import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Shared notification feed engine used by both the client and admin surfaces.
//
// It owns: the polled unread badge count, a paginated list (load-more), and
// optimistic read/delete mutations that reconcile against the server. The two
// surfaces only differ by which API functions they hand in, so all of the
// stateful logic lives here once.
//
// Params:
//   enabled  – when false (e.g. signed out) the feed stays empty and idle.
//   api      – { list, unreadCount, markRead, markAllRead, remove }
//   params   – extra query params merged into every list() call (filters).
//   pollMs   – unread-count poll interval (default 45s). Also refetches on
//              window focus so a returning tab updates promptly.
export function useNotificationFeed({ enabled = true, api, params = {}, pollMs = 45000 }) {
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  // Refs so the polling interval / handlers always see current values without
  // re-subscribing on every render.
  const apiRef = useRef(api)
  useEffect(() => { apiRef.current = api }, [api])
  const enabledRef = useRef(enabled)
  useEffect(() => { enabledRef.current = enabled }, [enabled])

  // Mirror of `items` for synchronous dedupe in prepend() (see below), without
  // making prepend depend on / re-create with every list change.
  const itemsRef = useRef(items)
  useEffect(() => { itemsRef.current = items }, [items])

  // Serialize filter params into a stable dependency key.
  const paramsKey = JSON.stringify(params || {})
  const paramsRef = useRef(params)
  useEffect(() => { paramsRef.current = params }, [paramsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // When the feed transitions to disabled (e.g. the user signs out) reset it to
  // empty. Done as a render-phase adjustment — React's sanctioned pattern for
  // "reset state when a prop changes" — so there's no cascading-render effect.
  const [prevEnabled, setPrevEnabled] = useState(enabled)
  if (prevEnabled !== enabled) {
    setPrevEnabled(enabled)
    if (!enabled) {
      setUnread(0); setItems([]); setPage(1); setPages(1); setTotal(0); setError(null)
    }
  }

  const hasMore = page < pages

  // Fetch a specific page. Page 1 replaces the list; later pages append.
  const loadPage = useCallback(async (targetPage) => {
    if (!enabledRef.current) return
    if (targetPage === 1) { setLoading(true); setError(null) } else { setLoadingMore(true) }
    try {
      const data = await apiRef.current.list({ ...paramsRef.current, page: targetPage, limit: 15 })
      const list = data.notifications || []
      setItems((prev) => (targetPage === 1 ? list : [...prev, ...list]))
      setPage(data.page || targetPage)
      setPages(data.pages || 1)
      setTotal(data.total ?? list.length)
      if (typeof data.unread === 'number') setUnread(data.unread)
    } catch (err) {
      if (targetPage === 1) setError(err.message || 'Failed to load notifications')
    } finally {
      if (targetPage === 1) setLoading(false); else setLoadingMore(false)
    }
  }, [])

  const refresh = useCallback(() => loadPage(1), [loadPage])
  const loadMore = useCallback(() => {
    if (!loadingMore && page < pages) loadPage(page + 1)
  }, [loadPage, loadingMore, page, pages])

  // Poll the unread count while enabled; refetch on focus. Setting state only
  // happens inside the async callback, never synchronously in the effect body.
  useEffect(() => {
    if (!enabled) return undefined
    let active = true
    const poll = () => {
      apiRef.current
        .unreadCount()
        .then((d) => { if (active) setUnread(d.count || 0) })
        .catch(() => {})
    }
    poll()
    const id = setInterval(poll, pollMs)
    const onFocus = () => poll()
    window.addEventListener('focus', onFocus)
    return () => {
      active = false
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [enabled, pollMs])

  // ---- optimistic mutations ------------------------------------------------

  const markRead = useCallback(async (id) => {
    let wasUnread = false
    setItems((prev) => prev.map((n) => {
      if (n.id === id && !n.isRead) { wasUnread = true; return { ...n, isRead: true } }
      return n
    }))
    if (wasUnread) setUnread((c) => Math.max(0, c - 1))
    try {
      await apiRef.current.markRead(id)
    } catch {
      // Reconcile the badge if the server rejected the change.
      apiRef.current.unreadCount().then((d) => setUnread(d.count || 0)).catch(() => {})
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => (n.isRead ? n : { ...n, isRead: true })))
    setUnread(0)
    try {
      await apiRef.current.markAllRead()
    } catch {
      apiRef.current.unreadCount().then((d) => setUnread(d.count || 0)).catch(() => {})
    }
  }, [])

  // Inject a notification pushed in real time over the socket. Deduped by id
  // (via itemsRef) so a socket push that races the poll can't show the same item
  // twice or double-count the badge; the setters stay top-level and pure. Any
  // transient drift is reconciled by the next unread-count poll.
  const prepend = useCallback((n) => {
    if (!n || !n.id) return
    if (itemsRef.current.some((x) => x.id === n.id)) return
    itemsRef.current = [n, ...itemsRef.current]
    setItems((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]))
    setTotal((t) => t + 1)
    if (!n.isRead) setUnread((c) => c + 1)
  }, [])

  const remove = useCallback(async (id) => {
    let wasUnread = false
    setItems((prev) => prev.filter((n) => {
      if (n.id === id) { wasUnread = !n.isRead; return false }
      return true
    }))
    setTotal((t) => Math.max(0, t - 1))
    if (wasUnread) setUnread((c) => Math.max(0, c - 1))
    try {
      await apiRef.current.remove(id)
    } catch {
      apiRef.current.unreadCount().then((d) => setUnread(d.count || 0)).catch(() => {})
    }
  }, [])

  return useMemo(
    () => ({
      unread, items, loading, loadingMore, error, hasMore, total, page,
      refresh, loadMore, markRead, markAllRead, remove, prepend, setUnread, setItems,
    }),
    [unread, items, loading, loadingMore, error, hasMore, total, page, refresh, loadMore, markRead, markAllRead, remove, prepend],
  )
}
