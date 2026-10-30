import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'motion/react';

import { useCart } from './hooks/useCart';
import { useWishlist } from './hooks/useWishlist';
import { useAuthUser } from './hooks/useAuthUser';
import { useCatalog } from './hooks/useCatalog';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollHub } from './components/ScrollHub';
import { LoadingScreen } from './components/LoadingScreen';
import { SmoothScroll } from './components/SmoothScroll';
import { FeedbackWidget } from './components/FeedbackWidget';
import { CartDrawer } from './components/drawers/CartDrawer';
import { WishlistDrawer } from './components/drawers/WishlistDrawer';
import { AccountDrawer } from './components/drawers/AccountDrawer';
import { SearchDrawer } from './components/drawers/SearchDrawer';
import { ToastProvider } from './components/Toast';

const HomePage = React.lazy(() => import('./pages/Home'));
const ProductPage = React.lazy(() => import('./pages/Product'));
const StoriesPage = React.lazy(() => import('./pages/Stories'));
const StoryDetailPage = React.lazy(() => import('./pages/StoryDetail'));
const AboutPage = React.lazy(() => import('./pages/About'));
const FilmPage = React.lazy(() => import('./pages/Film'));
const CheckoutPage = React.lazy(() => import('./pages/Checkout'));
const ProfilePage = React.lazy(() => import('./pages/Profile'));
const HelpDeskPage = React.lazy(() => import('./pages/HelpDesk'));

type Drawer = 'cart' | 'wishlist' | 'account' | 'search' | null;

function AppContent() {
  const [activeSection, setActiveSection] = useState(0);
  const [openDrawer, setOpenDrawer] = useState<Drawer>(null);
  const cart = useCart();
  const wishlist = useWishlist();
  const user = useAuthUser();
  const { products, isLoading } = useCatalog();
  const { syncWithCatalog } = cart;

  // Keep saved cart prices in line with the live catalog everywhere the cart is shown.
  useEffect(() => {
    if (!isLoading) syncWithCatalog(products);
  }, [isLoading, products, syncWithCatalog]);

  const location = useLocation();
  const navigate = useNavigate();
  const closeDrawer = () => setOpenDrawer(null);

  const handleCheckout = () => {
    if (cart.items.length === 0) return;
    closeDrawer();
    navigate('/checkout');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== '/') return;
      const sections = [0, 1, 2, 3].map(id => {
        const el = document.getElementById(`section-${id}`);
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        return Math.abs(rect.top);
      });
      const minIndex = sections.indexOf(Math.min(...sections));
      setActiveSection(minIndex);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return (
    <SmoothScroll>
      <div className="font-sans text-black selection:bg-black selection:text-white">
        <AnimatePresence>
          {isLoading && <LoadingScreen key="loader" />}
        </AnimatePresence>

        <Navbar
          onOpenCart={() => setOpenDrawer('cart')}
          onOpenWishlist={() => setOpenDrawer('wishlist')}
          onOpenProfile={() => setOpenDrawer('account')}
          onOpenSearch={() => setOpenDrawer('search')}
          cartCount={cart.count}
          wishlistCount={wishlist.items.length}
          user={user}
        />

        {location.pathname === '/' && <ScrollHub activeSection={activeSection} />}

        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={
              <HomePage
                onAddToCart={cart.add}
                onAddToWishlist={wishlist.toggle}
                wishlist={wishlist.items}
                products={products}
                isLoading={isLoading}
              />
            } />
            <Route path="/products/:id" element={
              <ProductPage
                products={products}
                isLoading={isLoading}
                onAddToCart={cart.add}
                onToggleWishlist={wishlist.toggle}
                isInWishlist={wishlist.has}
              />
            } />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/stories/:slug" element={<StoryDetailPage onAddToCart={cart.add} products={products} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/film" element={<FilmPage />} />
            <Route path="/checkout" element={
              <CheckoutPage
                cart={cart.items}
                products={products}
                isLoading={isLoading}
                user={user}
                onRequestSignIn={() => setOpenDrawer('account')}
                onRemoveItem={cart.remove}
                onClearCart={cart.clear}
              />
            } />
            <Route path="/profile" element={<ProfilePage wishlistCount={wishlist.items.length} />} />
            <Route path="/helpdesk" element={<HelpDeskPage />} />
          </Routes>
        </Suspense>

        <Footer />
        <FeedbackWidget />

        <CartDrawer isOpen={openDrawer === 'cart'} onClose={closeDrawer} cart={cart} onCheckout={handleCheckout} />
        <AccountDrawer isOpen={openDrawer === 'account'} onClose={closeDrawer} user={user} />
        <WishlistDrawer isOpen={openDrawer === 'wishlist'} onClose={closeDrawer} wishlist={wishlist} onAddToCart={cart.add} />
        <SearchDrawer isOpen={openDrawer === 'search'} onClose={closeDrawer} products={products} />
      </div>
    </SmoothScroll>
  );
}

export default function App() {
  return (
    <Router>
      {/* Honour the OS "reduce motion" setting for every motion animation. */}
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </MotionConfig>
    </Router>
  );
}
