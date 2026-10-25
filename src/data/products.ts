import { Product } from '../types';

// Built-in catalog. Used when the Firestore `products` collection is empty or
// unreachable, so the store works with zero configuration. It is also the seed
// data for that collection: document IDs should match these `id` values.
export const PRODUCTS: Product[] = [
  {
    id: 'nex-one-headphones',
    name: 'Nex One Headphones',
    price: 299,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
    description: 'Immersive sound, redefined. Experience every note with crystal clarity.',
  },
  {
    id: 'lumina-smart-watch',
    name: 'Lumina Smart Watch',
    price: 199,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000',
    description: 'Your life, synced. Track your health and stay connected effortlessly.',
  },
  {
    id: 'nebula-glass-speaker',
    name: 'Nebula Glass Speaker',
    price: 450,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&q=80&w=1000',
    description: 'A piece of art that sounds as good as it looks. 360-degree audio.',
  },
  {
    id: 'aura-smart-lamp',
    name: 'Aura Smart Lamp',
    price: 129,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=1000',
    description: 'Adaptive lighting that mimics the natural rhythm of the sun.',
  },
  {
    id: 'zenith-earbuds',
    name: 'Zenith Earbuds',
    price: 159,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=1000',
    description: 'Ultra-compact, ultra-powerful. The perfect companion for your daily commute.',
  },
  {
    id: 'titan-fitness-tracker',
    name: 'Titan Fitness Tracker',
    price: 89,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1557166983-5939644443a0?auto=format&fit=crop&q=80&w=1000',
    description: 'Rugged, reliable, and ready for any challenge. Your ultimate fitness partner.',
  },
];
