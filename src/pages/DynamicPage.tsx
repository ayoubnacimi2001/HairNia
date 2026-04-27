import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function DynamicPage() {
    const { slug } = useParams();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[10px] uppercase tracking-widest">Loading...</div>;
    if (!page) return <div className="min-h-screen flex items-center justify-center text-xl font-serif italic text-red-500">Page not found.</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-500">
            <h1 className="text-4xl font-serif italic mb-10">{page.title}</h1>
            <div className="prose dark:prose-invert max-w-none text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
    );
}