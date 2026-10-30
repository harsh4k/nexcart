import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowRight, ShoppingCart, Heart, CheckCircle2 } from 'lucide-react';
import { Product, CartItem } from '../types';
import { PRODUCTS } from '../data/products';
import { categoriesOf } from '../productFilters';

// --- Components ---

const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section id="section-0" className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-50">
      <motion.div style={{ y, opacity }} className="text-center z-10 px-6">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-bold tracking-[0.3em] uppercase mb-4 block"
        >
          Future of Retail
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-8"
        >
          Immersive <br /> Essentials.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center"
        >
          <button 
            onClick={() => document.getElementById('section-3')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-black text-white rounded-full font-medium hover:scale-105 transition-transform flex items-center gap-2"
          >
            Explore Collection <ArrowRight size={18} />
          </button>
          <Link 
            to="/film" 
            className="px-8 py-4 border border-black rounded-full font-medium hover:bg-black hover:text-white transition-all inline-block"
          >
            Watch Film
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Decorative Elements */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"
      />
      <motion.div 
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50"
      />
    </section>
  );
};

const ImmersiveResponse1 = ({ onAddToCart, products }: { onAddToCart: (p: Product) => void, products: Product[] }) => {
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 0.5], [10, 0]);
  const x = useTransform(scrollYProgress, [0, 0.5], [-100, 0]);

  const featuredProduct = products[0] || PRODUCTS[0];

  return (
    <section ref={containerRef} id="section-1" className="min-h-screen py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ scale, rotate, x }} 
          className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl"
        >
          <img 
            src={featuredProduct.image} 
            alt={featuredProduct.name} 
            loading="lazy"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
            <div className="text-white">
              <p className="text-sm font-bold uppercase tracking-widest mb-2">Featured Product</p>
              <h3 className="text-4xl font-bold">{featuredProduct.name}</h3>
            </div>
          </div>
        </motion.div>
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-5xl font-bold tracking-tight mb-6">Sound that moves with you.</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our most advanced audio engineering yet. Featuring spatial awareness and adaptive noise cancellation that responds to your environment in real-time.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Battery Life', value: '40h' },
              { label: 'Drivers', value: '50mm' },
              { label: 'Weight', value: '250g' },
              { label: 'Bluetooth', value: '5.3' }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-gray-50 rounded-2xl"
              >
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>
          <button 
            onClick={() => onAddToCart(featuredProduct)}
            className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors active:scale-95"
          >
            Pre-order Now — ${featuredProduct.price}
          </button>
        </div>
      </div>
    </section>
  );
};

