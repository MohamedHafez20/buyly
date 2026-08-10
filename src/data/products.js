// Mock catalog for Buyly sportswear brand.
// Using premium sportswear photography from Unsplash with multiple angles.

export const categories = [
  { id: 'short-sleeves', name: 'Short Sleeves', emoji: '👕', blurb: 'Lightweight & breathable training tees' },
  { id: 'long-sleeves', name: 'Long Sleeves', emoji: '🧥', blurb: 'Premium hoodies, pullovers & layers' },
  { id: 'sweatpants', name: 'Sweatpants', emoji: '👖', blurb: 'Tapered joggers & everyday sweats' },
  { id: 'jackets', name: 'Jackets', emoji: '💨', blurb: 'All-weather jackets & windbreakers' },
  { id: 'footwear', name: 'Footwear', emoji: '👟', blurb: 'Engineered running shoes & trainers' },
  { id: 'accessories', name: 'Accessories', emoji: '🎒', blurb: 'Essential training bags & caps' },
]

let _id = 0
const p = (o) => ({
  id: ++_id,
  slug: o.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  rating: 4.5,
  reviews: 120,
  stock: 40,
  oldPrice: null,
  badge: null,
  features: [],
  colors: ['Charcoal Black', 'Bone White', 'Sage Green'],
  sizes: ['S', 'M', 'L', 'XL'],
  ...o,
})

