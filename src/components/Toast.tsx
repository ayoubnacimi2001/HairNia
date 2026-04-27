import { useStore } from '../store/useStore';
import { CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Toast() {
  const { toastMessage, hideToast, siteConfig } = useStore();
  const [bump, setBump] = useState(false);

  // Grab the site name from config, fallback to 'Zakaar' if not set
  const brandName = siteConfig?.siteName || 'Zakaar';

  useEffect(() => {
    if (toastMessage) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 200);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!toastMessage) return null;

  return (
    <div 
      className={`fixed bottom-8 right-8 z-[100] transition-all duration-300 transform ${
        bump ? 'scale-105' : 'scale-100'
      }`}
    >
      <div className="bg-[var(--card)] border border-primary-400 shadow-[0_0_20px_rgba(212,175,55,0.2)] p-4 flex items-center gap-4 min-w-[300px]">
        <div className={`transition-transform duration-200 ${bump ? 'rotate-12' : 'rotate-0'}`}>
          <CheckCircle className="text-primary-400 w-5 h-5" />
        </div>
        <div className="flex-1">
          {/* 🔥 Anti-translation shield on the toast brand name */}
          <p translate="no" className="notranslate text-[10px] uppercase tracking-[0.2em] font-bold text-primary-400 mb-0.5">
            {brandName}
          </p>
          <p className="text-[11px] text-[var(--foreground)]/90 font-medium">
            {toastMessage}
          </p>
        </div>
        <button 
          onClick={hideToast} 
          className="p-1 hover:bg-[var(--foreground)]/10 transition-colors group"
        >
          <X className="w-4 h-4 text-[var(--foreground)]/40 group-hover:text-[var(--foreground)]" />
        </button>
      </div>
    </div>
  );
}