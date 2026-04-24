import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';

export function ContactPage() {
  const { siteConfig } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      setError('An error occurred while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif italic mb-4">Get in Touch</h1>
        <div className="w-10 h-0.5 bg-primary-400 mx-auto mb-6" />
        <p className="text-[11px] uppercase tracking-widest text-[var(--foreground)]/60 max-w-2xl mx-auto">
          Have questions about our tools, products, or your order? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-[var(--card)] border border-[var(--border)] p-8">
            <h2 className="text-2xl font-serif italic mb-6">Contact Information</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 border border-primary-500/20 text-primary-400">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[11px] uppercase tracking-widest mb-1">Email Us</h3>
                  <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-wider mb-2">For support and general queries.</p>
                  <a href={`mailto:${siteConfig.contactEmail}`} className="text-primary-400 text-[11px] uppercase tracking-widest hover:underline">{siteConfig.contactEmail}</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 border border-primary-500/20 text-primary-400">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[11px] uppercase tracking-widest mb-1">Call Us</h3>
                  <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-wider mb-2">Mon-Fri from 8am to 5pm.</p>
                  <a href="tel:+1234567890" className="text-primary-400 text-[11px] uppercase tracking-widest hover:underline">+1 234 567 890</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 border border-primary-500/20 text-primary-400">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[11px] uppercase tracking-widest mb-1">Headquarters</h3>
                  <p className="text-[10px] text-[var(--foreground)]/60 uppercase tracking-wider leading-loose">123 Style Avenue, Barber District<br/>New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[var(--card)] border border-[var(--border)] p-8">
          <h2 className="text-2xl font-serif italic mb-6">Send us a Message</h2>
          {success ? (
            <div className="bg-primary-900/30 border border-primary-400/50 text-primary-400 p-4 text-[11px] uppercase tracking-widest">
              Thank you for your message! We will get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="text-red-500 text-[10px] uppercase tracking-widest">{error}</div>}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] placeholder:text-[var(--foreground)]/30"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] placeholder:text-[var(--foreground)]/30"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] placeholder:text-[var(--foreground)]/30"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] resize-none placeholder:text-[var(--foreground)]/30"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary-400 text-black text-[10px] uppercase font-bold tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
