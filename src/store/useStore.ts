import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // product id
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface SiteConfig {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutBody1: string;
  aboutBody2: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  logoUrl: string;
  heroImageUrl: string;
  categories: { id: string; name: string }[];
  themePrimaryColor?: string;
}

interface StoreState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  user: any | null; // basic firebase user object or null
  setUser: (user: any | null) => void;
  
  siteConfig: SiteConfig;
  setSiteConfig: (config: Partial<SiteConfig>) => void;
}

const defaultConfig: SiteConfig = {
  siteName: 'HairNia',
  heroTitle: 'Precision For The Modern Artisan',
  heroSubtitle: 'Experience a curated collection of barber-grade tools, elite grooming products, and exclusive salon apparel designed for master barbers.',
  contactEmail: 'HairNia@gmail.com',
  aboutTitle: 'Built for Professionals',
  aboutSubtitle: 'HairNia was born out of a passion for the craft. We believe every barber, stylist, and grooming enthusiast deserves tools that are as dedicated as they are.',
  aboutBody1: 'Founded in 2026, HairNia started with a simple mission: to bridge the gap between premium quality and accessible pricing in the barbering industry. We saw professionals struggling with tools that either broke the bank or broke down mid-cut.',
  aboutBody2: 'Today, we offer a carefully curated selection of clippers, trimmers, styling products, and exclusive brand merchandise. Every product that bears the HairNia name has been rigorously tested by master barbers.',
  seoTitle: 'HairNia - Premium Barber Tools & Grooming',
  seoDescription: 'Premium destination for professional barber tools and salon equipment.',
  seoKeywords: 'barber tools, salon equipment, beauty products, brand merchandise, clippers, trimmers, grooming, HairNia',
  logoUrl: '',
  heroImageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000',
  categories: [
    { id: 'barber-tools', name: 'Barber Tools' },
    { id: 'beauty', name: 'Beauty Products' }
  ],
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      cart: [],
      addToCart: (item) => set((state) => {
        const existing = state.cart.find((i) => i.id === item.id);
        if (existing) {
          return {
            cart: state.cart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          };
        }
        return { cart: [...state.cart, item] };
      }),
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((i) => i.id !== id),
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        cart: state.cart.map((i) => (i.id === id ? { ...i, quantity } : i)),
      })),
      clearCart: () => set({ cart: [] }),
      
      user: null,
      setUser: (user) => set({ user }),

      siteConfig: defaultConfig,
      setSiteConfig: (config) => set((state) => ({ siteConfig: { ...state.siteConfig, ...config } })),
    }),
    {
      name: 'hairnia-storage',
      // only persist cart, theme, and siteConfig to save reads
      partialize: (state) => ({ theme: state.theme, cart: state.cart, siteConfig: state.siteConfig }),
    }
  )
);
