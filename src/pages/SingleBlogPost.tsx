import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft } from 'lucide-react';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    createdAt: any;
}

export function SingleBlogPost() {
    // This grabs the ID directly from the URL!
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'blogs', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPost({ id: docSnap.id, ...docSnap.data() } as BlogPost);
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-32 text-center text-[10px] uppercase tracking-widest text-[var(--foreground)]/60">
                Loading article...
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-32 text-center">
                <h1 className="text-3xl font-serif italic mb-4">Article Not Found</h1>
                <button onClick={() => navigate('/blog')} className="text-primary-400 text-[10px] uppercase tracking-widest hover:underline">
                    Return to Blog
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-500">
            <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--foreground)]/60 hover:text-primary-400 transition-colors mb-12">
                <ArrowLeft className="w-4 h-4" /> Back to all articles
            </Link>

            <article>
                {post.imageUrl && (
                    <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-[300px] md:h-[500px] object-cover mix-blend-luminosity opacity-90 mb-12 border border-[var(--border)]" 
                    />
                )}
                
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-serif italic mb-6 leading-tight text-[var(--foreground)]">
                        {post.title}
                    </h1>
                    <div className="w-10 h-0.5 bg-primary-400 mx-auto mb-6" />
                    <span className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40">
                        {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </span>
                </div>

                <div className="prose prose-invert max-w-none">
                    <p className="text-[var(--foreground)]/80 leading-loose text-sm md:text-base whitespace-pre-wrap">
                        {post.content}
                    </p>
                </div>
            </article>
        </div>
    );
}