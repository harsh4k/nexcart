import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { Overlay } from '../Overlay';
import { Wishlist } from '../../hooks/useWishlist';
import { Product } from '../../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Wishlist;
  onAddToCart: (product: Product) => void;
}

export const WishlistDrawer = ({ isOpen, onClose, wishlist, onAddToCart }: WishlistDrawerProps) => (
  <Overlay isOpen={isOpen} onClose={onClose} title="Wishlist">
    {wishlist.items.length === 0 ? (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <Heart size={64} className="text-gray-200 mb-4" />
        <p className="text-gray-500">Your wishlist is empty.</p>
      </div>
    ) : (
      <div className="space-y-6">
        {wishlist.items.map(item => (
          <div key={item.id} className="flex gap-4 group">
            <Link to={`/products/${item.id}`} onClick={onClose} className="shrink-0">
              <img src={item.image} alt={item.name} loading="lazy" className="w-20 h-24 object-cover rounded-xl" referrerPolicy="no-referrer" />
            </Link>
            <div className="flex-1">
              <Link to={`/products/${item.id}`} onClick={onClose} className="font-bold hover:text-gray-600 transition-colors">
                {item.name}
              </Link>
              <p className="text-sm text-gray-500 mb-4">${item.price}</p>
              <button
                onClick={() => {
                  onAddToCart(item);
                  wishlist.remove(item.id);
                }}
                className="text-xs font-bold underline hover:text-gray-600"
              >
                Move to Cart
              </button>
            </div>
            <button onClick={() => wishlist.remove(item.id)} aria-label={`Remove ${item.name} from wishlist`} className="self-start text-gray-400 hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    )}
  </Overlay>
);
