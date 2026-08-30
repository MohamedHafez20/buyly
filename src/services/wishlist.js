import { api } from '../lib/api'

export const getServerWishlist = () => api.get('/wishlist', { auth: true })

export const toggleServerWishlist = (productId) =>
  api.post('/wishlist/toggle', { productId }, { auth: true })

export const mergeServerWishlist = (products) =>
  api.post('/wishlist/merge', { products }, { auth: true })
