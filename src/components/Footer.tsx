import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Footer() {
  const { siteConfig } = useStore();
  
  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 mb-6">
              {siteConfig.logoUrl ? (
                <img src={siteConfig.logoUrl} alt={siteConfig.siteName} className="h-8 object-contain" />
              ) : (
                // 🔥 THE SHIELD: Prevents the site name from being translated
                <span translate="no" className="notranslate font-serif italic font-black text-2xl tracking-tighter text-primary-400">
                    {siteConfig.siteName || 'Zakaar'}
                </span>
              )}
            </Link>
            <p className="text-[11px] text-[var(--foreground)]/60 uppercase tracking-wider leading-relaxed">
              Premium destination for professional barber tools and salon equipment.
            </p>
            <div className="flex space-x-4">
              {/* 🔥 Dynamic Social Links */}
              {siteConfig.socialFacebook && (
                <a href={siteConfig.socialFacebook} target="_blank" rel="noreferrer" className="text-[var(--foreground)]/40 hover:text-primary-400 transition-colors"><Facebook className="h-4 w-4" /></a>
              )}
              {siteConfig.socialInstagram && (
                <a href={siteConfig.socialInstagram} target="_blank" rel="noreferrer" className="text-[var(--foreground)]/40 hover:text-primary-400 transition-colors"><Instagram className="h-4 w-4" /></a>
              )}
              {siteConfig.socialTwitter && (
                <a href={siteConfig.socialTwitter} target="_blank" rel="noreferrer" className="text-[var(--foreground)]/40 hover:text-primary-400 transition-colors"><Twitter className="h-4 w-4" /></a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-serif italic text-lg mb-6 text-primary-400">Shop</h3>
            <ul className="space-y-4 text-[11px] uppercase tracking-widest text-[var(--foreground)]/60">
              {siteConfig.categories?.slice(0, 3).map(cat => (
                <li key={cat.id}><Link to={`/shop?category=${cat.id}`} className="hover:text-primary-400 transition-colors">{cat.name}</Link></li>
              ))}
              <li><Link to="/shop" className="hover:text-primary-400 transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif italic text-lg mb-6 text-primary-400">Discover</h3>
            <ul className="space-y-4 text-[11px] uppercase tracking-widest text-[var(--foreground)]/60">
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-primary-400 transition-colors">Hairstyle Inspiration</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif italic text-lg mb-6 text-primary-400">Contact Us</h3>
            <ul className="space-y-4 text-[11px] uppercase tracking-widest text-[var(--foreground)]/60">
              <li>Email: {siteConfig.contactEmail || 'contact@example.com'}</li>
              {/* 🔥 THE SHIELD: Protects the phone number formatting */}
              <li>Phone: <span translate="no" className="notranslate">{siteConfig.contactPhone || '+1 234 567 890'}</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest uppercase text-[var(--foreground)]/40">
          {/* 🔥 THE SHIELD: Protects the copyright brand name */}
          <p>&copy; {new Date().getFullYear()} <span translate="no" className="notranslate">{siteConfig.siteName || 'Zakaar'}</span> LTD.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-primary-400">Privacy</Link>
            <Link to="/terms" className="hover:text-primary-400">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}