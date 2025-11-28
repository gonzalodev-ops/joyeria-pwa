import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCatalogById, getImagesInCatalog } from '../services/database';
import type { CatalogWithItems, ImageRecord } from '../services/database';
import { Loader2, Share2 } from 'lucide-react';

export function CatalogView() {
    const { id } = useParams<{ id: string }>();
    const [catalog, setCatalog] = useState<CatalogWithItems | null>(null);
    const [images, setImages] = useState<ImageRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadCatalog(id);
        }
    }, [id]);

    const loadCatalog = async (catalogId: string) => {
        setLoading(true);
        try {
            const catalogData = await getCatalogById(catalogId);
            const imagesData = await getImagesInCatalog(catalogId);

            setCatalog(catalogData);
            setImages(imagesData);
        } catch (error) {
            console.error('Error loading catalog:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        const shareUrl = window.location.href;
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 size={48} className="text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!catalog) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-zinc-200 mb-2">Catalog Not Found</h1>
                    <p className="text-zinc-500">This catalog doesn't exist or has been removed.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            {/* Header */}
            <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            ← Back to Home
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">{catalog.title}</h1>
                            {catalog.description && (
                                <p className="text-sm text-zinc-500">{catalog.description}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Share2 size={16} />
                        Share
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {images.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-zinc-500">This catalog is empty.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden group hover:border-zinc-700 transition-all"
                            >
                                <div className="relative aspect-square overflow-hidden bg-zinc-950">
                                    <img
                                        src={image.url}
                                        alt={image.title || 'Product'}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-zinc-200 mb-1">{image.title}</h3>
                                    {image.description && (
                                        <p className="text-sm text-zinc-500 line-clamp-2">{image.description}</p>
                                    )}
                                    {image.category && (
                                        <span className="inline-block mt-2 px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400">
                                            {image.category}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-800 mt-20">
                <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-zinc-500">
                    <p>Powered by Jewelry AI Studio</p>
                </div>
            </footer>
        </div>
    );
}
