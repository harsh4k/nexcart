import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { Camera, Loader2, LogOut, Package, RotateCcw, User } from 'lucide-react';
import { auth } from '../firebase';
import { avatarError, uploadAvatar } from '../avatar';
import { fetchOrders, formatPrice, Order, orderRef } from '../orders';
import { useToast } from '../components/Toast';

interface ProfilePageProps {
  wishlistCount: number;
}

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export default function ProfilePage({ wishlistCount }: ProfilePageProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersError, setOrdersError] = useState(false);
  const navigate = useNavigate();
  const notify = useToast();

  useEffect(() => onAuthStateChanged(auth, (u) => {
    if (!u) {
      navigate('/');
      return;
    }
    setUser(u);
    setPhotoURL(u.photoURL);
  }), [navigate]);

  const loadOrders = useCallback(async (uid: string) => {
    setOrders(null);
    setOrdersError(false);
    try {
      setOrders(await fetchOrders(uid));
    } catch (error) {
      console.error('NexCart: loading orders failed.', error);
      setOrdersError(true);
    }
  }, []);

  useEffect(() => {
    if (user) loadOrders(user.uid);
  }, [user, loadOrders]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;
    const fileError = avatarError(file);
    if (fileError) {
      notify(fileError, 'error');
      return;
    }
    setIsUploading(true);
    try {
      setPhotoURL(await uploadAvatar(user, file));
      notify('Profile photo updated.', 'success');
    } catch (error) {
      console.error('NexCart: avatar upload failed.', error);
      notify('Upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="pt-28 md:pt-32 pb-24 px-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm text-center">
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-50 shadow-xl mx-auto bg-gray-100">
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-black" aria-label="Uploading photo" />
                  </div>
                ) : photoURL ? (
                  <img src={photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={48} aria-hidden="true" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-3 bg-black text-white rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-lg focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black">
                <Camera size={18} aria-hidden="true" />
                <span className="sr-only">Change profile photo</span>
                <input type="file" className="sr-only" accept="image/*" onChange={handleUpload} disabled={isUploading} />
              </label>
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">{user.displayName || 'Your account'}</h1>
            {user.email && <p className="text-gray-500 text-sm">{user.email}</p>}
            {user.metadata.creationTime && (
              <p className="text-xs text-gray-400 mt-1">Member since {dateFormat.format(new Date(user.metadata.creationTime))}</p>
            )}

            <dl className="grid grid-cols-2 gap-4 pt-6 mt-8 border-t border-gray-100">
              <div className="flex flex-col-reverse">
                <dt className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Orders</dt>
                <dd className="text-xl font-bold">{orders ? orders.length : '–'}</dd>
              </div>
              <div className="flex flex-col-reverse">
                <dt className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Wishlist</dt>
                <dd className="text-xl font-bold">{wishlistCount}</dd>
              </div>
            </dl>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-white text-red-600 rounded-[2.5rem] font-bold text-sm shadow-sm hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} aria-hidden="true" />
            Sign out
          </button>
        </aside>

        <section className="lg:col-span-2" aria-labelledby="orders-heading">
          <h2 id="orders-heading" className="text-3xl md:text-4xl font-bold tracking-tighter mb-8">Order history</h2>

          {ordersError ? (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm text-center">
              <p className="font-bold mb-2">Your orders could not be loaded.</p>
              <p className="text-sm text-gray-500 mb-6">Check your connection and try again.</p>
              <button
                onClick={() => loadOrders(user.uid)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                <RotateCcw size={16} aria-hidden="true" /> Try again
              </button>
            </div>
          ) : orders === null ? (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm flex justify-center" aria-busy="true">
              <Loader2 className="animate-spin text-gray-400" aria-label="Loading orders" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="text-gray-400" aria-hidden="true" />
              </div>
              <p className="font-bold mb-2">No orders yet</p>
              <p className="text-sm text-gray-500 mb-6">Orders you place will show up here.</p>
              <Link to="/#shop" className="inline-block px-6 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
                Browse the catalog
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map(order => (
                <li key={order.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="font-bold">{orderRef(order.id)}</p>
                      <p className="text-sm text-gray-500">
                        {order.createdAt ? dateFormat.format(order.createdAt) : 'Just now'} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-1">
                        Placed (demo)
                      </span>
                      <p className="text-xl font-bold">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 pt-4 border-t border-gray-100 text-sm">
                    {order.items.map(item => (
                      <li key={item.id} className="flex justify-between gap-4">
                        <Link to={`/products/${item.id}`} className="text-gray-600 hover:text-black hover:underline underline-offset-4">
                          {item.name} × {item.quantity}
                        </Link>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-4">
                    Ship to {order.shipping.name}, {order.shipping.city}, {order.shipping.region}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
