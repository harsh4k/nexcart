import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { Overlay } from '../Overlay';
import { Cart, MAX_QUANTITY } from '../../hooks/useCart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onCheckout: () => void;
}

export const CartDrawer = ({ isOpen, onClose, cart, onCheckout }: CartDrawerProps) => (
  <Overlay isOpen={isOpen} onClose={onClose} title="Your Cart">
    {cart.items.length === 0 ? (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <ShoppingBag size={64} className="text-gray-200 mb-4" />
        <p className="text-gray-500">Your cart is empty.</p>
        <button onClick={onClose} className="mt-4 text-sm font-bold underline">Start Shopping</button>
      </div>
    ) : (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-6">
          {cart.items.map(item => (
            <div key={item.id} className="flex gap-4">
              <Link to={`/products/${item.id}`} onClick={onClose} className="shrink-0">
                <img src={item.image} alt={item.name} loading="lazy" className="w-20 h-24 object-cover rounded-xl" referrerPolicy="no-referrer" />
              </Link>
              <div className="flex-1">
                <Link to={`/products/${item.id}`} onClick={onClose} className="font-bold hover:text-gray-600 transition-colors">
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 mb-2">${item.price}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => cart.updateQuantity(item.id, -1)} disabled={item.quantity <= 1} aria-label={`Decrease quantity of ${item.name}`} className="p-1 hover:bg-gray-50 disabled:opacity-30"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-medium" aria-live="polite">{item.quantity}</span>
                    <button onClick={() => cart.updateQuantity(item.id, 1)} disabled={item.quantity >= MAX_QUANTITY} aria-label={`Increase quantity of ${item.name}`} className="p-1 hover:bg-gray-50 disabled:opacity-30"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => cart.remove(item.id)} aria-label={`Remove ${item.name} from cart`} className="text-gray-400 hover:text-red-500 transition-colors">
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
            <span>${cart.total}</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            Checkout Now
          </button>
        </div>
      </div>
    )}
  </Overlay>
);
