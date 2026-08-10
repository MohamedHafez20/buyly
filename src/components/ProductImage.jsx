export default function ProductImage({ product, className = '', emojiSize = '3.5rem', imageIndex = 0 }) {
  const imageUrl = product.images && product.images[imageIndex] ? product.images[imageIndex] : null

  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-all duration-700 ease-out"
        />
      </div>
    )
  }

  // Fallback to SVGs if no image URL is provided (preserves offline/placeholder compatibility)
  const backdrops = {
    'short-sleeves': ['#faf7f5', '#f0e8e4'],
    'long-sleeves': ['#f5f6fa', '#e8ebf5'],
    sweatpants: ['#f0f7f7', '#e0eeee'],
    jackets: ['#f4f4f5', '#e4e4e7'],
    footwear: ['#fcfbf7', '#f3ede2'],
    accessories: ['#fff5f5', '#fae3e3'],
  }

  const [from, to] = backdrops[product.category] || ['#fafafa', '#f3f4f6']
  const gid = `g${product.id}`
  const rid = `r${product.id}`

  return (
    <div className={`relative overflow-hidden select-none bg-slate-50 dark:bg-slate-900 ${className}`}>
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <radialGradient id={rid} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${gid})`} />
        <circle cx="50" cy="45" r="45" fill={`url(#${rid})`} />
        <ellipse cx="50" cy="74" rx="20" ry="4.5" fill="#0f172a" opacity="0.07" />
      </svg>
      <div 
        className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-110" 
        style={{ fontSize: emojiSize }}
      >
        <span className="drop-shadow-[0_8px_16px_rgba(15,23,42,0.18)] filter transform -translate-y-1.5">
          {product.emoji || '📦'}
        </span>
      </div>
    </div>
  )
}
