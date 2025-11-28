import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Trash2, ArrowUpDown, Edit2 } from 'lucide-react';
import { getImages, deleteImage, updateImage } from '../services/database';
import type { ImageRecord } from '../services/database';
import { ImageEditModal } from './ImageEditModal';

interface GalleryItem {
    id: string;
    url: string;
    title: string;
    category: string;
    date: string;
    fullRecord?: ImageRecord;
}

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

export function Gallery() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Todas');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [editingImage, setEditingImage] = useState<ImageRecord | null>(null);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        setLoading(true);
        try {
            const images = await getImages();

            // Extract unique categories
            const categories = Array.from(new Set(images.map(img => img.category))).filter(Boolean).sort();
            setAvailableCategories(categories);

            const galleryItems: GalleryItem[] = images.map((img: ImageRecord) => ({
                id: img.id!,
                url: img.url,
                title: img.title,
                category: img.category,
                date: img.created_at ? new Date(img.created_at).toISOString().split('T')[0] : '',
                fullRecord: img,
            }));
            setItems(galleryItems);
        } catch (error) {
            console.error('Error loading images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`¿Estás seguro de eliminar "${title}"?`)) return;

        try {
            await deleteImage(id);
            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Error al eliminar la imagen');
        }
    };

    const handleEdit = (item: GalleryItem) => {
        if (item.fullRecord) {
            setEditingImage(item.fullRecord);
        }
    };

    const handleSaveEdit = async (updates: Partial<ImageRecord>) => {
        if (!editingImage?.id) return;

        try {
            const updatedImage = await updateImage(editingImage.id, updates);

            if (updatedImage) {
                // Update local state
                setItems(items.map(item =>
                    item.id === updatedImage.id
                        ? {
                            ...item,
                            title: updatedImage.title,
                            category: updatedImage.category,
                            fullRecord: updatedImage,
                        }
                        : item
                ));

                // Update categories if needed
                const categories = Array.from(new Set(items.map(img => img.category))).filter(Boolean).sort();
                setAvailableCategories(categories);
            }

            setEditingImage(null);
        } catch (error) {
            console.error('Error updating image:', error);
            alert('Error al actualizar la imagen');
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'Todas' || item.category === category;
        return matchesSearch && matchesCategory;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            case 'oldest':
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            case 'name-asc':
                return a.title.localeCompare(b.title);
            case 'name-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Search Bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <Search size={18} className="text-zinc-500" />
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-sm"
                />
            </div>

            {/* Filters and Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                {/* Category Filter */}
                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <Filter size={16} className="text-zinc-500" />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-transparent text-sm focus:outline-none cursor-pointer"
                    >
                        <option value="Todas">Todas las Categorías</option>
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <ArrowUpDown size={16} className="text-zinc-500" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="bg-transparent text-sm focus:outline-none cursor-pointer"
                    >
                        <option value="newest">Más Recientes</option>
                        <option value="oldest">Más Antiguos</option>
                        <option value="name-asc">Nombre (A-Z)</option>
                        <option value="name-desc">Nombre (Z-A)</option>
                    </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                    <button
                        onClick={() => setView('grid')}
                        className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Grid size={16} />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Gallery Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-zinc-500">Cargando imágenes...</div>
                </div>
            ) : sortedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                    <p className="text-lg">No se encontraron imágenes</p>
                    <p className="text-sm mt-2">Intenta ajustar tu búsqueda o filtros</p>
                </div>
            ) : (
                <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
                    {sortedItems.map(item => (
                        <div key={item.id} className={`group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all ${view === 'list' ? 'flex gap-4 p-4' : ''}`}>
                            <div className={`relative overflow-hidden ${view === 'list' ? 'w-24 h-24 rounded-xl flex-shrink-0' : 'aspect-square'}`}>
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <div className="w-full flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="flex-1 py-2 bg-blue-600/80 backdrop-blur-md hover:bg-blue-600 rounded-lg text-xs font-medium text-white transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Edit2 size={12} />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, item.title)}
                                            className="flex-1 py-2 bg-red-600/80 backdrop-blur-md hover:bg-red-600 rounded-lg text-xs font-medium text-white transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Trash2 size={12} />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={view === 'list' ? 'flex-1 flex flex-col justify-center' : 'p-4'}>
                                <h3 className="font-medium text-zinc-200 line-clamp-1">{item.title}</h3>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-zinc-500">{item.category}</span>
                                    <span className="text-xs text-zinc-600">{item.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingImage && (
                <ImageEditModal
                    image={editingImage}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingImage(null)}
                />
            )}
        </div>
    );
}