const ImmersiveResponse2 = () => {
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const textX1 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const textX2 = useTransform(scrollYProgress, [0, 1], [-200, 200]);

  return (
    <section ref={containerRef} id="section-2" className="relative h-[100vh] bg-black flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src="https://player.vimeo.com/external/517729244.hd.mp4?s=0e3049f579308e285f34006696c738f654167e40&profile_id=175"
        />
      </div>
      
      {/* Background Scrolling Text - Top */}
      <div className="absolute top-20 left-0 right-0 z-0 pointer-events-none">
        <motion.div style={{ x: textX1 }} className="whitespace-nowrap flex gap-24">
          {['Innovation', 'Precision', 'Design', 'Future'].map((word) => (
            <span key={word} className="text-[15vw] font-black text-white/5 uppercase italic leading-none">
              {word}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Background Scrolling Text - Bottom */}
      <div className="absolute bottom-20 left-0 right-0 z-0 pointer-events-none">
        <motion.div style={{ x: textX2 }} className="whitespace-nowrap flex gap-24">
          {['Quality', 'Craft', 'Vision', 'Nex'].map((word) => (
            <span key={word} className="text-[15vw] font-black text-white/5 uppercase italic leading-none">
              {word}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 max-w-3xl text-center px-6">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <h3 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
            The Craft of <br /> Tomorrow.
          </h3>
          <div className="w-24 h-1 bg-white mx-auto rounded-full" />
          <p className="text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
            Every component is meticulously selected for performance and sustainability. We don't just build products; we craft experiences.
          </p>
          <div className="pt-8">
            <Link to="/about" className="px-10 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform inline-block">
              Our Process
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ImmersiveResponse3 = ({ onAddToCart, onAddToWishlist, wishlist, products, isLoading }: { onAddToCart: (p: Product) => void, onAddToWishlist: (p: Product) => void, wishlist: Product[], products: Product[], isLoading: boolean }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const categories = useMemo(() => categoriesOf(products), [products]);
  const requested = searchParams.get('category');
  const activeCategory = requested && categories.includes(requested) ? requested : null;
  const visibleProducts = activeCategory ? products.filter(p => p.category === activeCategory) : products;

  const selectCategory = (category: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (category) next.set('category', category);
    else next.delete('category');
    setSearchParams(next, { replace: true, preventScrollReset: true });
  };

  // Links like /#shop or /?category=Audio#shop land on the catalog once it has rendered.
  useEffect(() => {
    if (isLoading || location.hash !== '#shop') return;
    document.getElementById('section-3')?.scrollIntoView({ behavior: 'smooth' });
  }, [isLoading, location.hash, location.key]);

  const handleAdd = (product: Product) => {
    setAddingId(product.id);
    onAddToCart(product);
    setTimeout(() => setAddingId(null), 1000);
  };

  if (isLoading) {
    return (
      <section id="section-3" className="py-24 px-6 bg-gray-50 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </section>
    );
  }

  return (
    <section id="section-3" className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-2">Curated Catalog</h2>
            <p className="text-gray-500">Handpicked for the modern lifestyle.</p>
          </div>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 -mt-4 mb-10" role="group" aria-label="Filter by category">
            {[null, ...categories].map(category => {
              const isActive = category === activeCategory;
              return (
                <button
                  key={category ?? 'all'}
                  onClick={() => selectCategory(category)}
                  aria-pressed={isActive}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${isActive ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}
                >
                  {category ?? 'All'}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] shadow-sm">
              <p className="text-gray-500 font-medium">Our catalog is currently being updated. Please check back soon.</p>
            </div>
          ) : (
            visibleProducts.map((product, idx) => {
              const isInWishlist = wishlist.some(item => item.id === product.id);
              return (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1 }}
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <Link to={`/products/${product.id}`} className="block aspect-[4/5] overflow-hidden" tabIndex={-1} aria-hidden="true">
                    <motion.img 
                      animate={{ scale: hoveredId === product.id ? 1.1 : 1 }}
                      transition={{ duration: 0.6 }}
                      src={product.image} 
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
                        <h4 className="text-xl font-bold">
                          <Link to={`/products/${product.id}`} className="hover:text-gray-600 transition-colors">{product.name}</Link>
                        </h4>
                      </div>
                      <p className="text-xl font-bold">${product.price}</p>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">{product.description}</p>
                    
                    <div className="flex gap-2">
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAdd(product)}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${addingId === product.id ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}
                      >
                        {addingId === product.id ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                            <CheckCircle2 size={16} /> Added
                          </motion.div>
                        ) : (
                          <>
                            <ShoppingCart size={16} /> Add to Cart
                          </>
                        )}
                      </motion.button>
                      <button 
                        onClick={() => onAddToWishlist(product)}
                        aria-pressed={isInWishlist}
                        aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                        className={`p-3 border rounded-xl transition-colors ${isInWishlist ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default function HomePage({ 
  onAddToCart, 
  onAddToWishlist, 
  wishlist, 
  products, 
  isLoading 
}: { 
  onAddToCart: (p: Product) => void, 
  onAddToWishlist: (p: Product) => void, 
  wishlist: Product[], 
  products: Product[], 
  isLoading: boolean 
}) {
  return (
    <main>
      <HeroSection />
      <ImmersiveResponse1 onAddToCart={onAddToCart} products={products} />
      <ImmersiveResponse2 />
      <ImmersiveResponse3 
        onAddToCart={onAddToCart} 
        onAddToWishlist={onAddToWishlist}
        wishlist={wishlist}
        products={products}
        isLoading={isLoading}
      />
    </main>
  );
}
