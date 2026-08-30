import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Wishlist from './pages/Wishlist'
import OrderSuccess from './pages/OrderSuccess'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Signup from './pages/Signup'
import RequireAdmin from './components/RequireAdmin'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/AdminProducts'
import ProductForm from './pages/admin/ProductForm'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCountries from './pages/admin/AdminCountries'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminSettings from './pages/admin/AdminSettings'
import AdminReviews from './pages/admin/AdminReviews'
import AdminInventory from './pages/admin/AdminInventory'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import ViewStoreAsUser from './pages/admin/ViewStoreAsUser'

export default function App() {
  return (
    <Routes>
      {/* Standalone full-page auth routes (no shop chrome) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin console (role-guarded) */}
      <Route
        path="/admin/view-store"
        element={
          <RequireAdmin>
            <ViewStoreAsUser />
          </RequireAdmin>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="countries" element={<AdminCountries />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
