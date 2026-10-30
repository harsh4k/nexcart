import React from 'react';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-24 px-6">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
      <div className="col-span-2">
        <Link to="/" className="text-3xl font-bold tracking-tighter mb-6 block">NexCart</Link>
        <p className="text-gray-500 max-w-sm mb-8">
          Elevating everyday life through immersive design and cutting-edge technology. Join our journey into the future of retail.
        </p>
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer"><Instagram size={20} /></div>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer"><Twitter size={20} /></div>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer"><Facebook size={20} /></div>
        </div>
      </div>
      <div>
        <h5 className="font-bold mb-6">Shop</h5>
        <ul className="space-y-4 text-gray-500 text-sm">
          <li><Link to="/#shop" className="hover:text-black">All Products</Link></li>
          <li><Link to="/?category=Audio#shop" className="hover:text-black">Audio</Link></li>
          <li><Link to="/?category=Wearables#shop" className="hover:text-black">Wearables</Link></li>
          <li><Link to="/?category=Home#shop" className="hover:text-black">Home</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="font-bold mb-6">Support</h5>
        <ul className="space-y-4 text-gray-500 text-sm">
          <li><Link to="/about" className="hover:text-black">About Us</Link></li>
          <li><Link to="/helpdesk" className="hover:text-black">Help Center</Link></li>
          <li><Link to="/helpdesk" className="hover:text-black">Shipping & Returns</Link></li>
          <li><Link to="/helpdesk" className="hover:text-black">Contact Support</Link></li>
          <li><Link to="/helpdesk" className="hover:text-black">FAQ</Link></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium">
      <p>© 2026 NEXCART DESIGN LAB. ALL RIGHTS RESERVED.</p>
      <div className="flex gap-8">
        <a href="#" className="hover:text-black">PRIVACY POLICY</a>
        <a href="#" className="hover:text-black">TERMS OF SERVICE</a>
      </div>
    </div>
  </footer>
);
