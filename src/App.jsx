import { Routes, Route } from 'react-router-dom';
import { useAuthInit } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected user pages
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

// Admin pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminBrands from './pages/admin/Brands';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminCoupons from './pages/admin/Coupons';
import AdminBanners from './pages/admin/Banners';

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: '80vh' }}>{children}</main>
    <Footer />
  </>
);

export default function App() {
  useAuthInit();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
      <Route path="/products/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected user routes */}
      <Route path="/cart" element={<ProtectedRoute><PublicLayout><Cart /></PublicLayout></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><PublicLayout><Checkout /></PublicLayout></ProtectedRoute>} />
      <Route path="/order-success/:orderId" element={<ProtectedRoute><PublicLayout><OrderSuccess /></PublicLayout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><PublicLayout><Orders /></PublicLayout></ProtectedRoute>} />
      <Route path="/orders/:orderId" element={<ProtectedRoute><PublicLayout><OrderDetail /></PublicLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><PublicLayout><Profile /></PublicLayout></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><PublicLayout><Wishlist /></PublicLayout></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="banners" element={<AdminBanners />} />
      </Route>
    </Routes>
  );
}
