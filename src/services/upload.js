import { api } from '../lib/api'

// Upload one or more image files. Returns an array of relative /uploads paths.
export const uploadImages = async (files) => {
  const form = new FormData()
  const arr = Array.isArray(files) ? files : [files]
  arr.forEach((f) => form.append('images', f))
  const data = await api.post('/upload', form, { auth: true })
  return data.urls
}
