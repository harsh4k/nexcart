import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingBag, User, X, Trash2, Plus, Minus, Camera, Loader2, LogOut, Heart, Search, ChevronRight } from 'lucide-react';
import { auth, db, storage } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { Product, CartItem } from './types';
import { fetchProducts } from './catalog';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Overlay } from './components/Overlay';
import { ScrollHub } from './components/ScrollHub';
import { LoadingScreen } from './components/LoadingScreen';
import { SmoothScroll } from './components/SmoothScroll';
import { FeedbackWidget } from './components/FeedbackWidget';

const HomePage = React.lazy(() => import('./pages/Home'));
const StoriesPage = React.lazy(() => import('./pages/Stories'));
const StoryDetailPage = React.lazy(() => import('./pages/StoryDetail'));
const AboutPage = React.lazy(() => import('./pages/About'));
const FilmPage = React.lazy(() => import('./pages/Film'));
const CheckoutPage = React.lazy(() => import('./pages/Checkout'));
const ProfilePage = React.lazy(() => import('./pages/Profile'));
const HelpDeskPage = React.lazy(() => import('./pages/HelpDesk'));

function AppContent() {
  const [activeSection, setActiveSection] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Safety net: dismiss loading screen after 10s no matter what
  useEffect(() => {
    const safetyTimer = setTimeout(() => setIsLoading(false), 10000);
    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            createdAt: serverTimestamp()
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchProducts().then((data) => {
      if (cancelled) return;
      setProducts(data);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('nexcart_cart');
      const savedWishlist = localStorage.getItem('nexcart_wishlist');
      // Items saved before product IDs became strings can't be matched to the catalog; drop them.
      const hasStringId = (item: { id?: unknown }) => typeof item?.id === 'string';
      try {
        if (savedCart) setCart((JSON.parse(savedCart) as CartItem[]).filter(hasStringId));
        if (savedWishlist) setWishlist((JSON.parse(savedWishlist) as Product[]).filter(hasStringId));
      } catch {
        localStorage.removeItem('nexcart_cart');
        localStorage.removeItem('nexcart_wishlist');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nexcart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('nexcart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) return prev.filter(item => item.id !== product.id);
      return [...prev, product];
    });
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        setIsProfileOpen(false);
      }
    } catch (error: any) {
      console.error('Sign in failed:', error);
      if (error.code === 'auth/popup-blocked') {
        alert('Please enable popups for this site to sign in.');
      } else {
        alert(`Sign in failed: ${error.message}`);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      alert('Profile picture updated!');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          wishlistCount={wishlist.length}
          user={user}
        />
        
        {location.pathname === '/' && <ScrollHub activeSection={activeSection} />}
        
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={
              <HomePage 
                onAddToCart={addToCart} 
                onAddToWishlist={addToWishlist}
                wishlist={wishlist}
                products={products}
                isLoading={isLoading}
              />
            } />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/stories/:slug" element={<StoryDetailPage onAddToCart={addToCart} products={products} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/film" element={<FilmPage />} />
            <Route path="/checkout" element={<CheckoutPage cart={cart} total={cartTotal} onClearCart={() => setCart([])} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/helpdesk" element={<HelpDeskPage />} />
          </Routes>
        </Suspense>

        <Footer />
        <FeedbackWidget />

      <Overlay isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Your Cart">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <ShoppingBag size={64} className="text-gray-200 mb-4" />
            <p className="text-gray-500">Your cart is empty.</p>
            <button onClick={() => setIsCartOpen(false)} className="mt-4 text-sm font-bold underline">Start Shopping</button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.image} loading="lazy" className="w-20 h-24 object-cover rounded-xl" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">${item.price}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-lg">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-50"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-50"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t mt-6">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total</span>
                <span>${cartTotal}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Checkout Now'}
              </button>
            </div>
          </div>
        )}
      </Overlay>

      <Overlay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} title="Account">
        {!user ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <User size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Welcome to NexCart</h3>
            <p className="text-gray-500 mb-8 text-sm">Sign in to track orders, save your wishlist, and manage your profile.</p>
            <button 
              onClick={handleGoogleSignIn}
              className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" />
              Continue with Google
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-lg">
                  {isUploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Loader2 className="animate-spin text-black" />
                    </div>
                  ) : (
                    <img 
                      src={user.photoURL || 'https://via.placeholder.com/150'} 
                      alt="Profile" 
                      loading="lazy"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                  <Camera size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleProfileUpload} disabled={isUploading} />
                </label>
              </div>
              <h3 className="mt-4 text-xl font-bold">{user.displayName}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Account Status</p>
                <p className="text-sm font-medium">Verified Customer</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Member Since</p>
                <p className="text-sm font-medium">{new Date(user.metadata.creationTime || '').toLocaleDateString()}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsProfileOpen(false);
                navigate('/profile');
              }}
              className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              View Full Profile <ChevronRight size={16} />
            </button>
            <button 
              onClick={handleSignOut}
              className="w-full py-4 border border-red-100 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        )}
      </Overlay>

      <Overlay isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} title="Wishlist">
        {wishlist.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Heart size={64} className="text-gray-200 mb-4" />
            <p className="text-gray-500">Your wishlist is empty.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {wishlist.map(item => (
              <div key={item.id} className="flex gap-4 group">
                <img src={item.image} loading="lazy" className="w-20 h-24 object-cover rounded-xl" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-sm text-gray-500 mb-4">${item.price}</p>
                  <button 
                    onClick={() => {
                      addToCart(item);
                      addToWishlist(item);
                    }}
                    className="text-xs font-bold underline hover:text-gray-600"
                  >
                    Move to Cart
                  </button>
                </div>
                <button onClick={() => addToWishlist(item)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Overlay>

      <Overlay isOpen={isSearchOpen} onClose={() => { setIsSearchOpen(false); setSearchQuery(''); }} title="Search Products">
        <div className="space-y-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              autoFocus
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          <div className="space-y-6">
            {searchQuery && filteredProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No products found for "{searchQuery}"</p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {(searchQuery ? filteredProducts : products.slice(0, 4)).map(product => (
                  <div key={product.id} className="flex gap-4 group cursor-pointer" onClick={() => {
                    // In a real app, this would navigate to product detail
                    // For now, let's just close search and scroll to catalog
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    document.getElementById('section-3')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <img src={product.image} loading="lazy" className="w-20 h-24 object-cover rounded-xl" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="font-bold group-hover:text-gray-600 transition-colors">{product.name}</h4>
                      <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
                      <p className="text-sm font-bold">${product.price}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 self-center" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {!searchQuery && (
            <div className="pt-4 border-t">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Popular Categories</p>
              <div className="flex flex-wrap gap-2">
                {['Audio', 'Wearables', 'Home', 'Accessories'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSearchQuery(cat)}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-xs font-medium transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Overlay>
    </div>
    </SmoothScroll>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
