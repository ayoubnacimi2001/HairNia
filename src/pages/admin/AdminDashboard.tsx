import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { user, siteConfig, setSiteConfig } = useStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configForm, setConfigForm] = useState(siteConfig);
  const [saving, setSaving] = useState(false);
  const defaultThemeColor = '#d4af37';
  const [previewColor, setPreviewColor] = useState(siteConfig.themePrimaryColor || defaultThemeColor);

  useEffect(() => {
    if (previewColor) {
      document.documentElement.style.setProperty('--theme-primary', previewColor);
    }
  }, [previewColor]);

  useEffect(() => {
    return () => {
      // Revert on unmount if not saved
      if (useStore.getState().siteConfig.themePrimaryColor) {
        document.documentElement.style.setProperty('--theme-primary', useStore.getState().siteConfig.themePrimaryColor!);
      } else {
        document.documentElement.style.removeProperty('--theme-primary');
      }
    };
  }, []);

  const handleApplyColor = async () => {
    setSaving(true);
    try {
      const updatedConfig = { ...configForm, themePrimaryColor: previewColor };
      setConfigForm(updatedConfig);
      await setDoc(doc(db, 'siteConfig', 'global'), {
        ...updatedConfig,
        updatedAt: serverTimestamp()
      });
      setSiteConfig(updatedConfig);
      alert('Theme color applied successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save color.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelColor = () => {
    const revertColor = siteConfig.themePrimaryColor || defaultThemeColor;
    setPreviewColor(revertColor);
    setConfigForm(prev => ({...prev, themePrimaryColor: revertColor}));
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        if (user.email === 'admin@hairnia.com' || user.email === 'ayoubnacimi2001@gmail.com') {
          setIsAdmin(true);
        } else {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [user]);

  const handleImageUpload = (field: 'logoUrl' | 'heroImageUrl') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = field === 'logoUrl' ? 300 : 1200;
        const MAX_HEIGHT = field === 'logoUrl' ? 300 : 800;
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
        
        // Use PNG for logos to preserve transparency, JPEG for hero images
        const format = field === 'logoUrl' ? 'image/png' : 'image/jpeg';
        const quality = field === 'logoUrl' ? 1 : 0.7;
        const dataUrl = canvas.toDataURL(format, quality);
        
        setConfigForm(prev => ({ ...prev, [field]: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'siteConfig', 'global'), {
        ...configForm,
        updatedAt: serverTimestamp()
      });
      setSiteConfig(configForm);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center uppercase tracking-widest text-[10px]">Loading Admin...</div>;

  if (!isAdmin) {
    return (
      <div className="p-20 text-center uppercase tracking-widest text-[10px] text-red-500">
        Access Denied. You are not an admin.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-serif italic mb-8">Admin Dashboard</h1>
      
      <div className="bg-[var(--card)] border border-[var(--border)] p-8">
        <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mb-6 border-b border-[var(--border)] pb-4">Global Site Settings</h2>
        
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mt-8 mb-6 border-b border-[var(--border)] pb-4">Theme Customization</h2>
          
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Primary Accent Color</label>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <input 
                  type="text"
                  value={previewColor}
                  onChange={(e) => setPreviewColor(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] font-mono uppercase"
                  placeholder="#d4af37"
                />
              </div>
              <div className="w-12 h-[42px] border border-[var(--border)] rounded-sm overflow-hidden flex-shrink-0">
                <input 
                  type="color"
                  value={previewColor}
                  onChange={(e) => setPreviewColor(e.target.value)}
                  className="w-full h-full p-0 border-0 cursor-pointer object-cover scale-[2.0]"
                />
              </div>
              <button 
                type="button"
                onClick={handleApplyColor}
                disabled={saving}
                className="px-6 py-3 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-50 h-[42px] flex items-center justify-center whitespace-nowrap"
              >
                Apply
              </button>
              <button 
                type="button"
                onClick={handleCancelColor}
                disabled={saving}
                className="px-6 py-3 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)] font-bold uppercase tracking-widest text-[10px] disabled:opacity-50 h-[42px] flex items-center justify-center whitespace-nowrap transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="text-[10px] text-[var(--foreground)]/50 mt-2">Changes apply immediately in preview. Click Apply to save permanently.</p>
          </div>

          <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mt-8 mb-6 border-b border-[var(--border)] pb-4">General Info</h2>

          <div>
             <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Site Name</label>
            <input 
              type="text"
              value={configForm.siteName || ''}
              onChange={(e) => setConfigForm({...configForm, siteName: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Logo Image</label>
            <div className="relative flex flex-col md:flex-row md:items-center gap-4 bg-[var(--background)] border border-[var(--border)] p-4 rounded-sm pt-8 md:pt-4">
              <div className="absolute top-2 right-2 bg-[var(--foreground)] text-[var(--background)] text-[9px] px-2 py-0.5 rounded font-mono opacity-80 hover:opacity-100 cursor-help transition-opacity z-10" title="Recommended size for best display">
                300 × 300 px
              </div>
              {configForm.logoUrl && (
                <img src={configForm.logoUrl} alt="Logo Preview" className="h-12 w-auto object-contain bg-black px-2 border border-[var(--border)]" />
              )}
              <input 
                type="hidden" 
                value={configForm.logoUrl || ''} 
              />
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload('logoUrl')} 
                className="w-full text-[11px] file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-primary-400 file:text-black hover:file:opacity-90"
              />
            </div>
            <p className="text-[10px] text-[var(--foreground)]/50 mt-1">Leave blank to use site name as text logo.</p>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Hero Main Image</label>
            <div className="relative flex flex-col md:flex-row md:items-center gap-4 bg-[var(--background)] border border-[var(--border)] p-4 rounded-sm pt-8 md:pt-4">
              <div className="absolute top-2 right-2 bg-[var(--foreground)] text-[var(--background)] text-[9px] px-2 py-0.5 rounded font-mono opacity-80 hover:opacity-100 cursor-help transition-opacity z-10" title="Recommended size for best display">
                1200 × 800 px
              </div>
              {configForm.heroImageUrl && (
                <img src={configForm.heroImageUrl} alt="Hero Preview" className="w-20 h-10 object-cover bg-black border border-[var(--border)]" />
              )}
              <input 
                type="hidden" 
                required 
                value={configForm.heroImageUrl || ''} 
              />
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload('heroImageUrl')} 
                className="w-full text-[11px] file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-primary-400 file:text-black hover:file:opacity-90"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Hero Title</label>
            <input 
              type="text"
              value={configForm.heroTitle || ''}
              onChange={(e) => setConfigForm({...configForm, heroTitle: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Hero Subtitle</label>
            <textarea 
              value={configForm.heroSubtitle || ''}
              onChange={(e) => setConfigForm({...configForm, heroSubtitle: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Contact Email</label>
            <input 
              type="email"
              value={configForm.contactEmail || ''}
              onChange={(e) => setConfigForm({...configForm, contactEmail: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
              required
            />
          </div>
          
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Section Title</label>
            <input 
              type="text"
              value={configForm.aboutTitle || ''}
              onChange={(e) => setConfigForm({...configForm, aboutTitle: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Section Subtitle</label>
            <textarea 
              value={configForm.aboutSubtitle || ''}
              onChange={(e) => setConfigForm({...configForm, aboutSubtitle: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Body Paragraph 1</label>
            <textarea 
              value={configForm.aboutBody1 || ''}
              onChange={(e) => setConfigForm({...configForm, aboutBody1: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Body Paragraph 2</label>
            <textarea 
              value={configForm.aboutBody2 || ''}
              onChange={(e) => setConfigForm({...configForm, aboutBody2: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
              required
            />
          </div>

          <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mt-8 mb-6 border-b border-[var(--border)] pb-4">Product Categories</h2>
          
          <div className="space-y-4">
            {configForm.categories?.map((cat, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-1">Category ID (no spaces)</label>
                  <input 
                    type="text"
                    value={cat.id || ''}
                    onChange={(e) => {
                      const newCats = [...(configForm.categories || [])];
                      newCats[index].id = e.target.value.toLowerCase().replace(/\s+/g, '-');
                      setConfigForm({...configForm, categories: newCats});
                    }}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-1">Display Name</label>
                  <input 
                    type="text"
                    value={cat.name || ''}
                    onChange={(e) => {
                      const newCats = [...(configForm.categories || [])];
                      newCats[index].name = e.target.value;
                      setConfigForm({...configForm, categories: newCats});
                    }}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    type="button"
                    onClick={() => {
                      const newCats = configForm.categories?.filter((_, i) => i !== index);
                      setConfigForm({...configForm, categories: newCats});
                    }}
                    className="px-4 py-3 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setConfigForm({
                  ...configForm,
                  categories: [...(configForm.categories || []), { id: `category-${Date.now()}`, name: 'New Category' }]
                });
              }}
              className="px-4 py-3 bg-[var(--background)] border border-[var(--border)] text-primary-400 hover:border-primary-400 transition-colors text-[10px] font-bold uppercase tracking-widest"
            >
              + Add Category
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-3 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-50 ml-4"
            >
              {saving ? 'Saving...' : 'Save Categories'}
            </button>
          </div>

          <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mt-8 mb-6 border-b border-[var(--border)] pb-4">SEO Settings</h2>
          
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Global SEO Title</label>
            <input 
              type="text"
              value={configForm.seoTitle || ''}
              onChange={(e) => setConfigForm({...configForm, seoTitle: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Global SEO Description</label>
            <textarea 
              value={configForm.seoDescription || ''}
              onChange={(e) => setConfigForm({...configForm, seoDescription: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Global SEO Keywords (comma separated)</label>
            <textarea 
              value={configForm.seoKeywords || ''}
              onChange={(e) => setConfigForm({...configForm, seoKeywords: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      <div className="mt-8 bg-[var(--card)] border border-[var(--border)] p-8">
        <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mb-6 border-b border-[var(--border)] pb-4">Product Management</h2>
        <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/60 mb-6">Manage all your products, inventory, and pricing here.</p>
        
        <Link to="/admin/products" className="inline-block px-6 py-3 bg-[var(--background)] border border-[var(--border)] text-primary-400 font-bold uppercase tracking-widest text-[10px] hover:border-primary-400">
          Manage Products
        </Link>
      </div>
    </div>
  );
}
