// One source of truth for how each notification type is presented: which icon
// sits in the card, the color tone of that icon chip, and a short human label
// (used by the admin type filter/badges). Shared by the client and admin UIs so
// a type always looks the same everywhere.
import {
  Bag,
  Truck,
  Check,
  Package,
  CreditCard,
  Boxes,
  Star,
  Users,
  User,
  Megaphone,
  Bell,
  AlertTriangle,
  Tag,
  Sparkles,
  Receipt,
  Mail,
  Close,
} from '../components/icons'

// Icon-chip color tones (light surfaces — the storefront navbar and the admin
// console are both light). Each maps to a "bg + text" pair.
const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  sky: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  violet: 'bg-violet-50 text-violet-600',
  neutral: 'bg-neutral-100 text-neutral-600',
}

const META = {
  // ----- customer facing -----
  order_placed: { Icon: Bag, tone: 'indigo', label: 'Order placed' },
  order_confirmed: { Icon: Check, tone: 'emerald', label: 'Order confirmed' },
  order_processing: { Icon: Package, tone: 'indigo', label: 'Processing' },
  order_shipped: { Icon: Truck, tone: 'sky', label: 'Shipped' },
  order_delivered: { Icon: Check, tone: 'emerald', label: 'Delivered' },
  order_cancelled: { Icon: Close, tone: 'rose', label: 'Cancelled' },
  order_status: { Icon: Receipt, tone: 'indigo', label: 'Order update' },
  payment_success: { Icon: CreditCard, tone: 'emerald', label: 'Payment' },
  payment_failed: { Icon: CreditCard, tone: 'rose', label: 'Payment failed' },
  payment_update: { Icon: CreditCard, tone: 'amber', label: 'Payment update' },
  product_back_in_stock: { Icon: Boxes, tone: 'emerald', label: 'Back in stock' },
  price_offer: { Icon: Tag, tone: 'amber', label: 'Offer' },
  promotion: { Icon: Sparkles, tone: 'violet', label: 'Promotion' },
  announcement: { Icon: Megaphone, tone: 'indigo', label: 'Announcement' },
  account: { Icon: User, tone: 'neutral', label: 'Account' },
  // ----- admin facing -----
  admin_new_order: { Icon: Receipt, tone: 'indigo', label: 'New order' },
  admin_new_user: { Icon: Users, tone: 'sky', label: 'New customer' },
  admin_order_cancelled: { Icon: AlertTriangle, tone: 'rose', label: 'Order cancelled' },
  admin_payment_issue: { Icon: CreditCard, tone: 'rose', label: 'Payment issue' },
  admin_low_stock: { Icon: Boxes, tone: 'amber', label: 'Low stock' },
  admin_out_of_stock: { Icon: Boxes, tone: 'rose', label: 'Out of stock' },
  admin_review: { Icon: Star, tone: 'amber', label: 'New review' },
  admin_contact: { Icon: Mail, tone: 'indigo', label: 'Support request' },
  admin_system: { Icon: Bell, tone: 'neutral', label: 'System' },
  // ----- catch-all -----
  custom: { Icon: Megaphone, tone: 'violet', label: 'Announcement' },
}

const FALLBACK = { Icon: Bell, tone: 'neutral', label: 'Notification' }

// Returns { Icon, tone, label, chip } for a type. `chip` is the ready-to-use
// className for the icon container.
export function notificationMeta(type) {
  const m = META[type] || FALLBACK
  return { ...m, chip: TONES[m.tone] || TONES.neutral }
}

// The notification types an admin can author from the "Send notification" form.
export const SENDABLE_TYPES = [
  { value: 'announcement', label: 'General announcement' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'price_offer', label: 'Price / offer' },
  { value: 'account', label: 'Account update' },
  { value: 'custom', label: 'Custom' },
]
