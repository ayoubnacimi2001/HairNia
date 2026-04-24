import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  isBestSeller: boolean;
}

export function AdminProducts() {
  const { user } = useStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    title: '', description: '', price: 0, category: '', imageUrl: '', stock: 10, isBestSeller: false
  });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const init = async () => {
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          setIsAdmin(true);
          fetchProducts();
        }
      } catch (err) {
        console.error("Error check", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCurrentProduct(prev => ({ ...prev, imageUrl: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docId = currentProduct.id || doc(collection(db, 'products')).id;
      await setDoc(doc(db, 'products', docId), {
        title: currentProduct.title,
        description: currentProduct.description,
        price: Number(currentProduct.price),
        category: currentProduct.category,
        imageUrl: currentProduct.imageUrl,
        stock: Number(currentProduct.stock),
        isBestSeller: Boolean(currentProduct.isBestSeller),
        updatedAt: serverTimestamp(),
        ...(!currentProduct.id && { createdAt: serverTimestamp() })
      }, { merge: true });
      
      alert('Product saved!');
      setIsEditing(false);
      const defaultCat = useStore.getState().siteConfig.categories?.[0]?.id || '';
      setCurrentProduct({
        title: '', description: '', price: 0, category: defaultCat, imageUrl: '', stock: 10, isBestSeller: false
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="p-20 text-center text-[10px] uppercase">Loading...</div>;
  if (!isAdmin) return <div className="p-20 text-center text-[10px] uppercase text-red-500">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif italic">Product Management</h1>
        <button 
          onClick={() => { 
            const defaultCat = useStore.getState().siteConfig.categories?.[0]?.id || '';
            setIsEditing(true); 
            setCurrentProduct({title: '', description: '', price: 0, category: defaultCat, imageUrl: '', stock: 10, isBestSeller: false}); 
          }}
          className="flex items-center gap-2 bg-primary-400 text-black px-4 py-2 text-[10px] uppercase tracking-widest font-bold"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-[var(--card)] border border-[var(--border)] p-8 mb-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Title</label>
               <input required value={currentProduct.title} onChange={e => setCurrentProduct({...currentProduct, title: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] p-3 text-[11px]" />
             </div>
             <div>
               <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Price</label>
               <input required type="number" step="0.01" value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} className="w-full bg-[var(--background)] border border-[var(--border)] p-3 text-[11px]" />
             </div>
             <div>
               <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Category</label>
               <select required value={currentProduct.category || ''} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] p-3 text-[11px]">
                 <option value="" disabled>Select category</option>
                 {useStore.getState().siteConfig.categories?.map(cat => (
                   <option key={cat.id} value={cat.id}>{cat.name}</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Stock</label>
               <input required type="number" value={currentProduct.stock} onChange={e => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})} className="w-full bg-[var(--background)] border border-[var(--border)] p-3 text-[11px]" />
             </div>
             <div className="md:col-span-2">
               <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Product Image</label>
               <div className="relative flex flex-col md:flex-row md:items-center gap-4 bg-[var(--background)] border border-[var(--border)] p-4 rounded-sm pt-8 md:pt-4">
                 <div className="absolute top-2 right-2 bg-[var(--foreground)] text-[var(--background)] text-[9px] px-2 py-0.5 rounded font-mono opacity-80 hover:opacity-100 cursor-help transition-opacity z-10" title="Recommended size for best display">
                   800 × 800 px
                 </div>
                 {currentProduct.imageUrl && (
                   <img src={currentProduct.imageUrl} alt="Preview" className="w-20 h-20 object-cover bg-black border border-[var(--border)]" />
                 )}
                 <input 
                   type="hidden" 
                   required 
                   value={currentProduct.imageUrl} 
                 />
                 <input 
                   type="file" 
                   accept="image/*"
                   onChange={handleImageUpload} 
                   className="w-full text-[11px] file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-primary-400 file:text-black hover:file:opacity-90"
                 />
               </div>
               <p className="text-[10px] text-[var(--foreground)]/50 mt-1">Images are automatically compressed.</p>
             </div>
             <div className="md:col-span-2">
               <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Description</label>
               <textarea required value={currentProduct.description} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] p-3 text-[11px] h-24 resize-none" />
             </div>
             <div className="md:col-span-2 flex items-center gap-2">
               <input type="checkbox" checked={currentProduct.isBestSeller} onChange={e => setCurrentProduct({...currentProduct, isBestSeller: e.target.checked})} className="accent-primary-400" />
               <label className="text-[10px] uppercase tracking-widest font-bold">Is Best Seller?</label>
             </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="bg-primary-400 text-black px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:opacity-90">Save Product</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-[var(--background)] border border-[var(--border)] px-6 py-3 text-[10px] uppercase tracking-widest">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-[var(--card)] border border-[var(--border)] p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={p.imageUrl} alt={p.title} className="w-16 h-16 object-cover bg-black opacity-80" />
                <div>
                  <h3 className="font-serif italic">{p.title}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-mono text-primary-400">${p.price} | {useStore.getState().siteConfig.categories?.find(c => c.id === p.category)?.name || p.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => {setCurrentProduct(p); setIsEditing(true);}} className="p-2 hover:text-primary-400"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {products.length === 0 && <div className="text-center p-8 text-[10px] uppercase tracking-widest">No products found.</div>}
        </div>
      )}
    </div>
  );
}
