import { Toast } from './components/Toast';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CartPage } from './pages/CartPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { Blog } from './pages/Blog';
import { SingleBlogPost } from './pages/SingleBlogPost';
import { DynamicPage } from './pages/DynamicPage';
import { AiWidget } from './components/AiWidget';
import { ScrollToTop } from './components/ScrollToTop';
import { db, auth } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const { theme, siteConfig } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Update SEO Meta Tags
  useEffect(() => {
    if (siteConfig) {
      document.title = siteConfig.seoTitle || siteConfig.siteName;

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && siteConfig.seoDescription) {
        metaDescription.setAttribute('content', siteConfig.seoDescription);
      }

      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords && siteConfig.seoKeywords) {
        metaKeywords.setAttribute('content', siteConfig.seoKeywords);
      }

      if (siteConfig.themePrimaryColor) {
        document.documentElement.style.setProperty('--theme-primary', siteConfig.themePrimaryColor);
      } else {
        document.documentElement.style.removeProperty('--theme-primary');
      }
    }
  }, [siteConfig]);

  useEffect(() => {
    // 🔥 FIX: Use static auth import to prevent async race conditions dropping the user session
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      useStore.getState().setUser(user);
    });

    // Fetch site config
    const loadConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'siteConfig', 'global'));
        if (configDoc.exists()) {
          useStore.getState().setSiteConfig(configDoc.data() as any);
        }
      } catch (err) {
        console.error("Failed to load global config:", err);
      }
    };
    loadConfig();

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<SingleBlogPost />} />
            <Route path="/page/:slug" element={<DynamicPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
          </Routes>
        </main>
        <Footer />
        <AiWidget />
        <Toast />
      </div>
    </BrowserRouter>
  );
}
