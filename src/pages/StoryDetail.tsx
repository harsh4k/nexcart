import React, { useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, Clock, Calendar, Tag, Share2, ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import { STORIES } from '../data/stories';
import { Product, Story } from '../types';

export default function StoryDetailPage({ onAddToCart, products }: { onAddToCart: (p: Product) => void, products: Product[] }) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  
  const story = useMemo(() => STORIES.find(s => s.slug === slug), [slug]);
  const relatedStories = useMemo(() => STORIES.filter(s => s.slug !== slug).slice(0, 2), [slug]);
  const relatedProducts = useMemo(() => 
    products.filter(p => story?.relatedProductIds.includes(p.id)), 
    [story, products]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!story) {
    return (
      <div className="pt-48 pb-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Story not found.</h2>
        <Link to="/stories" className="text-sm font-bold underline">Back to Stories</Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-black z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={story.heroImage}
          alt={story.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
          <div className="max-w-4xl text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-6 mb-6 text-[10px] font-bold uppercase tracking-[0.3em]"
            >
              <span className="px-3 py-1 border border-white/30 rounded-full">{story.category}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {story.date}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {story.readTime}</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-8xl font-bold tracking-tighter mb-8"
            >
              {story.title}
            </motion.h1>
          </div>
        </div>
        
        <Link 
          to="/stories"
          className="absolute top-32 left-8 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
      </section>

      {/* Content Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-12 pb-8 border-b border-gray-100">
            <div className="flex gap-2">
              {story.tags.map(tag => (
                <span key={tag} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <Share2 size={20} />
            </button>
          </div>

          <div 
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-6"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />

          {/* Shop this look */}
          {relatedProducts.length > 0 && (
            <div className="mt-24 p-12 bg-gray-50 rounded-[3rem]">
              <h3 className="text-2xl font-bold mb-8 tracking-tight">Shop this look.</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {relatedProducts.map(product => (
                  <div key={product.id} className="bg-white p-6 rounded-3xl flex gap-6 items-center shadow-sm hover:shadow-md transition-all">
                    <Link to={`/products/${product.id}`} className="shrink-0" tabIndex={-1} aria-hidden="true">
                      <img src={product.image} alt="" loading="lazy" className="w-24 h-24 object-cover rounded-2xl" referrerPolicy="no-referrer" />
                    </Link>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">
                        <Link to={`/products/${product.id}`} className="hover:text-gray-600 transition-colors">{product.name}</Link>
                      </h4>
                      <p className="text-sm text-gray-500 mb-4">${product.price}</p>
                      <button 
                        onClick={() => onAddToCart(product)}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
                      >
                        <ShoppingCart size={14} /> Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Stories */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-bold tracking-tight">Keep reading.</h2>
            <Link to="/stories" className="text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
              All Stories <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {relatedStories.map(s => (
              <Link key={s.id} to={`/stories/${s.slug}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="aspect-video overflow-hidden">
                  <img src={s.coverImage} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                </div>
                <div className="p-8">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">{s.category}</span>
                  <h4 className="text-2xl font-bold tracking-tight group-hover:text-gray-600 transition-colors">{s.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
