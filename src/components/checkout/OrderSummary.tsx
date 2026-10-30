import { Info } from 'lucide-react';
import { formatPrice, PricedCart } from '../../orders';

export function OrderSummary({ cart }: { cart: PricedCart }) {
  return (
    <div className="space-y-6">
      <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="text-xl font-bold mb-6">Order summary</h2>
        <ul className="space-y-4 mb-6">
          {cart.lines.map(line => (
            <li key={line.id} className="flex items-center gap-4">
              <img src={line.image} alt="" className="w-14 h-16 object-cover rounded-xl bg-gray-100 shrink-0" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{line.name}</p>
                <p className="text-xs text-gray-500">Qty {line.quantity}</p>
              </div>
              <p className="text-sm font-bold">{formatPrice(line.price * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="space-y-3 pt-6 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <dt className="text-gray-500">Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</dt>
            <dd className="font-bold">{formatPrice(cart.total)}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-500">Shipping</dt>
            <dd className="font-bold">Free</dd>
          </div>
          <div className="flex justify-between text-xl font-bold pt-3">
            <dt>Total</dt>
            <dd>{formatPrice(cart.total)}</dd>
          </div>
        </dl>
      </section>

      <aside className="bg-black text-white p-6 md:p-8 rounded-[2.5rem]">
        <div className="flex items-center gap-3 mb-3">
          <Info size={20} className="text-gray-400" aria-hidden="true" />
          <p className="text-sm font-bold">Demo checkout</p>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          NexCart is a portfolio project. No payment is taken and nothing ships. Orders are saved to your
          account so you can see them on your profile.
        </p>
      </aside>
    </div>
  );
}
