const KEY = 'buyly.adminStorePreview'

export const enableAdminStorePreview = () => sessionStorage.setItem(KEY, '1')

export const disableAdminStorePreview = () => sessionStorage.removeItem(KEY)

export const isAdminStorePreview = () => sessionStorage.getItem(KEY) === '1'
