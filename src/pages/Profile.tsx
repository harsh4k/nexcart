import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Settings, 
  ChevronRight, 
  LogOut, 
  Camera, 
  Loader2,
  ShoppingBag,
  Heart,
  Bell,
  Shield
} from 'lucide-react';
import { auth, db, storage } from '../firebase';
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { avatarError } from '../avatar';

export default function ProfilePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const fileError = avatarError(file);
    if (fileError) {
      alert(fileError);
      return;
    }
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      // Force refresh user state if needed, but Firebase Auth usually handles this
      window.location.reload();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  const tabs = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="pt-32 pb-24 px-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-12">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm text-center">
              <div className="relative inline-block group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-xl mx-auto">
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
                <label className="absolute bottom-0 right-0 p-3 bg-black text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                </label>
              </div>
              <h2 className="mt-6 text-2xl font-bold tracking-tight">{user.displayName}</h2>
              <p className="text-gray-500 text-sm mb-8">{user.email}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                <div className="text-center">
                  <p className="text-xl font-bold">12</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">5</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Wishlist</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-8 py-6 text-sm font-bold transition-all border-b last:border-none ${
                    activeTab === tab.id 
                    ? 'bg-black text-white' 
                    : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                  <ChevronRight size={16} className={`ml-auto ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </div>

            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-red-50 text-red-500 rounded-[2.5rem] font-bold text-sm hover:bg-red-100 transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-end mb-8">
                    <h3 className="text-3xl font-bold tracking-tighter">Order History</h3>
                    <p className="text-gray-500 text-sm">Showing last 6 months</p>
                  </div>
                  
                  {[
                    { id: '#NX-9281', date: 'Oct 12, 2025', status: 'Delivered', total: 458, items: 3 },
                    { id: '#NX-8172', date: 'Sep 28, 2025', status: 'In Transit', total: 299, items: 1 },
                    { id: '#NX-7654', date: 'Aug 15, 2025', status: 'Delivered', total: 1250, items: 5 },
                  ].map((order) => (
                    <div key={order.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                          <ShoppingBag className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{order.id}</p>
                          <p className="text-xs text-gray-400">{order.date}</p>
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-xl font-bold">${order.total}</p>
                      </div>
                      <button className="p-4 bg-gray-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-end mb-8">
                    <h3 className="text-3xl font-bold tracking-tighter">Saved Addresses</h3>
                    <button className="px-6 py-3 bg-black text-white rounded-full text-xs font-bold hover:scale-105 transition-transform">
                      Add New
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-black relative">
                      <div className="absolute top-8 right-8">
                        <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Default</span>
                      </div>
                      <h4 className="text-lg font-bold mb-4">Home</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        123 Design Street, Apt 4B<br />
                        Manhattan, NY 10001<br />
                        United States
                      </p>
                      <div className="flex gap-4 mt-8 pt-6 border-t">
                        <button className="text-xs font-bold underline">Edit</button>
                        <button className="text-xs font-bold text-red-500 underline">Delete</button>
                      </div>
                    </div>
                    
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-transparent">
                      <h4 className="text-lg font-bold mb-4">Office</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        456 Innovation Ave, Floor 12<br />
                        Brooklyn, NY 11201<br />
                        United States
                      </p>
                      <div className="flex gap-4 mt-8 pt-6 border-t">
                        <button className="text-xs font-bold underline">Edit</button>
                        <button className="text-xs font-bold text-red-500 underline">Delete</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-end mb-8">
                    <h3 className="text-3xl font-bold tracking-tighter">Payment Methods</h3>
                    <button className="px-6 py-3 bg-black text-white rounded-full text-xs font-bold hover:scale-105 transition-transform">
                      Add Card
                    </button>
                  </div>
                  
                  <div className="bg-black text-white p-10 rounded-[2.5rem] shadow-xl max-w-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-12">
                        <CreditCard size={32} />
                        <span className="text-xs font-bold tracking-[0.3em] uppercase opacity-50">Nex Platinum</span>
                      </div>
                      <p className="text-2xl font-mono tracking-widest mb-8">•••• •••• •••• 4242</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Card Holder</p>
                          <p className="text-sm font-bold uppercase">{user.displayName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Expires</p>
                          <p className="text-sm font-bold">12/28</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <h3 className="text-3xl font-bold tracking-tighter mb-8">Account Settings</h3>
                  
                  <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
                    {[
                      { label: 'Notifications', desc: 'Manage how you receive updates', icon: Bell },
                      { label: 'Security', desc: 'Two-factor authentication and passwords', icon: Shield },
                      { label: 'Privacy', desc: 'Control your data and visibility', icon: User },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-6 p-8 border-b last:border-none hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-all">
                          <item.icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{item.label}</h4>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
