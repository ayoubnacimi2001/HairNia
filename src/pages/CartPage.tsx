import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, CheckCircle, Truck, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

export function CartPage() {
    const { cart, removeFromCart, updateQuantity, clearCart, user, showToast } = useStore();
    
    // UI States
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    
    // Payment Method State
    const [paymentMethod, setPaymentMethod] = useState<'pod' | 'card'>('pod');
    
    // Form State
    const [deliveryInfo, setDeliveryInfo] = useState({
        name: '',
        phone: '',
        address: '',
        city: ''
    });

    const total = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setLoading(true);
        try {
            const batch = writeBatch(db);
            const orderRef = doc(collection(db, 'orders'));
            
            // Generate the Order Document with exact fields AdminDashboard expects
            batch.set(orderRef, {
                userId: user?.uid || 'guest',
                userEmail: user?.email || 'Client Non Connecté',
                customerName: deliveryInfo.name,
                deliveryPhone: deliveryInfo.phone,
                deliveryAddress: deliveryInfo.address,
                deliveryCity: deliveryInfo.city,
                totalAmount: Number(total.toFixed(2)),
                status: 'En attente',
                paymentMethod: paymentMethod === 'pod' ? 'Paiement à la livraison (POD)' : 'Carte Bancaire',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Generate the Line Items Sub-Collection
            cart.forEach(item => {
                const itemRef = doc(collection(db, `orders/${orderRef.id}/items`));
                batch.set(itemRef, {
                    // 🔥 FIXED: Using item.id to match your store interface
                    productId: item.id, 
                    title: item.title,
                    price: Number(item.price),
                    quantity: Number(item.quantity)
                });
            });

            await batch.commit();
            clearCart();
            setOrderSuccess(true);
            
            if(showToast) showToast('Commande confirmée avec succès !');
        } catch (err) {
            console.error(err);
            if(showToast) showToast('Erreur lors de la commande.');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-32 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-primary-400/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary-400/20 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                    <CheckCircle className="w-12 h-12 text-primary-400" />
                </div>
                <h1 className="text-4xl font-serif italic text-primary-400 mb-6">Commande Réussie !</h1>
                <p className="text-[14px] text-[var(--foreground)]/80 mb-10 leading-relaxed max-w-lg mx-auto">
                    {paymentMethod === 'pod' 
                        ? "Merci pour votre achat. Nous vous contacterons très prochainement pour confirmer l'envoi de votre commande, ou vous serez contacté directement par notre livreur."
                        : "Merci pour votre achat. Votre mode de paiement a été enregistré avec succès et votre commande est en cours de préparation."
                    }
                </p>
                <Link to="/shop" className="inline-flex items-center gap-3 px-8 py-5 bg-primary-400 text-black font-bold uppercase tracking-[0.2em] text-[11px] hover:opacity-90 transition-opacity">
                    Retour à la boutique <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-serif italic mb-12">Mon Panier</h1>
            
            {cart.length === 0 ? (
                <div className="text-center py-24 border border-[var(--border)] bg-[var(--card)] animate-in fade-in duration-500">
                    <ShoppingBag className="w-16 h-16 opacity-20 mx-auto mb-6" />
                    <p className="text-[11px] uppercase tracking-widest opacity-60 mb-8">Votre panier est actuellement vide.</p>
                    <Link to="/shop" className="px-8 py-4 border border-primary-400 text-primary-400 font-bold uppercase tracking-widest text-[10px] inline-block hover:bg-primary-400 hover:text-black transition-all">
                        Continuer vos achats
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* --- CART ITEMS LIST --- */}
                    <div className="lg:w-2/3 space-y-6">
                        {cart.map(item => (
                            // 🔥 FIXED: Using item.id
                            <div key={item.id} className="flex gap-6 p-6 border border-[var(--border)] bg-[var(--card)] items-center animate-in fade-in slide-in-from-left-4">
                                <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.title} className="w-24 h-24 object-cover border border-[var(--border)]" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-[16px] font-serif italic mb-2">{item.title}</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-primary-400 font-bold mb-4" translate="no">${Number(item.price).toFixed(2)} CHACUN</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-[var(--border)] bg-[var(--background)]">
                                            {/* 🔥 FIXED: Using item.id */}
                                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-3 hover:text-primary-400 transition-colors"><Minus className="w-3 h-3" /></button>
                                            <span className="w-8 text-center text-[12px] font-bold font-mono" translate="no">{item.quantity}</span>
                                            {/* 🔥 FIXED: Using item.id */}
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-3 hover:text-primary-400 transition-colors"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col justify-between h-full">
                                    <p className="font-bold text-[18px] text-primary-400 font-mono" translate="no">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                                    {/* 🔥 FIXED: Using item.id */}
                                    <button onClick={() => removeFromCart(item.id)} className="p-2 opacity-40 hover:text-red-500 hover:opacity-100 transition-colors mt-auto self-end" title="Retirer l'article">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- ORDER SUMMARY / CHECKOUT FORM --- */}
                    <div className="lg:w-1/3">
                        <div className="border border-[var(--border)] bg-[var(--card)] p-8 sticky top-24">
                            <h2 className="text-2xl font-serif italic mb-8">Résumé de la commande</h2>
                            
                            <div className="space-y-4 mb-8 border-b border-[var(--border)] pb-8">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="opacity-60">Total</span>
                                    <span translate="no" className="font-mono">${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="opacity-60">Expédition</span>
                                    <span className="text-primary-400">Gratuit</span>
                                </div>
                                <div className="flex justify-between text-[14px] font-bold uppercase tracking-widest pt-4">
                                    <span>Total Final</span>
                                    <span className="text-primary-400 text-2xl font-mono" translate="no">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {!showCheckoutForm ? (
                                // STATE 1: SUMMARY BUTTON
                                <div className="animate-in fade-in">
                                    <button 
                                        onClick={() => setShowCheckoutForm(true)} 
                                        className="w-full py-5 bg-primary-400 text-black font-bold uppercase tracking-[0.2em] text-[11px] hover:opacity-90 transition-all flex items-center justify-center gap-3 group shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                                    >
                                        Méthode de Paiement <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    
                                    <div className="flex justify-center items-center gap-6 mt-6 opacity-40">
                                        <div className="flex items-center gap-2" title="Paiement Sécurisé">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <div className="w-1 h-1 bg-[var(--foreground)] rounded-full"></div>
                                        <div className="flex items-center gap-2" title="Livraison Rapide">
                                            <Truck className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // STATE 2: DELIVERY DETAILS & PAYMENT FORM
                                <form onSubmit={handleCheckout} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    
                                    <div>
                                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-60 block mb-3">Moyen de Paiement</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('pod')}
                                                className={`p-4 border flex flex-col items-center justify-center gap-3 transition-all ${
                                                    paymentMethod === 'pod' 
                                                    ? 'border-primary-400 bg-primary-400/5 text-primary-400' 
                                                    : 'border-[var(--border)] text-[var(--foreground)]/60 hover:border-white/30'
                                                }`}
                                            >
                                                <Truck className="w-6 h-6" />
                                                <span className="text-[8px] font-bold uppercase tracking-widest text-center">À la livraison</span>
                                            </button>
                                            
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('card')}
                                                className={`p-4 border flex flex-col items-center justify-center gap-3 transition-all ${
                                                    paymentMethod === 'card' 
                                                    ? 'border-primary-400 bg-primary-400/5 text-primary-400' 
                                                    : 'border-[var(--border)] text-[var(--foreground)]/60 hover:border-white/30'
                                                }`}
                                            >
                                                <CreditCard className="w-6 h-6" />
                                                <span className="text-[8px] font-bold uppercase tracking-widest text-center">Carte Bancaire</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* DELIVERY INFORMATION */}
                                    <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-60 block mb-2">Informations de Livraison</label>
                                        <input type="text" required value={deliveryInfo.name} onChange={e => setDeliveryInfo({...deliveryInfo, name: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] p-4 text-[11px] focus:border-primary-400 outline-none transition-colors" placeholder="Nom Complet (Ex: Ayoub Nacimi)" />
                                        <input type="tel" required value={deliveryInfo.phone} onChange={e => setDeliveryInfo({...deliveryInfo, phone: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] p-4 text-[11px] focus:border-primary-400 outline-none transition-colors" placeholder="Numéro de Téléphone" />
                                        <input type="text" required value={deliveryInfo.city} onChange={e => setDeliveryInfo({...deliveryInfo, city: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] p-4 text-[11px] focus:border-primary-400 outline-none transition-colors" placeholder="Ville (Ex: Casablanca)" />
                                        <textarea required value={deliveryInfo.address} onChange={e => setDeliveryInfo({...deliveryInfo, address: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] p-4 text-[11px] h-24 resize-none focus:border-primary-400 outline-none transition-colors" placeholder="Adresse complète..." />
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <button type="submit" disabled={loading} className="w-full py-5 bg-primary-400 text-black font-bold uppercase tracking-[0.2em] text-[11px] hover:opacity-90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                                            {loading ? 'Traitement en cours...' : (paymentMethod === 'pod' ? 'Confirmer la commande' : 'Payer de manière sécurisée')}
                                        </button>
                                        <button type="button" onClick={() => setShowCheckoutForm(false)} className="w-full py-4 bg-transparent border border-[var(--border)] text-[var(--foreground)] font-bold uppercase tracking-widest text-[9px] hover:border-[var(--foreground)]/30 transition-all">
                                            Retour au résumé
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}