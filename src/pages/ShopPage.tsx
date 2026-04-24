import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || 'all';
  const sortFilter = searchParams.get('sort') || 'popularity';
  const { addToCart, siteConfig } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data.length === 0) {
           setProducts([]);
        } else {
           setProducts(data);
        }
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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

  const filteredProducts = useMemo(() => {
    let list = [...products];
    
    // Filter by category
    if (categoryFilter !== 'all') {
      list = list.filter(p => p.category === categoryFilter);
    }

    // Sort
    if (sortFilter === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortFilter === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortFilter === 'newest') {
      list.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
    }

    return list;
  }, [categoryFilter, sortFilter, products]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-[var(--card)] border border-[var(--border)] p-6 sticky top-24">
            <h2 className="text-sm tracking-widest uppercase font-bold mb-6 flex items-center gap-2 pr-2 border-b border-[var(--border)] pb-4">
              <Filter className="h-4 w-4" /> Filters
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-serif italic text-lg mb-4 text-[var(--foreground)]">Categories</h3>
                <div className="space-y-3 text-[11px] uppercase tracking-widest text-[var(--foreground)]/60">
                  <label className="flex items-center gap-3 cursor-pointer hover:text-primary-400 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={categoryFilter === 'all'}
                        onChange={() => setSearchParams({ category: 'all', sort: sortFilter })}
                        className="peer sr-only"
                      />
                      <div className="w-4 h-4 border border-[var(--border)] peer-checked:border-primary-400 transition-colors"></div>
                      <div className="absolute w-2 h-2 bg-primary-400 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                    <span>All</span>
                  </label>
                  {siteConfig.categories?.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer hover:text-primary-400 transition-colors">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="category" 
                          checked={categoryFilter === cat.id}
                          onChange={() => setSearchParams({ category: cat.id, sort: sortFilter })}
                          className="peer sr-only"
                        />
                        <div className="w-4 h-4 border border-[var(--border)] peer-checked:border-primary-400 transition-colors"></div>
                        <div className="absolute w-2 h-2 bg-primary-400 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                      </div>
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-serif italic text-lg mb-4 text-[var(--foreground)]">Sort By</h3>
                <div className="space-y-3 text-[11px] uppercase tracking-widest text-[var(--foreground)]/60">
                  {[
                    { val: 'popularity', label: 'Popularity' },
                    { val: 'newest', label: 'Newest Arrivals' },
                    { val: 'price-low', label: 'Price: Low to High' },
                    { val: 'price-high', label: 'Price: High to Low' }
                  ].map((sort) => (
                    <label key={sort.val} className="flex items-center gap-3 cursor-pointer hover:text-primary-400 transition-colors">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="sort" 
                          checked={sortFilter === sort.val}
                          onChange={() => setSearchParams({ category: categoryFilter, sort: sort.val })}
                          className="peer sr-only"
                        />
                        <div className="w-4 h-4 border border-[var(--border)] peer-checked:border-primary-400 transition-colors"></div>
                        <div className="absolute w-2 h-2 bg-primary-400 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                      </div>
                      <span>{sort.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="mb-6 flex justify-between items-center border-b border-[var(--border)] pb-4">
            <h1 className="text-3xl font-serif italic text-[var(--foreground)]">Shop Collection</h1>
            <span className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40">{filteredProducts.length} Products</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[10px] uppercase tracking-widest text-[var(--foreground)]/60">
              Loading Collection...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group bg-[var(--card)] border border-[var(--border)] overflow-hidden transition-all hover:border-primary-400/50 cursor-pointer flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-[var(--background)]">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title}
                    className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  {product.isNew && (
                    <div className="absolute top-3 left-3 bg-primary-400 text-black text-[9px] uppercase tracking-widest font-bold px-2 py-1">
                      New
                    </div>
                  )}
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
                  <h3 className="font-serif text-lg mb-4 line-clamp-2 h-14 group-hover:text-primary-400 transition-colors text-[var(--foreground)]">
                    {product.title}
                  </h3>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-mono text-primary-400 font-bold">${product.price}</span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-transparent border border-primary-400 text-primary-400 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold hover:bg-primary-400 hover:text-black transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center text-[var(--foreground)]/40 text-sm uppercase tracking-widest">
                No products found matching your filters.
              </div>
            )}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
