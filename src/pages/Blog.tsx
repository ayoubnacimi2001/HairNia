import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    createdAt: any;
}

export function Blog() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
                const snap = await getDocs(q);
                setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
            } catch (error) {
                console.error('Error fetching blog posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 text-center text-[10px] uppercase tracking-widest text-[var(--foreground)]/60">
                Loading blog posts...
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-serif italic mb-4">Our Blog</h1>
                <div className="w-10 h-0.5 bg-primary-400 mx-auto mb-6" />
                <p className="text-[11px] uppercase tracking-widest text-[var(--foreground)]/60 max-w-2xl mx-auto">
                    Latest news, announcements, and stories.
                </p>
            </div>

            {posts.length === 0 ? (
                <div className="text-center text-[10px] uppercase tracking-widest text-[var(--foreground)]/60 py-20 border border-[var(--border)] bg-[var(--card)]">
                    No blog posts published yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <article key={post.id} className="bg-[var(--card)] border border-[var(--border)] overflow-hidden flex flex-col group cursor-pointer hover:border-primary-400/50 transition-colors">
                            {post.imageUrl && (
                                <div className="relative h-56 overflow-hidden bg-[var(--background)] border-b border-[var(--border)]">
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                    />
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <h2 className="text-xl font-serif italic mb-3 text-[var(--foreground)] group-hover:text-primary-400 transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-[11px] text-[var(--foreground)]/60 line-clamp-4 flex-1 whitespace-pre-wrap">
                                    {post.content}
                                </p>
                                <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-between items-center">
                                    <span className="text-[9px] uppercase tracking-widest text-[var(--foreground)]/40">
                                        {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}