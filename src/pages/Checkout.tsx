import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { CartItem, Product } from '../types';
import { EMPTY_SHIPPING, newOrderId, OrderNotConfirmedError, orderRef, placeOrder, priceCart, ShippingDetails, trimShipping } from '../orders';
import { ShippingForm } from '../components/checkout/ShippingForm';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { useToast } from '../components/Toast';

interface CheckoutPageProps {
  cart: CartItem[];
  products: Product[];
  isLoading: boolean;
  user: FirebaseUser | null;
  onRequestSignIn: () => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

type Step = 'shipping' | 'review';

export default function CheckoutPage({ cart, products, isLoading, user, onRequestSignIn, onRemoveItem, onClearCart }: CheckoutPageProps) {
  const [step, setStep] = useState<Step>('shipping');
  const [shipping, setShipping] = useState<ShippingDetails>(EMPTY_SHIPPING);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const notify = useToast();
  // One ID per checkout, reused on retry, so a slow or repeated attempt never creates two orders.
  const pendingOrder = useRef<{ uid: string; id: string } | null>(null);

  const priced = useMemo(() => priceCart(cart, products), [cart, products]);

  useEffect(() => { window.scrollTo(0, 0); }, [step, placedOrderId]);

  const handlePlaceOrder = async () => {
    if (!user || isPlacing || priced.unavailable.length > 0 || priced.lines.length === 0) return;
    setIsPlacing(true);
    if (pendingOrder.current?.uid !== user.uid) pendingOrder.current = { uid: user.uid, id: newOrderId(user.uid) };
    const { id } = pendingOrder.current;
    try {
      await placeOrder(user.uid, id, priced, shipping);
      setPlacedOrderId(id);
      onClearCart();
    } catch (error) {
      console.error('NexCart: placing the order failed.', error);
      notify(error instanceof OrderNotConfirmedError
        ? 'We could not reach the server. Check your connection and try again.'
        : 'Your order could not be placed. Please try again.', 'error');
    } finally {
      setIsPlacing(false);
    }
  };

  if (placedOrderId) {
    return (
      <main className="pt-32 pb-24 px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14 }}
          className="w-24 h-24 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 size={48} aria-hidden="true" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Order placed</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">{orderRef(placedOrderId)}</p>
        <p className="text-gray-500 mb-12 text-lg max-w-md">
          Your order is saved to your account. This is a demo store, so no payment was taken and nothing will ship.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/profile" className="px-10 py-5 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors">
            View your orders
          </Link>
          <Link to="/#shop" className="px-10 py-5 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-colors">
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-gray-50" aria-busy="true">
        <Loader2 className="animate-spin text-gray-400" size={32} aria-label="Loading checkout" />
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="pt-32 pb-24 px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-lg">Add some items to your cart before checking out.</p>
        <Link to="/#shop" className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors">
          Back to shop
        </Link>
      </main>
    );
  }

  const address = trimShipping(shipping);
  const steps: { id: Step; label: string }[] = [{ id: 'shipping', label: 'Shipping' }, { id: 'review', label: 'Review' }];
  const stepIndex = steps.findIndex(s => s.id === step);

  return (
    <main className="pt-28 md:pt-32 pb-24 px-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Link to="/#shop" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-6">
          <ArrowLeft size={16} aria-hidden="true" /> Continue shopping
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-10">Checkout</h1>

        {priced.unavailable.length > 0 && (
          <div role="alert" className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row sm:items-center gap-4">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} aria-hidden="true" />
            <p className="flex-1 text-sm text-amber-900">
              {priced.unavailable.map(item => item.name).join(', ')} {priced.unavailable.length === 1 ? 'is' : 'are'} no
              longer available. Remove {priced.unavailable.length === 1 ? 'it' : 'them'} to continue.
            </p>
            <button
              onClick={() => priced.unavailable.forEach(item => onRemoveItem(item.id))}
              className="px-5 py-3 bg-amber-900 text-white rounded-full text-sm font-bold hover:bg-amber-800 transition-colors"
            >
              Remove unavailable items
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-3 space-y-6">
            <ol className="flex gap-3" aria-label="Checkout steps">
              {steps.map((s, i) => (
                <li key={s.id} className="flex-1" aria-current={s.id === step ? 'step' : undefined}>
                  <div className={`h-1 rounded-full mb-2 transition-colors ${i <= stepIndex ? 'bg-black' : 'bg-gray-200'}`} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${i <= stepIndex ? 'text-black' : 'text-gray-400'}`}>
                    {i + 1}. {s.label}
                  </span>
                </li>
              ))}
            </ol>

            {step === 'shipping' ? (
              <ShippingForm value={shipping} onChange={setShipping} onSubmit={() => setStep('review')} />
            ) : (
              <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6" aria-labelledby="review-heading">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-gray-400" size={24} aria-hidden="true" />
                  <h2 id="review-heading" className="text-xl font-bold">Review and place order</h2>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl flex justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Shipping to</p>
                    <p className="text-sm font-medium">{address.name}</p>
                    <p className="text-sm text-gray-600">
                      {address.address}, {address.city}, {address.region} {address.postalCode}
                    </p>
                  </div>
                  <button onClick={() => setStep('shipping')} className="self-start text-sm font-bold underline underline-offset-4">
                    Edit
                  </button>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Payment</p>
                  <p className="text-sm font-medium">None. This is a demo order.</p>
                </div>
                {user ? (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacing || priced.unavailable.length > 0}
                    className="w-full py-5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isPlacing ? <><Loader2 className="animate-spin" size={20} aria-hidden="true" /> Placing order…</> : 'Place order'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={onRequestSignIn}
                      className="w-full py-5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogIn size={20} aria-hidden="true" /> Sign in to place your order
                    </button>
                    <p className="text-xs text-center text-gray-500">Orders are saved to your account so you can find them later.</p>
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <OrderSummary cart={priced} />
          </div>
        </div>
      </div>
    </main>
  );
}
