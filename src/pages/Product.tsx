import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Heart, Minus, Plus, ShoppingCart, Truck, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { MAX_QUANTITY } from '../hooks/useCart';

interface ProductPageProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (id: string) => boolean;
}

export default function ProductPage({ products, isLoading, onAddToCart, onToggleWishlist, isInWishlist }: ProductPageProps) {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const product = useMemo(() => products.find(p => p.id === id), [products, id]);
  const related = useMemo(
    () => (product ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3) : []),
    [products, product],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    setJustAdded(false);
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const previous = document.title;
    document.title = `${product.name} — NexCart`;
    return () => { document.title = previous; };
  }, [product]);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [justAdded]);

  if (isLoading) {
    return <div className="pt-32 pb-24 min-h-screen bg-gray-50" aria-busy="true" />;
  }

  if (!product) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-4">Product not found</h1>
        <p className="text-gray-500 mb-8 text-lg">It may have been removed from the catalog.</p>
        <Link to="/#shop" className="px-8 py-4 bg-black text-white rounded-full font-bold hover:scale-105 transition-transform">
          Back to Shop
        </Link>
      </div>
    );
  }

  const saved = isInWishlist(product.id);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
  };

  return (
    <main className="pt-28 md:pt-32 pb-24 px-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link to="/#shop" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-8 md:mb-12">
          <ArrowLeft size={16} aria-hidden="true" /> Back to catalog
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-sm"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:sticky lg:top-32 space-y-8"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">{product.category}</p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">{product.name}</h1>
              <p className="text-3xl font-bold">${product.price}</p>
            </div>

            <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-[1fr_auto] sm:flex gap-3">
              <div className="flex items-center justify-between bg-white rounded-2xl px-2 py-2 shadow-sm sm:w-40">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="p-3 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-bold" aria-live="polite" aria-label={`Quantity ${quantity}`}>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(MAX_QUANTITY, q + 1))}
                  disabled={quantity >= MAX_QUANTITY}
                  aria-label="Increase quantity"
                  className="p-3 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                className={`col-span-2 order-last sm:order-none sm:flex-1 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors duration-300 ${justAdded ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                {justAdded ? <><CheckCircle2 size={18} /> Added to cart</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>

              <button
                onClick={() => onToggleWishlist(product)}
                aria-pressed={saved}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`p-5 rounded-2xl border flex items-center justify-center transition-colors ${saved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-8 border-t border-gray-200">
              <Link to="/helpdesk" className="flex items-start gap-3 p-4 bg-white rounded-2xl hover:shadow-sm transition-shadow">
                <Truck size={20} className="text-gray-400 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-bold">Shipping</span>
                  <span className="block text-xs text-gray-500">Delivery times and options</span>
                </span>
              </Link>
              <Link to="/helpdesk" className="flex items-start gap-3 p-4 bg-white rounded-2xl hover:shadow-sm transition-shadow">
                <RotateCcw size={20} className="text-gray-400 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-bold">Returns</span>
                  <span className="block text-xs text-gray-500">How returns work</span>
                </span>
              </Link>
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <section className="mt-24 md:mt-32" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-3xl md:text-4xl font-bold tracking-tight mb-10">More in {product.category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map(item => (
                <Link key={item.id} to={`/products/${item.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-6 flex justify-between items-start gap-4">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="text-lg font-bold">${item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
