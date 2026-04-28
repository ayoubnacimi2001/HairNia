import React, { useEffect, useState } from 'react'
import { useStore } from '../../store/useStore';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, getDocs, orderBy, limit, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Settings, ShoppingBag, FileText, Inbox, ArrowLeft, Receipt, ArrowRight, Edit2, X, Share2, LayoutTemplate, Palette } from 'lucide-react';
import { getPageTemplates } from '../../lib/pageTemplates';

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

interface OrderItem {
    productId: string;
    price: number;
    quantity: number;
    title?: string;
}

interface Order {
    id: string;
    userId: string;
    userEmail?: string;
    totalAmount: number;
    status: string;
    deliveryPhone?: string;
    deliveryAddress?: string;
    createdAt?: any;
    items?: OrderItem[];
}

interface FormField {
    label: string;
    name: string;
    type: string;
    required: boolean;
    options?: string[];
}

interface Page {
    id: string;
    title: string;
    slug: string;
    visualBlocks?: any[]; // For the Visual Builder content
    content: string;
    showInMenu: boolean;
    createdAt?: any;
    formSchema?: FormField[];
}

export function AdminDashboard() {
    const { user, siteConfig, setSiteConfig, showToast } = useStore();
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();
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
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const [pages, setPages] = useState<Page[]>([]);
    const [newPage, setNewPage] = useState<{title: string, slug: string, content: string, showInMenu: boolean, formSchema: FormField[]}>({ 
        title: '', slug: '', content: '', showInMenu: false, formSchema: [] 
    });
    const [creatingPage, setCreatingPage] = useState(false);
    const [editingPageObj, setEditingPageObj] = useState<Page | null>(null);

    const [activeTab, setActiveTab] = useState<'menu' | 'settings' | 'products' | 'blogs' | 'inbox' | 'orders' | 'advanced' | 'pages'>('menu');
    const [activeMessageTab, setActiveMessageTab] = useState<'contact' | 'subscribers'>('contact');

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const fetchPages = async () => {
        try {
            const q = query(collection(db, 'pages'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setPages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Page)));
        } catch (err) {
            console.error("Failed to fetch pages:", err);
        }
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
            const snap = await getDocs(q);
            const ordersList = await Promise.all(snap.docs.map(async (d) => {
                const orderData = { id: d.id, ...d.data() } as Order;
                const itemsSnap = await getDocs(collection(db, `orders/${d.id}/items`));
                orderData.items = itemsSnap.docs.map(itemDoc => itemDoc.data() as OrderItem);
                return orderData;
            }));
            setOrders(ordersList);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setLoadingOrders(false);
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
            if(showToast) showToast('Article publié avec succès!');
            else alert('Blog post created successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to create blog post.');
        } finally {
            setCreatingBlog(false);
        }
    };

    const handleUpdateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost) return;
        setSaving(true);
        try {
            const postRef = doc(db, 'blogs', editingPost.id);
            await updateDoc(postRef, {
                title: editingPost.title,
                content: editingPost.content,
                imageUrl: editingPost.imageUrl,
                updatedAt: serverTimestamp()
            });
            setEditingPost(null);
            fetchBlogPosts();
            if(showToast) showToast('Article mis à jour!');
        } catch (err) {
            console.error(err);
            alert('Failed to update post.');
        } finally {
            setSaving(false);
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

    const handleCreatePage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPage.title || !newPage.content) return;
        setCreatingPage(true);
        // Auto-generate slug if left empty
        const slug = newPage.slug || newPage.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        try {
            await addDoc(collection(db, 'pages'), {
                ...newPage,
                slug,
                createdAt: serverTimestamp()
            });
            setNewPage({ title: '', slug: '', content: '', showInMenu: false, formSchema: [], visualBlocks: [] });
            fetchPages();
            if(showToast) showToast('Page créée avec succès!');
        } catch (err) {
            console.error(err);
            alert('Failed to create page.');
        } finally {
            setCreatingPage(false);
        }
    };

    const handleSelectTemplate = async (templateKey: keyof ReturnType<typeof getPageTemplates>) => {
        if (!newPage.title) {
            alert("Veuillez d'abord saisir un titre de page (Page Title).");
            return;
        }
        setCreatingPage(true);
        try {
            const templates = getPageTemplates();
            const blocks = templates[templateKey];
            const slug = newPage.slug || newPage.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            
            const docRef = await addDoc(collection(db, 'pages'), {
                title: newPage.title,
                slug,
                showInMenu: newPage.showInMenu,
                visualBlocks: blocks || [],
                createdAt: serverTimestamp()
            });
            
            setNewPage({ title: '', slug: '', content: '', showInMenu: false, formSchema: [], visualBlocks: [] });
            fetchPages();
            
            // Redirect to builder
            navigate(`/admin/builder/${docRef.id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to create page with template.");
        } finally {
            setCreatingPage(false);
        }
    };

    const handleUpdatePage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPageObj) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'pages', editingPageObj.id), { ...editingPageObj, updatedAt: serverTimestamp() });
            setEditingPageObj(null);
            fetchPages();
            if(showToast) showToast('Page mise à jour!');
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const updateOrderStatus = async (id: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'orders', id), { status: newStatus });
            setSelectedOrder(prev => prev ? {...prev, status: newStatus} : null);
            fetchOrders();
            if(showToast) showToast(`Statut mis à jour: ${newStatus}`);
        } catch (err) {
            console.error(err);
        }
    };

    // 🔥 NEW: DELETE ORDER LOGIC
    const handleDeleteOrder = async (id: string) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande livrée définitivement ?')) return;
        try {
            // 🔥 FIX: Delete all items in the subcollection first to avoid orphaned documents
            const itemsSnap = await getDocs(collection(db, `orders/${id}/items`));
            const deletePromises = itemsSnap.docs.map(itemDoc => deleteDoc(itemDoc.ref));
            await Promise.all(deletePromises);

            // Now safely delete the parent document
            await deleteDoc(doc(db, 'orders', id));
            fetchOrders();
            if(showToast) showToast('Commande supprimée avec succès!');
        } catch (err) {
            console.error(err);
            alert('Failed to delete order.');
        }
    };

    const handleDeletePage = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this page?')) return;
        try {
            await deleteDoc(doc(db, 'pages', id));
            fetchPages();
        } catch (err) { console.error(err); }
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
            if(showToast) showToast('Couleur appliquée avec succès!');
            else alert('Theme color applied successfully!');
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
                    fetchPages();
                } else {
                    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                    if (adminDoc.exists()) {
                        setIsAdmin(true);
                        fetchBlogPosts();
                        fetchContactMessages();
                        fetchSubscribers();
                        fetchPages();
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
                
                const format = field === 'logoUrl' ? 'image/png' : 'image/jpeg';
                if (format === 'image/jpeg' && ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                }

                ctx?.drawImage(img, 0, 0, width, height);

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
            if(showToast) showToast('Paramètres sauvegardés!');
            else alert('Settings saved successfully!');
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

    const BackButton = () => (
        <>
            <button 
                onClick={() => { setActiveTab('menu'); window.scrollTo(0, 0); }} 
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/60 hover:text-primary-400 transition-all duration-300 ${
                    isScrolled ? 'opacity-0 h-0 overflow-hidden mb-0 pointer-events-none' : 'opacity-100 h-auto mb-8'
                }`}
            >
                <ArrowLeft className="w-4 h-4" /> Retour au Menu Principal
            </button>

            <button 
                onClick={() => { setActiveTab('menu'); window.scrollTo(0, 0); }} 
                className={`fixed top-24 left-6 sm:left-10 z-[500] w-12 h-12 flex items-center justify-center rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:scale-105 group ${
                    isScrolled ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0 pointer-events-none'
                }`}
                style={{ backgroundColor: previewColor || 'var(--theme-primary)' }}
                title="Retour au Menu"
            >
                <ArrowLeft className="w-6 h-6 text-black group-hover:-translate-x-1 transition-transform" />
            </button>
        </>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-3xl font-serif italic mb-8">Admin Dashboard</h1>

            {/* =========================================
                MAIN MENU VIEW
            ========================================= */}
            {activeTab === 'menu' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    <button onClick={() => { setActiveTab('settings'); window.scrollTo(0, 0); }} className="p-8 bg-[var(--card)] border border-[var(--border)] hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-4 text-center group">
                        <Settings className="w-10 h-10 text-[var(--foreground)]/40 group-hover:text-primary-400 transition-colors" />
                        <div>
                            <h2 className="font-bold uppercase tracking-widest text-[13px] mb-2 text-[var(--foreground)]"> General Settings</h2>
                            <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-widest">Theme, Logo, Hero, SEO & About</p>
                        </div>
                    </button>

                    <button onClick={() => { setActiveTab('products'); window.scrollTo(0, 0); }} className="p-8 bg-[var(--card)] border border-[var(--border)] hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-4 text-center group">
                        <ShoppingBag className="w-10 h-10 text-[var(--foreground)]/40 group-hover:text-primary-400 transition-colors" />
                        <div>
                            <h2 className="font-bold uppercase tracking-widest text-[13px] mb-2 text-[var(--foreground)]"> Categories & Products</h2>
                            <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-widest">Manage inventory and categories</p>
                        </div>
                    </button>

                    <button onClick={() => { setActiveTab('orders'); fetchOrders(); window.scrollTo(0, 0); }} className="p-8 bg-[var(--card)] border border-[var(--border)] hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-4 text-center group">
                        <Receipt className="w-10 h-10 text-[var(--foreground)]/40 group-hover:text-primary-400 transition-colors" />
                        <div>
                            <h2 className="font-bold uppercase tracking-widest text-[13px] mb-2 text-[var(--foreground)]"> Commandes Client</h2>
                            <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-widest">Suivi des ventes et livraisons</p>
                        </div>
                    </button>

                    <button onClick={() => { setActiveTab('blogs'); window.scrollTo(0, 0); }} className="p-8 bg-[var(--card)] border border-[var(--border)] hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-4 text-center group">
                        <FileText className="w-10 h-10 text-[var(--foreground)]/40 group-hover:text-primary-400 transition-colors" />
                        <div>
                            <h2 className="font-bold uppercase tracking-widest text-[13px] mb-2 text-[var(--foreground)]"> Gestion of Blog</h2>
                            <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-widest">Create and manage articles</p>
                        </div>
                    </button>

                    <button onClick={() => { setActiveTab('advanced'); window.scrollTo(0, 0); }} className="p-8 bg-[var(--card)] border border-[var(--border)] hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-4 text-center group">
                        <Share2 className="w-10 h-10 text-[var(--foreground)]/40 group-hover:text-primary-400 transition-colors" />
                        <div>
                            <h2 className="font-bold uppercase tracking-widest text-[13px] mb-2 text-[var(--foreground)]"> Advanced Settings</h2>
                            <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-widest">Social Media Links</p>
                        </div>
                    </button>

                    <button onClick={() => { setActiveTab('pages'); fetchPages(); window.scrollTo(0, 0); }} className="p-8 bg-[var(--card)] border border-[var(--border)] hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-4 text-center group">
                        <LayoutTemplate className="w-10 h-10 text-[var(--foreground)]/40 group-hover:text-primary-400 transition-colors" />
                        <div>
                            <h2 className="font-bold uppercase tracking-widest text-[13px] mb-2 text-[var(--foreground)]"> Page Builder</h2>
                            <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-widest">Custom Pages & Navigation</p>
                        </div>
                    </button>

                    <button onClick={() => { setActiveTab('inbox'); window.scrollTo(0, 0); }} className="sm:col-span-2 mt-4 p-8 bg-[var(--card)] border border-[var(--border)] hover:border-primary-400 transition-all flex flex-col items-center justify-center gap-4 text-center group">
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
                <div className="animate-in fade-in duration-300 relative">
                    <BackButton />
                    <div className="bg-[var(--card)] border border-[var(--border)] p-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mb-6 border-b border-[var(--border)] pb-4">General Site Settings</h2>
                        
                        <form onSubmit={handleSaveConfig} className="space-y-6">
                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mt-8 mb-6 border-b border-[var(--border)] pb-4">Theme Customization</h2>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Primary Accent Color</label>
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1">
                                        <input type="text" value={previewColor} onChange={(e) => setPreviewColor(e.target.value)} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] font-mono uppercase" />
                                    </div>
                                    <div className="w-12 h-[42px] border border-[var(--border)] rounded-sm overflow-hidden flex-shrink-0">
                                        <input type="color" value={previewColor} onChange={(e) => setPreviewColor(e.target.value)} className="w-full h-full p-0 border-0 cursor-pointer object-cover scale-[2.0]" />
                                    </div>
                                    <button type="button" onClick={handleApplyColor} disabled={saving} className="px-6 py-3 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-50 h-[42px]">Apply</button>
                                    <button type="button" onClick={handleCancelColor} disabled={saving} className="px-6 py-3 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)] font-bold uppercase tracking-widest text-[10px] disabled:opacity-50 h-[42px]">Cancel</button>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mt-8 mb-6 border-b border-[var(--border)] pb-4">General Info & Images</h2>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Site Name</label>
                                <input type="text" value={configForm.siteName || ''} onChange={(e) => setConfigForm({ ...configForm, siteName: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" required />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">
                                    Logo Image <span className="text-[9px] text-[var(--foreground)]/50 normal-case font-normal">(Recommandé: 300x300px max, PNG/JPG)</span>
                                </label>
                                <div className="relative flex flex-col md:flex-row md:items-center gap-4 bg-[var(--background)] border border-[var(--border)] p-4 rounded-sm pt-8 md:pt-4">
                                    {configForm.logoUrl && <img src={configForm.logoUrl} alt="Logo" className="h-12 w-auto object-contain bg-black px-2 border border-[var(--border)]" />}
                                    <input type="file" accept="image/*" onChange={handleImageUpload('logoUrl')} className="w-full text-[11px] file:bg-primary-400 file:text-black hover:file:opacity-90" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">
                                    Hero Main Image <span className="text-[9px] text-[var(--foreground)]/50 normal-case font-normal">(Recommandé: 1200x800px max, haute qualité)</span>
                                </label>
                                <div className="relative flex flex-col md:flex-row md:items-center gap-4 bg-[var(--background)] border border-[var(--border)] p-4 rounded-sm pt-8 md:pt-4">
                                    {configForm.heroImageUrl && <img src={configForm.heroImageUrl} alt="Hero" className="w-20 h-10 object-cover bg-black border border-[var(--border)]" />}
                                    <input type="file" accept="image/*" onChange={handleImageUpload('heroImageUrl')} className="w-full text-[11px] file:bg-primary-400 file:text-black hover:file:opacity-90" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Hero Title</label>
                                <input type="text" value={configForm.heroTitle || ''} onChange={(e) => setConfigForm({ ...configForm, heroTitle: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" required />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Hero Subtitle</label>
                                <textarea value={configForm.heroSubtitle || ''} onChange={(e) => setConfigForm({ ...configForm, heroSubtitle: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none" required />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Contact Email</label>
                                <input type="email" value={configForm.contactEmail || ''} onChange={(e) => setConfigForm({ ...configForm, contactEmail: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" required />
                            </div>

                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mt-8 mb-6 border-b border-[var(--border)] pb-4">A Propos (About)</h2>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Section Title</label>
                                <input type="text" value={configForm.aboutTitle || ''} onChange={(e) => setConfigForm({ ...configForm, aboutTitle: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Section Subtitle</label>
                                <textarea value={configForm.aboutSubtitle || ''} onChange={(e) => setConfigForm({ ...configForm, aboutSubtitle: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Body Paragraph 1</label>
                                <textarea value={configForm.aboutBody1 || ''} onChange={(e) => setConfigForm({ ...configForm, aboutBody1: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">About Body Paragraph 2</label>
                                <textarea value={configForm.aboutBody2 || ''} onChange={(e) => setConfigForm({ ...configForm, aboutBody2: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none" />
                            </div>

                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mt-8 mb-6 border-b border-[var(--border)] pb-4">SEO Settings</h2>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Global SEO Title</label>
                                <input type="text" value={configForm.seoTitle || ''} onChange={(e) => setConfigForm({ ...configForm, seoTitle: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Global SEO Description</label>
                                <textarea value={configForm.seoDescription || ''} onChange={(e) => setConfigForm({ ...configForm, seoDescription: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Global SEO Keywords (Séparés par des virgules)</label>
                                <textarea value={configForm.seoKeywords || ''} onChange={(e) => setConfigForm({ ...configForm, seoKeywords: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-24 resize-none" />
                            </div>

                            <button type="submit" disabled={saving} className="px-6 py-3 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] mt-8 w-full hover:opacity-90 transition-opacity">
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
                <div className="animate-in fade-in duration-300 relative">
                    <BackButton />
                    <div className="bg-[var(--card)] border border-[var(--border)] p-8 mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mb-6 border-b border-[var(--border)] pb-4">Manage Categories</h2>
                        <form onSubmit={handleSaveConfig} className="space-y-4">
                            {configForm.categories?.map((cat, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-1">Category ID (no spaces)</label>
                                        <input type="text" value={cat.id || ''} onChange={(e) => {
                                                const newCats = [...(configForm.categories || [])];
                                                newCats[index] = { ...newCats[index], id: e.target.value.toLowerCase().replace(/\s+/g, '-') };
                                                setConfigForm({ ...configForm, categories: newCats });
                                            }} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" required />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-1">Display Name</label>
                                        <input type="text" value={cat.name || ''} onChange={(e) => {
                                                const newCats = [...(configForm.categories || [])];
                                                newCats[index] = { ...newCats[index], name: e.target.value };
                                                setConfigForm({ ...configForm, categories: newCats });
                                            }} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" required />
                                    </div>
                                    <div className="flex items-end">
                                        <button type="button" onClick={() => {
                                                const newCats = configForm.categories?.filter((_, i) => i !== index);
                                                setConfigForm({ ...configForm, categories: newCats });
                                            }} className="px-4 py-3 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => {
                                        setConfigForm({ ...configForm, categories: [...(configForm.categories || []), { id: `category-${Date.now()}`, name: 'New Category' }] });
                                    }} className="px-4 py-3 bg-[var(--background)] border border-[var(--border)] text-primary-400 hover:border-primary-400 transition-colors text-[10px] font-bold uppercase tracking-widest">
                                    + Add Category
                                </button>
                                <button type="submit" disabled={saving} className="px-6 py-3 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-50">
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
                3. ORDERS (COMMANDES) VIEW
            ========================================= */}
            {activeTab === 'orders' && (
                <div className="animate-in fade-in duration-300 relative">
                    <BackButton />
                    <div className="bg-[var(--card)] border border-[var(--border)] p-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mb-6 border-b border-[var(--border)] pb-4">Suivi des Commandes</h2>
                        <div className="space-y-4">
                            {loadingOrders ? (
                                <p className="text-center py-10 text-[10px] uppercase tracking-widest opacity-40">Chargement des commandes...</p>
                            ) : orders.map(order => (
                                <div key={order.id} className="p-5 bg-[var(--background)] border border-[var(--border)] flex justify-between items-center group hover:border-primary-400/50 transition-colors">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-primary-400 font-bold mb-1">ID: {order.id.slice(0, 8)}</p>
                                        <p className="text-[11px] font-mono text-[var(--foreground)]">${Number(order.totalAmount || 0).toFixed(2)}</p>
                                        <p className="text-[9px] text-[var(--foreground)]/40 uppercase mt-1">
                                            {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleString() : 'Recent'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 text-[8px] uppercase font-bold tracking-widest border transition-colors ${order.status === 'Livré' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-primary-400/10 text-primary-400 border-primary-400/20'}`}>
                                            {order.status}
                                        </span>
                                        
                                        {/* 🔥 NEW: Delete button ONLY for Delivered orders */}
                                        {order.status === 'Livré' && (
                                            <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-[var(--foreground)]/40 hover:text-red-500 transition-colors" title="Supprimer la commande">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}

                                        <button onClick={() => setSelectedOrder(order)} className="p-2 hover:text-primary-400 transition-colors">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {!loadingOrders && orders.length === 0 && (
                                <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 text-center py-8">Aucune commande pour le moment.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                4. GESTION OF BLOG VIEW
            ========================================= */}
            {activeTab === 'blogs' && (
                <div className="animate-in fade-in duration-300 relative">
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
                                        <div className="flex gap-4 items-start w-full overflow-hidden">
                                            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-16 h-16 object-cover mix-blend-luminosity opacity-80 border border-[var(--border)] flex-shrink-0" />}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-[11px] uppercase tracking-widest truncate">{post.title}</h4>
                                                <p className="text-[10px] text-[var(--foreground)]/60 mt-1 line-clamp-2 break-words whitespace-pre-wrap">{post.content}</p>
                                                <p className="text-[9px] text-[var(--foreground)]/40 mt-2 uppercase tracking-widest">
                                                    {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleString() : 'Just now'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            <button onClick={() => setEditingPost(post)} className="p-2 text-[var(--foreground)]/40 hover:text-primary-400 transition-colors" title="Edit Post">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteBlog(post.id)} className="p-2 text-[var(--foreground)]/40 hover:text-red-500 transition-colors" title="Delete Post">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {blogPosts.length === 0 && <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 py-4">No published posts yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                NEW: ADVANCED SETTINGS VIEW
            ========================================= */}
            {activeTab === 'advanced' && (
                <div className="animate-in fade-in duration-300 relative">
                    <BackButton />
                    <div className="bg-[var(--card)] border border-[var(--border)] p-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mb-6 border-b border-[var(--border)] pb-4">Advanced Settings & Integrations</h2>
                        
                        <form onSubmit={handleSaveConfig} className="space-y-6">
                            <h3 className="font-bold text-[11px] uppercase tracking-widest mb-4">Social Media Links</h3>
                            <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-widest mb-6">Leave blank to hide the icon from the website footer.</p>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Facebook URL</label>
                                <input type="url" value={configForm.socialFacebook || ''} onChange={(e) => setConfigForm({ ...configForm, socialFacebook: e.target.value })} placeholder="https://facebook.com/..." className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Instagram URL</label>
                                <input type="url" value={configForm.socialInstagram || ''} onChange={(e) => setConfigForm({ ...configForm, socialInstagram: e.target.value })} placeholder="https://instagram.com/..." className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Twitter / X URL</label>
                                <input type="url" value={configForm.socialTwitter || ''} onChange={(e) => setConfigForm({ ...configForm, socialTwitter: e.target.value })} placeholder="https://twitter.com/..." className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" />
                            </div>

                            <button type="submit" disabled={saving} className="px-6 py-3 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] mt-8 w-full hover:opacity-90 transition-opacity">
                                {saving ? 'Saving...' : 'Save Advanced Settings'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================
                NEW: PAGE BUILDER VIEW
            ========================================= */}
            {activeTab === 'pages' && (
                <div className="animate-in fade-in duration-300 relative">
                    <BackButton />
                    <div className="bg-[var(--card)] border border-[var(--border)] p-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-[11px] mb-6 border-b border-[var(--border)] pb-4">Dynamic Page Builder</h2>
                        
                        <div className="mb-10">
                            <h3 className="font-bold text-[11px] uppercase tracking-widest mb-4">Create New Page</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Page Title *</label>
                                        <input type="text" value={newPage.title} onChange={e => setNewPage({ ...newPage, title: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">URL Slug (Optional)</label>
                                        <input type="text" value={newPage.slug} onChange={e => setNewPage({ ...newPage, slug: e.target.value })} placeholder="auto-generated-if-blank" className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <input type="checkbox" id="showInMenu" checked={newPage.showInMenu} onChange={e => setNewPage({ ...newPage, showInMenu: e.target.checked })} className="accent-primary-400" />
                                    <label htmlFor="showInMenu" className="text-[10px] uppercase tracking-widest font-bold cursor-pointer">Show in Main Navigation Menu</label>
                                </div>

                                <div className="mt-8 border-t border-[var(--border)] pt-8">
                                    <h4 className="font-bold text-[11px] uppercase tracking-widest mb-4">Choose a Template & Create</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { id: 'blankTemplate', name: 'Blank Page', desc: 'Start from scratch' },
                                            { id: 'serviceTemplate', name: 'Services', desc: 'Professional service offering' },
                                            { id: 'highTicketSalesTemplate', name: 'Sales Page', desc: 'High ticket trust focused' },
                                            { id: 'customerServiceTemplate', name: 'Support', desc: 'Help center and links' },
                                            { id: 'faqTemplate', name: 'FAQ', desc: 'Frequently asked questions' },
                                            { id: 'fitnessProgramTemplate', name: 'Program', desc: 'Step-by-step breakdown' },
                                            { id: 'paymentPlanTemplate', name: 'Financing', desc: 'Payment plans layout' },
                                            { id: 'reservationTemplate', name: 'Booking', desc: 'Reservation focus' }
                                        ].map(tpl => (
                                            <button 
                                                key={tpl.id} 
                                                type="button"
                                                onClick={() => handleSelectTemplate(tpl.id as any)}
                                                disabled={creatingPage}
                                                className="p-4 bg-[var(--background)] border border-[var(--border)] hover:border-primary-400 text-left transition-colors flex flex-col gap-2 group disabled:opacity-50"
                                            >
                                                <span className="font-bold text-[10px] uppercase tracking-widest group-hover:text-primary-400 transition-colors">{tpl.name}</span>
                                                <span className="text-[9px] opacity-60 leading-relaxed">{tpl.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-[11px] uppercase tracking-widest mb-4 border-t border-[var(--border)] pt-8">Custom Pages</h3>
                            <div className="space-y-4">
                                {pages.map(p => (
                                    <div key={p.id} className="p-4 bg-[var(--background)] border border-[var(--border)] flex justify-between items-center gap-4">
                                        <div>
                                            <h4 className="font-bold text-[11px] uppercase tracking-widest">{p.title}</h4>
                                            <p className="text-[10px] text-[var(--foreground)]/60 mt-1 font-mono">/page/{p.slug}</p>
                                            <div className="mt-2 flex gap-2">
                                                {p.showInMenu && <span className="px-2 py-0.5 bg-primary-400/10 text-primary-400 text-[8px] uppercase tracking-widest border border-primary-400/20 font-bold">In Menu</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            <Link to={`/admin/builder/${p.id}`} className="p-2 text-primary-400 hover:text-primary-300 transition-colors bg-primary-400/10 rounded-sm" title="Design Page in Visual Builder">
                                                <Palette className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => setEditingPageObj(p)} className="p-2 text-[var(--foreground)]/40 hover:text-primary-400 transition-colors" title="Edit Page">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeletePage(p.id)} className="p-2 text-[var(--foreground)]/40 hover:text-red-500 transition-colors" title="Delete Page">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {pages.length === 0 && <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 py-4">No custom pages created yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                5. CENTRE DE RÉCEPTION (INBOX) VIEW
            ========================================= */}
            {activeTab === 'inbox' && (
                <div className="animate-in fade-in duration-300 relative">
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

            {/* =========================================
                🔥 POPUP MODALS 🔥
            ========================================= */}

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 py-12">
                        <div className="bg-[var(--card)] border border-primary-400/30 w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-8 border-b border-[var(--border)] pb-4">
                                <h2 className="text-xl font-serif italic text-primary-400">Détails de la Commande</h2>
                                <button onClick={() => setSelectedOrder(null)} className="hover:rotate-90 transition-transform">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6 bg-white/5 p-4 border border-white/10">
                                <div>
                                    <p className="text-[8px] uppercase tracking-widest opacity-60 font-bold mb-1">Client</p>
                                    <p className="text-[10px] font-bold">{selectedOrder.userEmail || 'Client Identifié'}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] uppercase tracking-widest opacity-60 font-bold mb-1">Contact</p>
                                    <p className="text-[10px] font-bold text-primary-400">{selectedOrder.deliveryPhone || 'Non Fourni'}</p>
                                </div>
                                <div className="col-span-2 pt-2">
                                    <p className="text-[8px] uppercase tracking-widest opacity-60 font-bold mb-1">Adresse de Livraison</p>
                                    <p className="text-[10px] leading-relaxed italic">"{selectedOrder.deliveryAddress || 'En attente'}"</p>
                                </div>
                            </div>

                            {/* Order Status Update Controls */}
                            <div className="flex gap-2 mb-8 border-b border-[var(--border)] pb-6">
                                {['En attente', 'Expédié', 'Livré'].map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => updateOrderStatus(selectedOrder.id, s)} 
                                        className={`flex-1 py-3 text-[9px] uppercase tracking-widest font-bold border transition-all ${selectedOrder.status === s ? 'bg-primary-400 text-black border-primary-400' : 'border-[var(--border)] opacity-60 hover:opacity-100 hover:border-primary-400'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3 mb-8">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-[11px] bg-[var(--background)] p-4 border border-[var(--border)]">
                                        <span className="font-bold uppercase tracking-widest">{item.title || 'Produit'} <span className="opacity-40">x{item.quantity}</span></span>
                                        <span className="font-mono text-primary-400 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center border-t border-[var(--border)] pt-4">
                                <span className="text-[12px] font-bold uppercase tracking-widest opacity-60">Total</span>
                                <span className="text-3xl font-mono font-bold text-primary-400">${Number(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT BLOG MODAL */}
            {editingPost && (
                <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 py-12">
                        <div className="bg-[var(--card)] border border-primary-400/30 w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-8 border-b border-[var(--border)] pb-4">
                                <h2 className="text-xl font-serif italic text-primary-400">Modifier l'article</h2>
                                <button onClick={() => setEditingPost(null)} className="hover:rotate-90 transition-transform">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateBlog} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest mb-2 opacity-60 font-bold">Titre</label>
                                    <input
                                        type="text"
                                        value={editingPost.title}
                                        onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] p-3 focus:border-primary-400 outline-none transition-colors text-[11px] font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest mb-2 opacity-60 font-bold">Image URL</label>
                                    <input
                                        type="url"
                                        value={editingPost.imageUrl}
                                        onChange={(e) => setEditingPost({...editingPost, imageUrl: e.target.value})}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] p-3 focus:border-primary-400 outline-none transition-colors text-[11px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest mb-2 opacity-60 font-bold">Contenu</label>
                                    <textarea
                                        rows={8}
                                        value={editingPost.content}
                                        onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                                        className="w-full bg-[var(--background)] border border-[var(--border)] p-3 focus:border-primary-400 outline-none transition-colors text-[11px] leading-relaxed resize-none"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingPost(null)}
                                        className="flex-1 border border-[var(--border)] py-4 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-white/5 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-primary-400 text-black py-4 text-[10px] uppercase font-bold tracking-[0.2em] hover:opacity-90 transition-opacity"
                                    >
                                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT PAGE MODAL */}
            {editingPageObj && (
                <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 py-12">
                        <div className="bg-[var(--card)] border border-primary-400/30 w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-8 border-b border-[var(--border)] pb-4">
                                <h2 className="text-xl font-serif italic text-primary-400">Modifier la Page</h2>
                                <button onClick={() => setEditingPageObj(null)} className="hover:rotate-90 transition-transform">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdatePage} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest mb-2 opacity-60 font-bold">Titre</label>
                                    <input type="text" value={editingPageObj.title} onChange={(e) => setEditingPageObj({...editingPageObj, title: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] p-3 focus:border-primary-400 outline-none transition-colors text-[11px] font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest mb-2 opacity-60 font-bold">URL Slug</label>
                                    <input type="text" value={editingPageObj.slug} onChange={(e) => setEditingPageObj({...editingPageObj, slug: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] p-3 focus:border-primary-400 outline-none transition-colors text-[11px]" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest mb-2 opacity-60 font-bold">Contenu (HTML)</label>
                                    <textarea rows={8} value={editingPageObj.content} onChange={(e) => setEditingPageObj({...editingPageObj, content: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] p-3 focus:border-primary-400 outline-none transition-colors text-[11px] leading-relaxed resize-none" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="editShowInMenu" checked={editingPageObj.showInMenu} onChange={e => setEditingPageObj({ ...editingPageObj, showInMenu: e.target.checked })} className="accent-primary-400" />
                                    <label htmlFor="editShowInMenu" className="text-[10px] uppercase tracking-widest font-bold cursor-pointer">Show in Main Navigation Menu</label>
                                </div>

                                {/* ================== FORM BUILDER (EDIT) ================== */}
                                <div className="mt-8 border-t border-[var(--border)] pt-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-[11px] uppercase tracking-widest">Data Connect Form</h4>
                                        <button type="button" onClick={() => setEditingPageObj({...editingPageObj, formSchema: [...(editingPageObj.formSchema || []), {label: '', name: '', type: 'text', required: false}]})} className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] text-primary-400 text-[9px] uppercase tracking-widest font-bold hover:border-primary-400 transition-colors">+ Add Field</button>
                                    </div>
                                    <div className="space-y-4">
                                        {editingPageObj.formSchema?.map((field, idx) => (
                                            <div key={idx} className="p-4 bg-[var(--background)] border border-[var(--border)] flex flex-wrap gap-4 items-start">
                                                <div className="flex-1 min-w-[150px]">
                                                    <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1">Field Label</label>
                                                    <input type="text" value={field.label} onChange={(e) => {
                                                        const newSchema = [...(editingPageObj.formSchema || [])];
                                                        newSchema[idx].label = e.target.value;
                                                        newSchema[idx].name = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_');
                                                        setEditingPageObj({...editingPageObj, formSchema: newSchema});
                                                    }} className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" required />
                                                </div>
                                                <div className="flex-1 min-w-[120px]">
                                                    <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1">Field Type</label>
                                                    <select value={field.type} onChange={(e) => {
                                                        const newSchema = [...(editingPageObj.formSchema || [])];
                                                        newSchema[idx].type = e.target.value;
                                                        setEditingPageObj({...editingPageObj, formSchema: newSchema});
                                                    }} className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none">
                                                        <option value="text">Text (Short)</option>
                                                        <option value="email">Email</option>
                                                        <option value="number">Number</option>
                                                        <option value="date">Date</option>
                                                        <option value="textarea">Long Text (Area)</option>
                                                        <option value="checkbox">Checkbox</option>
                                                        <option value="select">Dropdown (Select)</option>
                                                    </select>
                                                </div>
                                                {field.type === 'select' && (
                                                    <div className="flex-1 min-w-[200px]">
                                                        <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1">Options</label>
                                                        <input type="text" value={field.options?.join(', ') || ''} onChange={(e) => {
                                                            const newSchema = [...(editingPageObj.formSchema || [])];
                                                            newSchema[idx].options = e.target.value.split(',').map(s => s.trim());
                                                            setEditingPageObj({...editingPageObj, formSchema: newSchema});
                                                        }} className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" required />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mt-6">
                                                    <input type="checkbox" checked={field.required} onChange={(e) => {
                                                        const newSchema = [...(editingPageObj.formSchema || [])];
                                                        newSchema[idx].required = e.target.checked;
                                                        setEditingPageObj({...editingPageObj, formSchema: newSchema});
                                                    }} className="accent-primary-400" />
                                                    <span className="text-[9px] uppercase tracking-widest">Req.</span>
                                                </div>
                                                <button type="button" onClick={() => {
                                                    const newSchema = editingPageObj.formSchema?.filter((_, i) => i !== idx);
                                                    setEditingPageObj({...editingPageObj, formSchema: newSchema});
                                                }} className="mt-5 p-2 text-[var(--foreground)]/40 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setEditingPageObj(null)} className="flex-1 border border-[var(--border)] py-4 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-white/5 transition-colors">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={saving} className="flex-1 bg-primary-400 text-black py-4 text-[10px] uppercase font-bold tracking-[0.2em] hover:opacity-90 transition-opacity">
                                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
