import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  cartCount: number;
  wishlistCount: number;
  user: FirebaseUser | null;
}

export const Navbar = ({ onOpenCart, onOpenWishlist, onOpenProfile, onOpenSearch, cartCount, wishlistCount, user }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || !isHomePage ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold tracking-tighter">NexCart</Link>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <button 
              onClick={() => {
                if (isHomePage) {
                  document.getElementById('section-3')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#shop');
                }
              }}
              className="hover:text-gray-500 transition-colors cursor-pointer"
            >
              Shop
            </button>
            <Link to="/stories" className="hover:text-gray-500 transition-colors">Stories</Link>
            <Link to="/about" className="hover:text-gray-500 transition-colors">About</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onOpenSearch} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Search size={20} /></button>
          <button onClick={onOpenProfile} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={20} />
            )}
          </button>
          <button onClick={onOpenWishlist} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{wishlistCount}</span>
            )}
          </button>
          <button onClick={onOpenCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <ShoppingBag size={20} />
            <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
