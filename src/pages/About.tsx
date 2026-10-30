import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Globe, Shield, Zap, Cpu, MousePointer2, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const ValueCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    viewport={{ once: true }}
    className="p-8 bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-50 group"
  >
    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-500">
      <Icon size={28} />
    </div>
    <h4 className="text-xl font-bold mb-4 tracking-tight">{title}</h4>
    <p className="text-gray-500 leading-relaxed text-sm">
      {description}
    </p>
  </motion.div>
);

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" 
            alt="Office" 
            className="w-full h-full object-cover opacity-40 grayscale"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block text-gray-400"
          >
            Established 2026
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 leading-[0.9]"
          >
            Design for <br /> the Human <br /> Experience.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            NexCart is a design laboratory focused on bridging the gap between cutting-edge technology and minimalist aesthetics.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Scroll to Explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-gray-500 to-transparent" />
        </motion.div>
      </section>

      {/* Our Story Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
              Born from a <br /> simple question.
            </h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Why does high-performance technology have to look so complicated? In 2026, we set out to answer that question by creating NexCart—a platform dedicated to products that are as beautiful as they are functional.
              </p>
              <p>
                We believe that the objects we surround ourselves with should inspire us. They should be intuitive, sustainable, and crafted with an obsessive attention to detail.
              </p>
              <p>
                Today, NexCart is more than just a store. It's a community of designers, engineers, and visionaries who believe that the future of retail is immersive, personal, and profoundly simple.
              </p>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl translate-y-12"
            >
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" 
            alt="Crafting" 
            loading="lazy"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1000" 
                alt="Design" 
                loading="lazy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Our Philosophy.</h2>
            <p className="text-xl text-gray-500">The principles that guide every decision we make, from the first sketch to the final product.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
              icon={Zap}
              title="Innovation"
              description="We don't just follow trends; we create them. Our R&D lab is constantly pushing the boundaries of what's possible in consumer tech."
              delay={0.1}
            />
            <ValueCard 
              icon={Layers}
              title="Precision"
              description="Every millimeter matters. We obsess over tolerances, materials, and finishes to ensure a flawless user experience."
              delay={0.2}
            />
            <ValueCard 
              icon={Globe}
              title="Sustainability"
              description="Design shouldn't come at the cost of the planet. We prioritize circular materials and ethical manufacturing processes."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-6 bg-black text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-center relative z-10">
          {[
            { label: 'Global Users', value: '2.5M+' },
            { label: 'Design Awards', value: '48' },
            { label: 'Countries', value: '120+' },
            { label: 'Patents', value: '150+' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">{stat.value}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Background Text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <span className="text-[40vw] font-black italic uppercase">NEX</span>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">Ready to experience <br /> the future?</h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link 
                to="/#shop" 
                className="px-10 py-5 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                Explore Shop <ArrowRight size={20} />
              </Link>
              <Link 
                to="/stories" 
                className="px-10 py-5 border border-white/20 rounded-full font-bold hover:bg-white hover:text-black transition-all"
              >
                Read Stories
              </Link>
            </div>
          </motion.div>
          
          {/* Decorative Gradient */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
