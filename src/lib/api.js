// Centralized API client. Every backend call in the app goes through here so
// auth headers, JSON handling, error shaping, and the base URL live in one place.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Origin without the /api suffix — used to resolve relative image paths
// (/uploads/...) returned by the backend into absolute URLs.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

const TOKEN_KEY = 'buyly.token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// Turn a backend image reference into something an <img> can load.
// Absolute URLs (Unsplash, etc.) pass through; relative /uploads paths get the
// API origin prefixed.
export const resolveImg = (src) => {
  if (!src) return null
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src
  return `${API_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`
}

// Error thrown for any non-2xx response. Carries status + server message so
// callers can branch on 401 / 409 / validation errors.
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(path, { method = 'GET', body, auth = false, headers = {}, signal } = {}) {
  const opts = { method, headers: { ...headers }, signal }

  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  if (body !== undefined && !isForm) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  } else if (isForm) {
    opts.body = body // let the browser set the multipart boundary
  }

  if (auth) {
    const token = getToken()
    if (token) opts.headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${API_URL}${path}`, opts)
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Network error — is the server running?', 0, null)
  }

  // 204 / empty body
  const text = await res.text()
  const data = text ? safeParse(text) : null

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`
    // Session expired / invalid → clear the stale token so guards react.
    if (res.status === 401 && auth) setToken(null)
    throw new ApiError(message, res.status, data)
  }
  return data
}

function safeParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
