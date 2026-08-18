import { useCallback, useEffect, useState } from 'react'

// Small data-fetching hook shared by every backend-connected view.
// Loading starts true and is only ever flipped inside async callbacks or the
// (event-driven) reload handler — never synchronously inside the effect body —
// which keeps the standard fetch-on-mount pattern clean and predictable.
//
// `fetcher` is called on mount, whenever `deps` change, and on reload().
export function useResource(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    setTick((t) => t + 1)
  }, [])

  useEffect(() => {
    let active = true
    fetcher()
      .then((d) => {
        if (active) setData(d)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Something went wrong')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // fetcher is intentionally excluded — callers pass an inline arrow; the
    // effect re-runs on reload() (tick) and any explicit deps instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  return { data, loading, error, reload, setData }
}
