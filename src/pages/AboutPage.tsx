import { Link } from "react-router-dom";
import { Scissors, Star, Users } from "lucide-react";
import { useStore } from '../store/useStore';

export function AboutPage() {
  const { siteConfig } = useStore();
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-[var(--background)] border-b border-[var(--border)] overflow-hidden">
        <div className="absolute inset-0 opacity-40">
           <img 
            src="https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=2000" 
            alt="Barber Shop Tools" 
            className="w-full h-full object-cover mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)] to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-serif italic mb-6">Our Story</h1>
            <p className="text-sm text-[var(--foreground)]/60 leading-relaxed max-w-md">
              {siteConfig.aboutSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-serif italic mb-6 text-[var(--foreground)]">{siteConfig.aboutTitle}</h2>
              <div className="w-10 h-0.5 bg-primary-400 mb-8" />
              <p className="text-[var(--foreground)]/60 mb-6 leading-relaxed text-sm">
                {siteConfig.aboutBody1}
              </p>
              <p className="text-[var(--foreground)]/60 mb-6 leading-relaxed text-sm">
                {siteConfig.aboutBody2}
              </p>
              <Link to="/shop" className="inline-block mt-8 text-primary-400 text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors">
                Explore The Collection &rarr;
              </Link>
            </div>
            <div className="relative border border-[var(--border)] overflow-hidden shadow-2xl h-[500px]">
              <img 
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1000" 
                alt="Barber working" 
                className="w-full h-full object-cover mix-blend-luminosity opacity-80"
              />
            </div>
          </div>
         </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[var(--card)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif italic mb-6">Our Core Values</h2>
            <div className="w-10 h-0.5 bg-primary-400 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-8 border border-[var(--border)] bg-[var(--background)]">
              <div className="w-16 h-16 mx-auto bg-transparent border border-primary-500/20 text-primary-400 flex items-center justify-center mb-6">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="font-serif italic text-xl mb-4">Precision</h3>
              <p className="text-[var(--foreground)]/60 text-xs leading-relaxed">We source only the finest tools designed for sharp, exact cuts. Precision is not an option; it's a requirement.</p>
            </div>
            <div className="text-center p-8 border border-[var(--border)] bg-[var(--background)]">
              <div className="w-16 h-16 mx-auto bg-transparent border border-primary-500/20 text-primary-400 flex items-center justify-center mb-6">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-serif italic text-xl mb-4">Quality First</h3>
              <p className="text-[var(--foreground)]/60 text-xs leading-relaxed">Whether it's our grooming products or brand apparel, we never compromise on the quality of materials.</p>
            </div>
            <div className="text-center p-8 border border-[var(--border)] bg-[var(--background)]">
              <div className="w-16 h-16 mx-auto bg-transparent border border-primary-500/20 text-primary-400 flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-serif italic text-xl mb-4">Community</h3>
              <p className="text-[var(--foreground)]/60 text-xs leading-relaxed">HairNia isn't just a store; it's a brotherhood. We celebrate the culture of barbers and stylists worldwide.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
