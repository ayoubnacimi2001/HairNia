import { Link } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { collection, query, getDocs, limit, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';

export function HomePage() {
  const { siteConfig, addToCart } = useStore();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  
  // Newsletter State
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Try getting best sellers first
        let q = query(collection(db, 'products'), where('isBestSeller', '==', true), limit(4));
        let snap = await getDocs(q);
        
        // If not enough best sellers, just get any products
        if (snap.empty) {
          q = query(collection(db, 'products'), limit(4));
          snap = await getDocs(q);
        }
        
        setFeaturedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFeatured();
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1
    });
    alert('Added to cart!');
  };

  // The Firebase Subscription Engine
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    setSubscribeError('');

    try {
      await addDoc(collection(db, 'subscribers'), {
        email: email,
        subscribedAt: serverTimestamp(),
      });
      setSubscribeSuccess(true);
      setEmail('');
    } catch (err) {
      console.error(err);
      setSubscribeError('Connection error. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center px-4 sm:px-10 md:px-20 overflow-hidden bg-[radial-gradient(circle_at_80%_50%,#1A1A1A_0%,#0D0D0D_100%)]">
        
        <div className="relative z-10 max-w-lg">
          <span className="text-primary-400 tracking-[4px] uppercase text-[11px] font-bold mb-4 block">
            Est. 2026
          </span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-serif italic mb-6 leading-[0.9] text-white"
          >
            {siteConfig.heroTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm text-white/60 mb-8 leading-relaxed max-w-sm"
          >
            {siteConfig.heroSubtitle}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              to="/shop" 
              className="bg-primary-400 text-black px-7 py-3.5 text-[11px] font-bold uppercase tracking-[1px] text-center hover:opacity-90 transition"
            >
              Explore Shop
            </Link>
            <Link 
              to="/shop?sort=newest" 
              className="bg-transparent border border-white/20 text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[1px] text-center hover:bg-white/5 transition"
            >
              New Arrivals
            </Link>
          </motion.div>
        </div>

        <div className="hidden lg:flex absolute right-20 w-[380px] h-[450px] bg-white/2 border border-white/5 items-center justify-center shadow-2xl">
          <div className="w-[80%] h-[80%] border border-dashed border-primary-400/30"></div>
          <div className="absolute -bottom-5 -left-5 bg-primary-400 text-black p-5 font-black text-4xl font-serif">
            01
          </div>
          <img 
            src={siteConfig.heroImageUrl || "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&q=80&w=600"} 
            alt="Feature display"
            className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40 hover:opacity-100 transition-opacity duration-700" 
          />
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="min-h-[240px] bg-[var(--card)] border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px]">
        {siteConfig.categories?.slice(0, 4).map((cat, i) => (
          <Link key={i} to={`/shop?category=${cat.id}`} className="p-8 flex flex-col justify-end bg-[var(--background)] hover:bg-[var(--card)] transition-colors group relative cursor-pointer min-h-[240px]">
            <span className="text-[10px] uppercase text-[var(--foreground)]/40 mb-1 tracking-widest">Category</span>
            <h3 className="font-serif text-xl mb-2 text-[var(--foreground)]">{cat.name}</h3>
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-5 w-5 text-primary-400" />
            </div>
          </Link>
        ))}
      </section>

      {/* Featured Products */}
      <section className="py-20 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif italic mb-2">Our Collection</h2>
              <div className="w-10 h-0.5 bg-primary-400" />
            </div>
            <Link to="/shop" className="hidden sm:flex text-[10px] uppercase tracking-widest text-[var(--foreground)]/60 hover:text-primary-400 items-center gap-2 transition-colors">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group bg-[var(--card)] border border-[var(--border)] overflow-hidden transition-all hover:border-primary-400/50 cursor-pointer flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-[var(--background)]">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title}
                    className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[var(--background)] border border-[var(--border)] px-2 py-1 text-[9px] uppercase tracking-widest font-bold">
                    Best Seller
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-end">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40">
                      {siteConfig.categories?.find(c => c.id === product.category)?.name || product.category}
                    </p>
                    <div className="flex items-center text-primary-400 text-xs gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-[var(--foreground)]">{product.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-serif text-lg mb-4 line-clamp-1 group-hover:text-primary-400 transition-colors">
                    {product.title}
                  </h3>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-mono text-primary-400 font-bold">${product.price}</span>
                    <button onClick={() => handleAddToCart(product)} className="bg-transparent border border-primary-400 text-primary-400 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold hover:bg-primary-400 hover:text-black transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Link to="/shop" className="inline-flex text-[10px] uppercase tracking-widest text-primary-400 items-center gap-2">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Newsletter Promo (Upgraded with Firebase) */}
      <section className="py-24 bg-[var(--card)] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-serif italic mb-6">Join the HairNia Community</h2>
          <p className="text-[var(--foreground)]/60 text-sm mb-10 max-w-2xl mx-auto leading-relaxed">
            Get exclusive access to new drops, professional styling tips, and members-only discounts.
          </p>
          
          {subscribeSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-8 border border-primary-400/30 max-w-md mx-auto bg-[var(--background)] shadow-2xl"
            >
              <CheckCircle className="w-12 h-12 text-primary-400 mb-4" strokeWidth={1.5} />
              <h3 className="text-2xl font-serif italic text-white mb-2">Thank you!</h3>
              <p className="text-[var(--foreground)]/60 text-[11px] uppercase tracking-widest">
                Your gift is on the way.
              </p>
            </motion.div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-0 justify-center max-w-md mx-auto relative" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="ENTER YOUR EMAIL" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                required
                className="flex-grow px-4 py-3 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-[10px] tracking-widest uppercase focus:outline-none focus:border-primary-400 transition-colors placeholder:text-[var(--foreground)]/30 disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-3 bg-primary-400 text-black text-[10px] uppercase font-bold tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubscribing ? 'SENDING...' : 'SUBSCRIBE'}
              </button>
            </form>
          )}
          {subscribeError && (
            <p className="text-red-500 text-[10px] mt-4 uppercase tracking-widest">{subscribeError}</p>
          )}
        </div>
      </section>
    </div>
  );
}
