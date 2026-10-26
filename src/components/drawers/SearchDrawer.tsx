import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { Overlay } from '../Overlay';
import { Product } from '../../types';
import { categoriesOf, matchesQuery } from '../../productFilters';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export const SearchDrawer = ({ isOpen, onClose, products }: SearchDrawerProps) => {
  const [query, setQuery] = useState('');
  const results = useMemo(() => products.filter(p => matchesQuery(p, query)), [products, query]);
  const categories = useMemo(() => categoriesOf(products), [products]);

  const close = () => {
    setQuery('');
    onClose();
  };

  const hasQuery = query.trim().length > 0;

  return (
    <Overlay isOpen={isOpen} onClose={close} title="Search Products">
      <div className="space-y-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
          <input
            autoFocus
            type="search"
            aria-label="Search products"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black transition-all"
          />
        </div>

        <div className="space-y-6">
          {hasQuery && results.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No products found for "{query.trim()}"</p>
          ) : (
            <ul className="grid grid-cols-1 gap-6">
              {(hasQuery ? results : products.slice(0, 4)).map(product => (
                <li key={product.id}>
                  <Link to={`/products/${product.id}`} onClick={close} className="flex gap-4 group">
                    <img src={product.image} alt="" loading="lazy" className="w-20 h-24 object-cover rounded-xl" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="font-bold group-hover:text-gray-600 transition-colors">{product.name}</h4>
                      <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
                      <p className="text-sm font-bold">${product.price}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 self-center" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!hasQuery && categories.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Shop by Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Link
                  key={cat}
                  to={`/?category=${encodeURIComponent(cat)}#shop`}
                  onClick={close}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-xs font-medium transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
};
