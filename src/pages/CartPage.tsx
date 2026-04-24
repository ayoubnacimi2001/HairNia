import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + (cart.length > 0 ? shipping : 0);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate Stripe redirect or payment procressing
    setTimeout(() => {
      alert('This is a demo. In a real app, this would redirect to Stripe Checkout!');
      clearCart();
      setIsCheckingOut(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif italic mb-8">Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-[var(--card)] border border-[var(--border)]">
          <h2 className="text-2xl font-serif italic mb-4">Your cart is empty</h2>
          <p className="text-[var(--foreground)]/60 mb-8 uppercase tracking-widest text-[10px]">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop" className="inline-block px-8 py-3 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-[var(--card)] border border-[var(--border)]">
                <img src={item.imageUrl} alt={item.title} className="w-24 h-24 object-cover bg-[var(--background)] mix-blend-luminosity opacity-80" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="font-serif italic text-lg">{item.title}</h3>
                      <p className="font-mono font-bold text-primary-400">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/60">${item.price} each</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-3 border border-[var(--border)] px-2 py-1 bg-[var(--background)]">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1 hover:text-primary-400 text-[var(--foreground)]/60 transition"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-4 text-center text-xs font-mono">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:text-primary-400 text-[var(--foreground)]/60 transition"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-[var(--foreground)]/40 hover:text-red-500 p-2 transition"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-[var(--card)] border border-[var(--border)] p-6 sticky top-24">
              <h2 className="text-xl font-serif italic mb-6">Order Summary</h2>
              <div className="space-y-4 text-[11px] uppercase tracking-widest text-[var(--foreground)]/60">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[var(--foreground)]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono text-[var(--foreground)]">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center text-[var(--foreground)]">
                  <span className="font-bold">Total</span>
                  <span className="font-mono font-bold text-2xl text-primary-400">${total.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full mt-8 bg-primary-400 text-black py-3 text-[10px] uppercase font-bold tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'} <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-[9px] text-center text-[var(--foreground)]/40 uppercase tracking-widest mt-4">Secure checkout powered by Stripe</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
