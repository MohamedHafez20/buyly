import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useStore } from '../../context/useStore'
import { getProductBySlug, createProduct, updateProduct } from '../../services/products'
import { LoadingState, ErrorState, Spinner } from '../../components/States'
import { PageHeader, Card } from '../../components/admin/ui'
import ImageUploader from '../../components/admin/ImageUploader'
import { ArrowLeft, Save } from '../../components/icons'

const blank = {
  name: '', brand: '', description: '', price: '', oldPrice: '', stock: '0',
  category: '', status: 'active', badge: '', images: [],
  colorsText: '', sizesText: '', featuresText: '',
}

const parseList = (text) => text.split(',').map((t) => t.trim()).filter(Boolean)

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { categories, notify } = useStore()

  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let active = true
    getProductBySlug(id)
      .then((p) => {
        if (!active) return
        setForm({
          name: p.name || '',
          brand: p.brand || '',
          description: p.description || '',
          price: String(p.price ?? ''),
          oldPrice: p.oldPrice != null ? String(p.oldPrice) : '',
          stock: String(p.stock ?? 0),
          category: p.category || '',
          status: p.status || 'active',
          badge: p.badge || '',
          images: p.images || [],
          colorsText: (p.colors || []).join(', '),
          sizesText: (p.sizes || []).join(', '),
          featuresText: (p.features || []).join(', '),
        })
      })
      .catch((err) => active && setLoadError(err.message || 'Failed to load product'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id, isEdit])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Product name is required'
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = 'Enter a valid price'
    if (form.oldPrice !== '' && (Number.isNaN(Number(form.oldPrice)) || Number(form.oldPrice) < 0))
      e.oldPrice = 'Enter a valid original price'
    if (form.oldPrice !== '' && Number(form.oldPrice) <= Number(form.price))
      e.oldPrice = 'Original price should be higher than price'
    if (form.stock === '' || Number.isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = 'Enter a valid stock quantity'
    if (!form.category) e.category = 'Choose a category'
    if (form.images.length === 0) e.images = 'Add at least one product image'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      notify('Please fix the highlighted fields')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      oldPrice: form.oldPrice === '' ? null : Number(form.oldPrice),
      stock: Number(form.stock),
      category: form.category,
      status: form.status,
      badge: form.badge.trim() || null,
      images: form.images,
      colors: parseList(form.colorsText),
      sizes: parseList(form.sizesText),
      features: parseList(form.featuresText),
    }
    try {
      if (isEdit) {
        await updateProduct(id, payload)
        notify('Product updated')
      } else {
        await createProduct(payload)
        notify('Product created')
      }
      navigate('/admin/products')
    } catch (err) {
      setSaving(false)
      notify(err.message || 'Could not save the product')
    }
  }

  if (loading) return <LoadingState label="Loading product details" />
  if (loadError) return <ErrorState message={loadError} onRetry={() => navigate(0)} />

  return (
    <div className="space-y-6">
      <div>
        <Link 
          to="/admin/products" 
          className="theme-transition inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white"
        >
          <ArrowLeft size={13} /> Back to products
        </Link>
        <div className="mt-2.5">
          <PageHeader 
            title={isEdit ? 'Edit Product' : 'Add Product'} 
            subtitle={isEdit ? `Modifying: ${form.name}` : 'Create a new catalog item with metadata'} 
          />
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Two Column Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Left Column (Wide) - Info & Media */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Details Card */}
            <Card className="p-6">
              <h2 className="mb-4 font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                General details
              </h2>
              <div className="grid gap-4.5 sm:grid-cols-2">
                <Field label="Product name" error={errors.name} className="sm:col-span-2">
                  <input 
                    value={form.name} 
                    onChange={set('name')} 
                    className={inputCls(errors.name)} 
                    placeholder="e.g. AeroDry Performance Tee" 
                  />
                </Field>
                <Field label="Brand">
                  <input 
                    value={form.brand} 
                    onChange={set('brand')} 
                    className={inputCls()} 
                    placeholder="e.g. Aero" 
                  />
                </Field>
                <Field label="Category" error={errors.category}>
                  <select 
                    value={form.category} 
                    onChange={set('category')} 
                    className={inputCls(errors.category)}
                  >
                    <option value="">Select a category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <textarea 
                    value={form.description} 
                    onChange={set('description')} 
                    rows={4} 
                    className={inputCls()} 
                    placeholder="Provide a detailed description of features, materials, and fitting..." 
                  />
                </Field>
              </div>
            </Card>

            {/* Media Uploader Card */}
            <Card className="p-6">
              <h2 className="mb-4 font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                Product images
              </h2>
              <ImageUploader value={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} />
              {errors.images && (
                <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  {errors.images}
                </p>
              )}
            </Card>

            {/* Product Options & Metadata Card */}
            <Card className="p-6">
              <h2 className="mb-4 font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                Variants & options
              </h2>
              <div className="grid gap-4.5 sm:grid-cols-2">
                <Field label="Colors (comma separated)">
                  <input 
                    value={form.colorsText} 
                    onChange={set('colorsText')} 
                    className={inputCls()} 
                    placeholder="e.g. Jet Black, Pure White" 
                  />
                </Field>
                <Field label="Sizes (comma separated)">
                  <input 
                    value={form.sizesText} 
                    onChange={set('sizesText')} 
                    className={inputCls()} 
                    placeholder="e.g. S, M, L, XL" 
                  />
                </Field>
                <Field label="Features (comma separated)" className="sm:col-span-2">
                  <input 
                    value={form.featuresText} 
                    onChange={set('featuresText')} 
                    className={inputCls()} 
                    placeholder="e.g. Moisture-wicking fabric, Anti-odor treatment, Reflector lines" 
                  />
                </Field>
              </div>
            </Card>
          </div>

          {/* Right Column (Narrow) - Pricing, Inventory & Publishing */}
          <div className="space-y-6">
            
            {/* Pricing & Stock Card */}
            <Card className="p-6">
              <h2 className="mb-4 font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                Pricing & Stock
              </h2>
              <div className="space-y-4">
                <Field label="Price (USD)" error={errors.price}>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={form.price} 
                    onChange={set('price')} 
                    className={inputCls(errors.price)} 
                    placeholder="38.00" 
                  />
                </Field>
                <Field label="Original price (optional)" error={errors.oldPrice}>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={form.oldPrice} 
                    onChange={set('oldPrice')} 
                    className={inputCls(errors.oldPrice)} 
                    placeholder="48.00" 
                  />
                </Field>
                <Field label="Stock quantity" error={errors.stock}>
                  <input 
                    type="number" 
                    min="0" 
                    value={form.stock} 
                    onChange={set('stock')} 
                    className={inputCls(errors.stock)} 
                    placeholder="40" 
                  />
                </Field>
              </div>
            </Card>

            {/* Status Card */}
            <Card className="p-6">
              <h2 className="mb-4 font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                Publishing Details
              </h2>
              <div className="space-y-4">
                <Field label="Badge (optional)">
                  <select value={form.badge} onChange={set('badge')} className={inputCls()}>
                    <option value="">No Badge</option>
                    {['Best Seller', 'New', 'Hot'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Publish Status">
                  <select value={form.status} onChange={set('status')} className={inputCls()}>
                    <option value="active">Active (Visible in store)</option>
                    <option value="draft">Draft (Hidden from store)</option>
                  </select>
                </Field>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer Save / Cancel panel */}
        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200/60 dark:border-neutral-800/40 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="theme-transition inline-flex items-center justify-center gap-2 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-8 py-3 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-neutral-850 dark:hover:bg-neutral-100 disabled:opacity-60 rounded-xl shadow-sm"
          >
            {saving ? (
              <>
                <Spinner size={14} className="border-white/40 border-t-white dark:border-neutral-900/40 dark:border-t-neutral-900" /> 
                Saving…
              </>
            ) : (
              <>
                <Save size={14} /> 
                {isEdit ? 'Save Changes' : 'Create Product'}
              </>
            )}
          </button>
          <Link 
            to="/admin/products" 
            className="theme-transition px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

const inputCls = (err) =>
  `w-full border bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white px-3.5 py-2.5 text-xs font-semibold outline-none transition duration-150 rounded-xl ${
    err 
      ? 'border-rose-450 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
      : 'border-neutral-200 focus:border-neutral-950 dark:border-neutral-800 dark:focus:border-white focus:ring-4 focus:ring-neutral-950/5 dark:focus:ring-white/5'
  }`

function Field({ label, error, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[10px] font-extrabold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">{label}</span>
      {children}
      {error && (
        <span className="mt-1.5 block text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
          {error}
        </span>
      )}
    </label>
  )
}
