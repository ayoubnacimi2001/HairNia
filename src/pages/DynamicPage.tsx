import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BlockRenderer } from './admin/BlockRenderer';

export function DynamicPage() {
    const { slug } = useParams();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Dynamic Form State
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        const fetchPage = async () => {
            if (!slug) return;
            try {
                const q = query(collection(db, 'pages'), where('slug', '==', slug));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    setPage({ id: snap.docs[0].id, ...snap.docs[0].data() });
                }
            } catch (error) {
                console.error('Failed to fetch page', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    const handleInputChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess(false);

        try {
            await addDoc(collection(db, 'formSubmissions'), {
                pageId: page.id,
                pageTitle: page.title,
                data: formData,
                createdAt: serverTimestamp()
            });
            setSubmitSuccess(true);
            setFormData({}); // Reset the form fields
        } catch (error) {
            console.error('Failed to submit form', error);
            setSubmitError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[10px] uppercase tracking-widest">Loading...</div>;
    if (!page) return <div className="min-h-screen flex items-center justify-center text-xl font-serif italic text-red-500">Page not found.</div>;

    return (
        <div className="animate-in fade-in duration-500">
            {/* DYNAMIC VISUAL BLOCKS RENDERING */}
            {page.visualBlocks && page.visualBlocks.length > 0 ? (
                <div className="flex flex-col w-full min-h-[50vh]">
                    {page.visualBlocks.map((block: any) => <BlockRenderer key={block.id} block={block} />)}
                </div>
            ) : (
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <h1 className="text-4xl font-serif italic mb-10">{page.title}</h1>
                    <div className="prose dark:prose-invert max-w-none text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: page.content }} />
                </div>
            )}

            {/* =========================================
                DYNAMIC SCHEMA-DRIVEN FORM
            ========================================= */}
            {page.formSchema && page.formSchema.length > 0 && (
                <div className="max-w-4xl mx-auto px-4 py-16 mt-16 bg-[var(--card)] border-y border-[var(--border)]">
                    {submitSuccess ? (
                        <div className="text-center py-8">
                            <h3 className="text-2xl font-serif italic text-primary-400 mb-4">Merci !</h3>
                            <p className="text-[11px] uppercase tracking-widest text-[var(--foreground)]/60">
                                Votre formulaire a été soumis avec succès.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            {submitError && (
                                <div className="p-4 border border-red-500/50 bg-red-500/10 text-red-500 text-[10px] uppercase tracking-widest">
                                    {submitError}
                                </div>
                            )}
                            
                            {page.formSchema.map((field: any, index: number) => (
                                <div key={index}>
                                    {field.type !== 'checkbox' && (
                                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">
                                            {field.label} {field.required && <span className="text-primary-400">*</span>}
                                        </label>
                                    )}
                                    
                                    {field.type === 'select' ? (
                                        <select 
                                            required={field.required}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
                                        >
                                            <option value="" disabled>Sélectionnez une option</option>
                                            {field.options?.map((opt: string) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            required={field.required}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px] h-32 resize-none"
                                        />
                                    ) : field.type === 'checkbox' ? (
                                        <div className="flex items-center gap-3 pt-2">
                                            <input
                                                type="checkbox"
                                                required={field.required}
                                                checked={formData[field.name] || false}
                                                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                                                className="w-5 h-5 accent-primary-400 bg-[var(--background)] border-[var(--border)] cursor-pointer"
                                                id={`checkbox-${index}`}
                                            />
                                            <label htmlFor={`checkbox-${index}`} className="text-[11px] text-[var(--foreground)]/80 uppercase tracking-widest font-bold cursor-pointer">
                                                {field.label} {field.required && <span className="text-primary-400">*</span>}
                                            </label>
                                        </div>
                                    ) : (
                                        <input 
                                            type={field.type} // handles 'text', 'email', 'date', 'number', etc.
                                            required={field.required}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-primary-400 text-[11px]"
                                        />
                                    )}
                                </div>
                            ))}

                            <button type="submit" disabled={isSubmitting} className="w-full px-6 py-4 mt-4 bg-primary-400 text-black font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity disabled:opacity-50">
                                {isSubmitting ? 'Envoi en cours...' : 'Soumettre'}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}