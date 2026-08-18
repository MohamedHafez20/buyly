import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { setToken } from '../lib/api'
import * as authApi from '../services/auth'

const USER_KEY = 'buyly.user'

const loadUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  // Only "loading" when there's a stored token to validate; otherwise resolved.
  const [loading, setLoading] = useState(() => !!localStorage.getItem('buyly.token'))

  const persist = useCallback((nextUser, token) => {
    setUser(nextUser)
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    else localStorage.removeItem(USER_KEY)
    if (token !== undefined) setToken(token)
  }, [])

  // On boot, validate the stored session against the backend.
  useEffect(() => {
    let active = true
    const token = localStorage.getItem('buyly.token')
    if (!token) return // nothing to validate; `loading` already initialised false
    authApi
      .getMe()
      .then((me) => {
        if (active) persist(me)
      })
      .catch(() => {
        // token invalid / expired — clear it
        if (active) persist(null, null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [persist])

  const login = useCallback(
    async (email, password) => {
      const { token, user: u } = await authApi.login(email, password)
      persist(u, token)
      return u
    },
    [persist],
  )

  const register = useCallback(
    async (name, email, password) => {
      const { token, user: u } = await authApi.register(name, email, password)
      persist(u, token)
      return u
    },
    [persist],
  )

  const logout = useCallback(() => persist(null, null), [persist])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
