import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion"; // Added for impressive UI transitions

// Styling
import './App.css';

// Context Providers
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { NotificationProvider } from './context/NotificationContext'; 

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About'; 
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess'; 
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDash from './pages/SellerDash';
import AdminDash from './pages/AdminDash';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile'; 
import Orders from './pages/Orders';
import Notifications from './pages/Notifications'; 
import PaymentSuccess from "./pages/PaymentSuccess";

// Admin Management Components
import ProductModeration from "./components/admin/ProductModeration";
import BrandManagement from "./components/admin/BrandManagement";
import AttributeManagement from "./components/admin/AttributeManagement";
import BannerManagement from "./components/admin/BannerManagement";
import CategoryManagement from "./components/admin/CategoryManagement";
import OrderManagement from "./components/admin/OrderManagement";
import TransactionManagement from "./components/admin/TransactionManagement";

/**
 * HELPER: Scroll To Top on Route Change
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

/**
 * PAGE WRAPPER: Impressive entrance animation for every page
 */
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

/**
 * PROTECTED ROUTE COMPONENT
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent"
        />
        <p className="mt-4 text-gray-600 font-medium animate-pulse">Loading Ethmarket...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * LAYOUT MANAGER
 */
const AppLayout = () => {
  const location = useLocation();

  // Dashboard detection: Hide Nav/Footer for Admin and Seller panels
  const isDashboard =
    location.pathname.includes("/seller") ||
    location.pathname.includes("/admin");

  return (
    <>
      <ScrollToTop />

      {!isDashboard && <Navbar />}

      <main className={isDashboard ? "dashboard-root" : "storefront-root min-h-[80vh]"}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/product/:id" element={<PageTransition><ProductDetails /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />

            {/* --- AUTH ROUTES --- */}
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route
              path="/register-seller"
              element={<PageTransition><Register isSellerRegistration={true} /></PageTransition>}
            />

            {/* --- SHOPPING ROUTES --- */}
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <PageTransition><Checkout /></PageTransition>
                </ProtectedRoute>
              }
            />

            <Route path="/order-success" element={<PageTransition><OrderSuccess /></PageTransition>} />
            <Route path="/payment-success" element={<PageTransition><PaymentSuccess /></PageTransition>} />

            {/* --- USER ROUTES --- */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PageTransition><Profile /></PageTransition>
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <PageTransition><Orders /></PageTransition>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <PageTransition><Notifications /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* --- SELLER DASHBOARD --- */}
            <Route
              path="/seller/*"
              element={
                <ProtectedRoute allowedRole="seller">
                  <SellerDash />
                </ProtectedRoute>
              }
            />

            {/* --- ADMIN DASHBOARD --- */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDash />
                </ProtectedRoute>
              }
            />

            {/* --- ADMIN MANAGEMENT PAGES --- */}
            <Route
              path="/admin/products"
              element={<ProtectedRoute allowedRole="admin"><ProductModeration /></ProtectedRoute>}
            />
            <Route
              path="/admin/categories"
              element={<ProtectedRoute allowedRole="admin"><CategoryManagement /></ProtectedRoute>}
            />
            <Route
              path="/admin/brands"
              element={<ProtectedRoute allowedRole="admin"><BrandManagement /></ProtectedRoute>}
            />
            <Route
              path="/admin/attributes"
              element={<ProtectedRoute allowedRole="admin"><AttributeManagement /></ProtectedRoute>}
            />
            <Route
              path="/admin/banners"
              element={<ProtectedRoute allowedRole="admin"><BannerManagement /></ProtectedRoute>}
            />
            <Route
              path="/admin/orders"
              element={<ProtectedRoute allowedRole="admin"><OrderManagement /></ProtectedRoute>}
            />
            <Route
              path="/admin/transactions"
              element={<ProtectedRoute allowedRole="admin"><TransactionManagement /></ProtectedRoute>}
            />

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </AnimatePresence>
      </main>

      {!isDashboard && <Footer />}
    </>
  );
};

/**
 * MAIN APP COMPONENT
 */
function App() {
  return (
    <AuthProvider>
      <NotificationProvider> 
        <CartProvider>
          <Router>
            <Toaster 
              position="top-right" 
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '12px'
                },
              }}
            />
            <AppLayout />
          </Router>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;