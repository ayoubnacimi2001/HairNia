import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ShoppingCart, User, Moon, Sun, Menu, X, Scissors } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { theme, toggleTheme, cart, user, siteConfig } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    ...(siteConfig.categories?.map(cat => ({ name: cat.name, path: `/shop?category=${cat.id}` })) || []),
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              {siteConfig.logoUrl ? (
                <img src={siteConfig.logoUrl} alt={siteConfig.siteName} className="h-8 object-contain" />
              ) : (
                <span className="font-serif italic font-black text-2xl tracking-tighter text-primary-400">{siteConfig.siteName}</span>
              )}
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-[11px] font-semibold uppercase tracking-widest text-[var(--foreground)]/60 hover:text-primary-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mr-2">
              <span className="text-[9px] uppercase opacity-50 font-semibold tracking-wider text-[var(--foreground)]">Dark</span>
              <button
                onClick={toggleTheme}
                className="w-[30px] h-[14px] bg-primary-400 rounded-full relative"
                aria-label="Toggle Theme"
              >
                <div className={`w-[10px] h-[10px] bg-white rounded-full absolute top-[2px] transition-all ${theme === 'dark' ? 'right-[2px]' : 'left-[2px]'}`} />
              </button>
            </div>
            <Link to="/auth" className="p-2 hover:text-primary-400 transition-colors text-[var(--foreground)]/60">
              <User className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="p-2 hover:text-primary-400 transition-colors relative text-[var(--foreground)]/60">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-black bg-primary-400 rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <button
                onClick={toggleTheme}
                className="w-[30px] h-[14px] bg-primary-400 rounded-full relative"
                aria-label="Toggle Theme"
              >
                <div className={`w-[10px] h-[10px] bg-white rounded-full absolute top-[2px] transition-all ${theme === 'dark' ? 'right-[2px]' : 'left-[2px]'}`} />
              </button>
            </div>
            <Link to="/cart" className="relative p-2 text-[var(--foreground)]/60 hover:text-primary-400">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-black bg-primary-400 rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[var(--foreground)]/60 hover:text-primary-400 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--border)] hover:text-primary-500"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/auth"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--border)] hover:text-primary-500"
            >
              {user ? 'My Account' : 'Login / Sign Up'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