export const products = [
  // Short Sleeves
  p({
    name: 'AeroDry Performance Tee',
    category: 'short-sleeves',
    price: 38.0,
    oldPrice: 48.0,
    rating: 4.8,
    reviews: 342,
    badge: 'Best Seller',
    brand: 'Aero',
    description: 'A lightweight training t-shirt built with moisture-wicking technology and mesh ventilation panels to keep you dry and comfortable during your most intense workouts.',
    features: ['Moisture-wicking AeroDry fabric', 'Anti-odor treatment', 'Flatlock stitching to reduce chafing', 'Athletic fit'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Jet Black', 'Pure White', 'Slate Blue'],
    sizes: ['S', 'M', 'L', 'XL']
  }),
  p({
    name: 'Evolve Oversized Tee',
    category: 'short-sleeves',
    price: 42.0,
    rating: 4.6,
    reviews: 184,
    badge: 'New',
    brand: 'Evolve',
    description: 'Designed with an oversized streetwear silhouette and heavy-weight organic cotton, this tee offers ultimate versatility from workout to rest day.',
    features: ['100% heavyweight organic cotton', 'Drop shoulder details', 'Ribbed high-neck collar', 'Breathable relaxed fit'],
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503341455253-b264120f9017?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Oatmeal', 'Washed Olive', 'Vintage Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  }),
  p({
    name: 'Apex Seamless Tee',
    category: 'short-sleeves',
    price: 45.0,
    oldPrice: 55.0,
    rating: 4.7,
    reviews: 288,
    badge: 'Hot',
    brand: 'Apex',
    description: 'Engineered with a seamless knit body to eliminate irritation, the Apex Tee moves with you. Targeted knit zones map your body for active heat zoning.',
    features: ['Fully seamless construction', 'Zoned body-mapping breathability', '4-way premium stretch', 'Silver-ion anti-bacterial tech'],
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Charcoal Gray', 'Royal Blue', 'Sage Green'],
    sizes: ['S', 'M', 'L', 'XL']
  }),
  p({
    name: 'Core Cotton Essential Tee',
    category: 'short-sleeves',
    price: 28.0,
    rating: 4.4,
    reviews: 95,
    brand: 'Core',
    description: 'An everyday workout wardrobe essential. Made from ultra-soft ringspun cotton-poly blend that retains shape and comfort washed after washed.',
    features: ['Premium cotton-poly blend', 'Reinforced neck seams', 'Pre-shrunk fabric finish', 'Standard classic fit'],
    images: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Heather Gray', 'Pure White', 'Navy Blue'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  }),

  // Long Sleeves
  p({
    name: 'Pursuit Pullover Hoodie',
    category: 'long-sleeves',
    price: 68.0,
    oldPrice: 85.0,
    rating: 4.9,
    reviews: 524,
    badge: 'Best Seller',
    brand: 'Aero',
    description: 'Crafted with premium double-knit fleece, the Pursuit Hoodie delivers lightweight warmth and sleek style. Featuring hidden secure zip pockets for convenience.',
    features: ['Double-knit breathable fleece', 'Sleek crossover hood design', 'Hidden secure zipper pocket', 'Ribbed cuffs with thumbholes'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Carbon Black', 'Dusty Rose', 'Bone White'],
    sizes: ['S', 'M', 'L', 'XL']
  }),
  p({
    name: 'Seamless Active Long Sleeve',
    category: 'long-sleeves',
    price: 48.0,
    rating: 4.5,
    reviews: 112,
    brand: 'Evolve',
    description: 'Form-fitting, supportive, and sweat-wicking. This seamless long sleeve crop is designed with textured contour lines to flatter your physique while you train.',
    features: ['Tight supportive form-fit', 'Contouring knit details', 'Thumbholes at cuffs', 'Breathable open-back detailing'],
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Plum Red', 'Sage Green', 'Carbon Black'],
    sizes: ['XS', 'S', 'M', 'L']
  }),
  p({
    name: 'Element Quarter-Zip Pullover',
    category: 'long-sleeves',
    price: 58.0,
    rating: 4.7,
    reviews: 215,
    badge: 'New',
    brand: 'Apex',
    description: 'The ideal layering piece for early morning runs or cold gym commutes. Features a stand-up collar, wind-resistant chest panel, and reflective accents.',
    features: ['Thermal loopback lining', 'Wind-resistant front panels', 'Reflective branding details', 'Chin guard at zipper top'],
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Cobalt Blue', 'Off White', 'Deep Charcoal'],
    sizes: ['S', 'M', 'L', 'XL']
  }),

  // Sweatpants
  p({
    name: 'Fleece Training Joggers',
    category: 'sweatpants',
    price: 55.0,
    oldPrice: 70.0,
    rating: 4.8,
    reviews: 432,
    badge: 'Best Seller',
    brand: 'Aero',
    description: 'Tapered joggers cut from ultra-soft loopback cotton fleece. Featuring deep front pockets, an adjustable internal drawcord, and sleek ankle cuffs.',
    features: ['Loopback premium cotton fleece', 'Modern tapered joggers fit', 'Deep side pockets + back zip pocket', 'Adjustable flat drawcord'],
    images: [
      'https://images.unsplash.com/photo-1551854838-212c50b4c184?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Heather Gray', 'Jet Black', 'Khaki Sand'],
    sizes: ['S', 'M', 'L', 'XL']
  }),
  p({
    name: 'Apex Utility Cargo Jogger',
    category: 'sweatpants',
    price: 65.0,
    rating: 4.4,
    reviews: 85,
    brand: 'Apex',
    description: 'Fusing street style with athletic performance. Made from stretch water-resistant nylon, featuring tactical zippered cargo pockets.',
    features: ['Stretch water-resistant nylon fabric', 'Sleek zip utility pockets', 'Elastic waistband and ankle cuffs', 'Durable build'],
    images: [
      'https://images.unsplash.com/photo-1580906853634-11a7354039c1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Military Olive', 'Carbon Black', 'Steel Gray'],
    sizes: ['S', 'M', 'L', 'XL']
  }),
  p({
    name: 'RestDay Heavyweight Sweatpants',
    category: 'sweatpants',
    price: 50.0,
    rating: 4.6,
    reviews: 154,
    badge: 'New',
    brand: 'Core',
    description: 'Unmatched comfort in an oversized drape. Built with thick organic cotton for lounging or training in cold climates.',
    features: ['450gsm heavyweight organic cotton', 'Thick elasticated waistband', 'Relaxed oversized aesthetic', 'Brushed fleece interior'],
    images: [
      'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Oatmeal Speckle', 'Midnight Black', 'Washed Sage'],
    sizes: ['S', 'M', 'L', 'XL']
  }),

  // Jackets
  p({
    name: 'Repel Lightweight Windbreaker',
    category: 'jackets',
    price: 85.0,
    oldPrice: 110.0,
    rating: 4.7,
    reviews: 312,
    badge: 'Hot',
    brand: 'Apex',
    description: 'A featherlight, highly packable outer layer designed to shield you from the wind and rain. Features a storm hood, water-repellent finish, and active ventilation.',
    features: ['Durable water repellent (DWR) coating', 'Highly packable into own chest pocket', 'Adjustable cinch cord storm hood', 'Underarm mesh breathable vents'],
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Slate Blue', 'Charcoal Black', 'Volt Green'],
    sizes: ['S', 'M', 'L', 'XL']
  }),
  p({
    name: 'Sherpa Thermal Zip Jacket',
    category: 'jackets',
    price: 95.0,
    rating: 4.8,
    reviews: 142,
    badge: 'Best Seller',
    brand: 'Core',
    description: 'Made with soft thick sherpa fleece to trap heat. Features high-quality nylon panels at the collar and chest pocket for extra durability and modern contrast.',
    features: ['High-pile insulating sherpa fleece', 'Contrast nylon panels + chest zip pocket', 'Thick premium zippers', 'Elbow reinforcements'],
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608256246067-1755dc0a7fa0?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Cream Beige', 'Olive Gray', 'Triple Black'],
    sizes: ['S', 'M', 'L', 'XL']
  }),

  // Footwear
  p({
    name: 'Bolt Carbon Running Shoes',
    category: 'footwear',
    price: 140.0,
    oldPrice: 180.0,
    rating: 4.9,
    reviews: 754,
    badge: 'Best Seller',
    brand: 'Kinetic',
    description: 'Engineered for your fastest runs. The Bolt Carbon features a full-length carbon fiber propulsion plate sandwiched in high-rebound nitrogen-infused foam.',
    features: ['Full-length carbon fiber plate', 'Nitrogen-infused foam cushioning', 'Breathable engineered mesh upper', 'High-abrasion rubber outsole'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Neon Crimson', 'White Platinum', 'Stealth Black'],
    sizes: ['8', '9', '10', '11', '12']
  }),
  p({
    name: 'Evolve Studio Trainer',
    category: 'footwear',
    price: 110.0,
    rating: 4.6,
    reviews: 292,
    badge: 'New',
    brand: 'Evolve',
    description: 'A versatile studio shoe built for functional fitness. A flat, stable heel provides support for squats and lifts, while a flexible forefoot allows dynamic movement.',
    features: ['Low-profile stable heel structure', 'Side wraps for lateral stability', 'Knitted sock-like slip-on cuff', 'Lightweight responsive cushion'],
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Pastel Pink', 'White Silver', 'Slate Dark'],
    sizes: ['6', '7', '8', '9', '10']
  }),

  // Accessories
  p({
    name: 'Apex Gym Duffle Bag',
    category: 'accessories',
    price: 48.0,
    oldPrice: 60.0,
    rating: 4.8,
    reviews: 362,
    badge: 'Best Seller',
    brand: 'Apex',
    description: 'The ultimate training duffle. Features a dedicated ventilated shoe compartment, a waterproof wet-dry pouch, and a padded sleeve for your tech.',
    features: ['Ventilated shoe pocket', 'Waterproof wet/dry bag', '15" padded laptop sleeve', 'Durable water-resistant base'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Black Out', 'Slate Gray', 'Forest Green'],
    sizes: ['One Size']
  }),
  p({
    name: 'Core Athlete Cap',
    category: 'accessories',
    price: 22.0,
    rating: 4.5,
    reviews: 116,
    brand: 'Core',
    description: 'Keep the sun out of your eyes and focus on your form. This lightweight cap features sweat-wicking materials and perforated side panels for maximum airflow.',
    features: ['Sweat-wicking performance fabrics', 'Perforated laser-cut vent panels', 'Adjustable low-profile strap clasp', 'Anti-glare under-bill design'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534215754734-18e55d13ce35?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Triple Black', 'Classic White', 'Sage Green'],
    sizes: ['One Size']
  }),
]

export const getProduct = (slug) => products.find((x) => x.slug === slug)
export const getByCategory = (cat) => products.filter((x) => x.category === cat)
export const featured = products.filter((x) => x.badge === 'Best Seller')
export const dealsOfDay = products.filter((x) => x.oldPrice).slice(0, 8)
