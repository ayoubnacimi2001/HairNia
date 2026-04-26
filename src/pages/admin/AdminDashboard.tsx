import React, { useEffect, useState } from 'react'
import { useStore } from '../../store/useStore';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, getDocs, orderBy, limit, deleteDoc, addDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
// Added new icons for the sleek menu!
import { Trash2, Settings, ShoppingBag, FileText, Inbox, ArrowLeft } from 'lucide-react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    createdAt?: any;
}

interface BlogPost {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    createdAt?: any;
}

interface Subscriber {
    id: string;
    email: string;
    subscribedAt?: any; 
    createdAt?: any;    
}

export function AdminDashboard() {
    const { user, siteConfig, setSiteConfig } = useStore();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [configForm, setConfigForm] = useState(siteConfig);
    const [saving, setSaving] = useState(false);
    const defaultThemeColor = '#d4af37';
    const [previewColor, setPreviewColor] = useState(siteConfig.themePrimaryColor || defaultThemeColor);

    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [newBlog, setNewBlog] = useState({ title: '', content: '', imageUrl: '' });
    const [creatingBlog, setCreatingBlog] = useState(false);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    
    // 🔥 NEW: THE MASTER NAVIGATION STATE 🔥
    const [activeTab, setActiveTab] = useState<'menu' | 'settings' | 'products' | 'blogs' | 'inbox'>('menu');
    const [activeMessageTab, setActiveMessageTab] = useState<'contact' | 'subscribers'>('contact');

    const fetchContactMessages = async () => {
        try {
            const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'), limit(50));
            const snap = await getDocs(q);
            setContactMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage)));
        } catch (err) {
            console.error("Failed to fetch contact messages:", err);
        }
    };

    const fetchBlogPosts = async () => {
        try {
            const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(50));
            const snap = await getDocs(q);
            setBlogPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost)));
        } catch (err) {
            console.error("Failed to fetch blog posts:", err);
        }
    };

    const fetchSubscribers = async () => {
        try {
            const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'), limit(50));
            const snap = await getDocs(q);
            setSubscribers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscriber)));
        } catch (err) {
            console.error("Failed to fetch subscribers:", err);
        }
    };

    const handleDeleteContactMessage = async (id: string) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;
        try {
            await deleteDoc(doc(db, 'contactMessages', id));
            fetchContactMessages(); 
        } catch (err) {
            console.error(err);
            alert('Failed to delete message.');
        }
    };

    const handleCreateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBlog.title || !newBlog.content) return;
        setCreatingBlog(true);
        try {
            await addDoc(collection(db, 'blogs'), {
                ...newBlog,
                createdAt: serverTimestamp()
            });
            setNewBlog({ title: '', content: '', imageUrl: '' });
            fetchBlogPosts();
            alert('Blog post created successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to create blog post.');
        } finally {
            setCreatingBlog(false);
        }
    };

    const handleDeleteBlog = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;
        try {
            await deleteDoc(doc(db, 'blogs', id));
            fetchBlogPosts();
        } catch (err) {
            console.error(err);
            alert('Failed to delete blog post.');
        }
    };

    const handleDeleteSubscriber = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
        try {
            await deleteDoc(doc(db, 'subscribers', id));
            fetchSubscribers();
        } catch (err) {
            console.error(err);
            alert('Failed to delete subscriber.');
        }
    };

    useEffect(() => {
        if (previewColor) {
            document.documentElement.style.setProperty('--theme-primary', previewColor);
        }
    }, [previewColor]);

    useEffect(() => {
        const originalColor = useStore.getState().siteConfig.themePrimaryColor;
        return () => {
            if (originalColor) {
                document.documentElement.style.setProperty('--theme-primary', originalColor);
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
        setConfigForm(prev => ({ ...prev, themePrimaryColor: revertColor }));
    };

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setIsAdmin(false);
            return;
        }

        const checkAdmin = async () => {
            try {
                if (user.email === 'ayoubnacimi2001@gmail.com' && user.emailVerified) {
                    setIsAdmin(true);
                    fetchBlogPosts();
                    fetchContactMessages();
                    fetchSubscribers();
                } else {
                    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                    if (adminDoc.exists()) {
                        setIsAdmin(true);
                        fetchBlogPosts();
                        fetchContactMessages();
                        fetchSubscribers();
                    } else {
                        setIsAdmin(false);
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

    // Helper component for the Back Button
    const BackButton = () => (
        <button 
            onClick={() => setActiveTab('menu')} 
            className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/60 hover:text-primary-400 transition-colors"
        >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard Menu
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-3xl font-serif italic mb-8">Admin Dashboard</h1>

            {/* =========================================
                MAIN MENU VIEW
            ========================================= */}
            {activeTab === 'menu' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className="p-8 bg-[var(--card)] border border-[var(--border)] hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-4 text-center group"
                    >
                        <Settings className="w-10 h-10 text-[var(--foreground)]/40 group-hover:text-primary-400 transition-colors" />
                        <div>
                            <h2 className="font-bold uppercase tracking-widest text-[13px] mb-2 text-[var(--foreground)]"> General Settings</h2>
                            <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-widest">Theme, Logo, Hero, SEO & About</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setActiveTab('products')}
                        className="p-8 bg-[var(--card)] border border-[var(--border)] hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-4 text-center group"
                    >
                        <ShoppingBag className="w-10 h-10 text-[var(--foreground)]/40 group-hover:text-primary-400 transition-colors" />
                        <div>
                            <h2 className="font-bold uppercase tracking-widest text-[13px] mb-2 text-[var(--foreground)]"> Categories & Products</h2>
                            <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-widest">Manage inventory and categories</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setActiveTab('blogs')}
                        className="p-8 bg-[var(--card)] border border-[var(--border)] hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-4 text-center group"
                    >
                        <FileText className="w-10 h-10 text-[var(--foreground)]/40 group-hover:text-primary-400 transition-colors" />
                        <div>
                            <h2 className="font-bold uppercase tracking-widest text-[13px] mb-2 text-[var(--foreground)]"> Gestion of Blog</h2>
                            <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-widest">Create and manage articles</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setActiveTab('inbox')}
                        className="p-8 bg-[var(--card)] border border-[var(--border)] hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-4 text-center group"
                    >
                        <Inbox className="w-10 h-10 text-[var(--foreground)]/40 group-hover:text-primary-400 transition-colors" />
                        <div>
                            <h2 className="font-bold uppercase tracking-widest text-[13px] mb-2 text-[var(--foreground)]"> Centre de Réception</h2>
                            <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-widest">Contact messages & Subscribers</p>
                        </div>
                    </button>
                </div>
            )}


            {/* =========================================
                1. GENERAL SETTINGS VIEW
            ========================================= */}
            {activeTab === 'settings' && (
                <div className="animate-in fade-in duration-300">
                    <BackButton />
                    <div className="bg-[var(--card)] border border-[var(--border)] p-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mb-6 border-b border-[var(--border)] pb-4">General Site Settings</h2>
                        
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
                            </div>

                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mt-8 mb-6 border-b border-[var(--border)] pb-4">General Info & Images</h2>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Site Name</label>
                                <input
                                    type="text"
                                    value={configForm.siteName || ''}
                                    onChange={(e) => setConfigForm({ ...configForm, siteName: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Logo Image</label>
                                <div className="relative flex flex-col md:flex-row md:items-center gap-4 bg-[var(--background)] border border-[var(--border)] p-4 rounded-sm pt-8 md:pt-4">
                                    {configForm.logoUrl && <img src={configForm.logoUrl} alt="Logo" className="h-12 w-auto object-contain bg-black px-2 border border-[var(--border)]" />}
                                    <input type="file" accept="image/*" onChange={handleImageUpload('logoUrl')} className="w-full text-[11px] file:bg-primary-400 file:text-black hover:file:opacity-90" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Hero Main Image</label>
                                <div className="relative flex flex-col md:flex-row md:items-center gap-4 bg-[var(--background)] border border-[var(--border)] p-4 rounded-sm pt-8 md:pt-4">
                                    {configForm.heroImageUrl && <img src={configForm.heroImageUrl} alt="Hero" className="w-20 h-10 object-cover bg-black border border-[var(--border)]" />}
                                    <input type="file" accept="image/*" onChange={handleImageUpload('heroImageUrl')} className="w-full text-[11px] file:bg-primary-400 file:text-black hover:file:opacity-90" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Hero Title</label>
                                <input
                                    type="text"
                                    value={configForm.heroTitle || ''}
                                    onChange={(e) => setConfigForm({ ...configForm, heroTitle: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Hero Subtitle</label>
                                <textarea
                                    value={configForm.heroSubtitle || ''}
                                    onChange={(e) => setConfigForm({ ...configForm, heroSubtitle: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Contact Email</label>
                                <input
                                    type="email"
                                    value={configForm.contactEmail || ''}
                                    onChange={(e) => setConfigForm({ ...configForm, contactEmail: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
                                    required
                                />
                            </div>

                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mt-8 mb-6 border-b border-[var(--border)] pb-4">A Propos (About)</h2>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Section Title</label>
                                <input
                                    type="text"
                                    value={configForm.aboutTitle || ''}
                                    onChange={(e) => setConfigForm({ ...configForm, aboutTitle: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Section Subtitle</label>
                                <textarea
                                    value={configForm.aboutSubtitle || ''}
                                    onChange={(e) => setConfigForm({ ...configForm, aboutSubtitle: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Body Paragraph 1</label>
                                <textarea
                                    value={configForm.aboutBody1 || ''}
                                    onChange={(e) => setConfigForm({ ...configForm, aboutBody1: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Body Paragraph 2</label>
                                <textarea
                                    value={configForm.aboutBody2 || ''}
                                    onChange={(e) => setConfigForm({ ...configForm, aboutBody2: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
                                />
                            </div>

                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mt-8 mb-6 border-b border-[var(--border)] pb-4">SEO Settings</h2>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Global SEO Title</label>
                                <input
                                    type="text"
                                    value={configForm.seoTitle || ''}
                                    onChange={(e) => setConfigForm({ ...configForm, seoTitle: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Global SEO Description</label>
                                <textarea
                                    value={configForm.seoDescription || ''}
                                    onChange={(e) => setConfigForm({ ...configForm, seoDescription: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Global SEO Keywords</label>
                                <textarea
                                    value={configForm.seoKeywords || ''}
                                    onChange={(e) => setConfigForm({ ...configForm, seoKeywords: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-50 mt-8 w-full"
                            >
                                {saving ? 'Saving...' : 'Save General Settings'}
                            </button>
                        </form>
                    </div>
                </div>
            )}


            {/* =========================================
                2. CATEGORIES & PRODUCTS VIEW
            ========================================= */}
            {activeTab === 'products' && (
                <div className="animate-in fade-in duration-300">
                    <BackButton />
                    
                    <div className="bg-[var(--card)] border border-[var(--border)] p-8 mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mb-6 border-b border-[var(--border)] pb-4">Manage Categories</h2>
                        <form onSubmit={handleSaveConfig} className="space-y-4">
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
                                                setConfigForm({ ...configForm, categories: newCats });
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
                                                setConfigForm({ ...configForm, categories: newCats });
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
                                                setConfigForm({ ...configForm, categories: newCats });
                                            }}
                                            className="px-4 py-3 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-4 pt-4">
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
                                    className="px-6 py-3 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Categories'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-[var(--card)] border border-[var(--border)] p-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mb-6 border-b border-[var(--border)] pb-4">Manage Products Inventory</h2>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/60 mb-6">Modify details, pricing, and stock of your individual items.</p>
                        <Link to="/admin/products" className="inline-block px-6 py-3 bg-[var(--background)] border border-[var(--border)] text-primary-400 font-bold uppercase tracking-widest text-[10px] hover:border-primary-400">
                            Open Product Manager
                        </Link>
                    </div>
                </div>
            )}


            {/* =========================================
                3. GESTION OF BLOG VIEW
            ========================================= */}
            {activeTab === 'blogs' && (
                <div className="animate-in fade-in duration-300">
                    <BackButton />
                    <div className="bg-[var(--card)] border border-[var(--border)] p-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mb-6 border-b border-[var(--border)] pb-4">Blog Management</h2>
                        
                        <div className="mb-10">
                            <h3 className="font-bold text-[11px] uppercase tracking-widest mb-4">Create New Post</h3>
                            <form onSubmit={handleCreateBlog} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Title</label>
                                    <input type="text" value={newBlog.title} onChange={e => setNewBlog({ ...newBlog, title: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Content</label>
                                    <textarea value={newBlog.content} onChange={e => setNewBlog({ ...newBlog, content: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-32 resize-none" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Image URL</label>
                                    <input type="url" value={newBlog.imageUrl} onChange={e => setNewBlog({ ...newBlog, imageUrl: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" />
                                </div>
                                <button type="submit" disabled={creatingBlog} className="px-6 py-3 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-50">
                                    {creatingBlog ? 'Creating...' : 'Publish Post'}
                                </button>
                            </form>
                        </div>

                        <div>
                            <h3 className="font-bold text-[11px] uppercase tracking-widest mb-4 border-t border-[var(--border)] pt-8">Published Posts</h3>
                            <div className="space-y-4">
                                {blogPosts.map(post => (
                                    <div key={post.id} className="p-4 bg-[var(--background)] border border-[var(--border)] flex justify-between items-start gap-4">
                                        <div className="flex gap-4 items-start w-full">
                                            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-16 h-16 object-cover mix-blend-luminosity opacity-80 border border-[var(--border)] flex-shrink-0" />}
                                            <div className="flex-1">
                                                <h4 className="font-bold text-[11px] uppercase tracking-widest">{post.title}</h4>
                                                <p className="text-[10px] text-[var(--foreground)]/60 mt-1 line-clamp-2 whitespace-pre-wrap">{post.content}</p>
                                                <p className="text-[9px] text-[var(--foreground)]/40 mt-2 uppercase tracking-widest">
                                                    {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleString() : 'Just now'}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteBlog(post.id)} className="p-2 text-[var(--foreground)]/40 hover:text-red-500 transition-colors flex-shrink-0" title="Delete Post"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {blogPosts.length === 0 && <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 py-4">No published posts yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* =========================================
                4. CENTRE DE RÉCEPTION (INBOX) VIEW
            ========================================= */}
            {activeTab === 'inbox' && (
                <div className="animate-in fade-in duration-300">
                    <BackButton />
                    <div className="bg-[var(--card)] border border-[var(--border)] p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[var(--border)] pb-4 mb-6 gap-4">
                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px]">Centre de Réception</h2>
                            
                            <div className="flex bg-[var(--background)] p-1 border border-[var(--border)] rounded-sm">
                                <button
                                    onClick={() => setActiveMessageTab('contact')}
                                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                        activeMessageTab === 'contact' ? 'bg-primary-400 text-black' : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    📩 Contact
                                </button>
                                <button
                                    onClick={() => setActiveMessageTab('subscribers')}
                                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                        activeMessageTab === 'subscribers' ? 'bg-primary-400 text-black' : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    🎁 Subscribers
                                </button>
                            </div>
                        </div>

                        {activeMessageTab === 'contact' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {contactMessages.map(msg => (
                                    <div key={msg.id} className="p-4 bg-[var(--background)] border border-[var(--border)] flex flex-col gap-2">
                                        <div className="flex justify-between items-start border-b border-[var(--border)] pb-2 mb-2">
                                            <div>
                                                <h4 className="font-bold text-[11px] uppercase tracking-widest">{msg.name}</h4>
                                                <p className="text-[10px] text-[var(--foreground)]/60">{msg.email} {msg.phone ? `| ${msg.phone}` : ''}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[9px] uppercase tracking-widest text-[var(--foreground)]/40">
                                                    {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleString() : 'Just now'}
                                                </span>
                                                <button onClick={() => handleDeleteContactMessage(msg.id)} className="p-1 text-[var(--foreground)]/40 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <p className="text-[11px] whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                ))}
                                {contactMessages.length === 0 && <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 text-center py-8">No messages received yet.</p>}
                            </div>
                        )}

                        {activeMessageTab === 'subscribers' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {subscribers.map(sub => (
                                    <div key={sub.id} className="p-4 bg-[var(--background)] border border-[var(--border)] flex justify-between items-center gap-4">
                                        <div>
                                            <p className="font-mono text-[12px] font-bold text-primary-400">{sub.email}</p>
                                            <p className="text-[9px] uppercase tracking-widest text-[var(--foreground)]/40 mt-1">
                                                Subscribed: {sub.subscribedAt?.toDate ? new Date(sub.subscribedAt.toDate()).toLocaleString() : (sub.createdAt?.toDate ? new Date(sub.createdAt.toDate()).toLocaleString() : 'Just now')}
                                            </p>
                                        </div>
                                        <button onClick={() => handleDeleteSubscriber(sub.id)} className="p-2 text-[var(--foreground)]/40 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {subscribers.length === 0 && <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 text-center py-8">No subscribers found yet.</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}