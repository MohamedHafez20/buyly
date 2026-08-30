import { api } from '../lib/api'

// Public — enabled countries for the checkout form.
export const listCountries = () => api.get('/countries')

// --- admin ---
export const listAllCountries = () => api.get('/countries/all', { auth: true })

export const createCountry = (payload) =>
  api.post('/countries', payload, { auth: true })

export const updateCountry = (id, payload) =>
  api.patch(`/countries/${id}`, payload, { auth: true })

export const deleteCountry = (id) => api.del(`/countries/${id}`, { auth: true })
