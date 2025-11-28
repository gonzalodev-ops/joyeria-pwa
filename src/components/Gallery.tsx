import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Trash2, ArrowUpDown, Edit2, CheckSquare, Square, X, FolderPlus } from 'lucide-react';
import { getImages, deleteImage, updateImage, getCatalogs, addImageToCatalog } from '../services/database';
import type { ImageRecord } from '../services/database';
import { ImageEditModal } from './ImageEditModal';
import { useToast } from '../contexts/ToastContext';

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
    const [material, setMaterial] = useState('Todos');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [availableMaterials, setAvailableMaterials] = useState<string[]>([]);
    const [editingImage, setEditingImage] = useState<ImageRecord | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const { showToast } = useToast();

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

            // Extract unique materials
            const materials = Array.from(new Set(images.map(img => img.metadata?.material || img.material))).filter(Boolean).sort();
            setAvailableMaterials(materials as string[]);

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
            showToast('Imagen eliminada correctamente', 'success');
        } catch (error) {
            console.error('Error deleting image:', error);
            showToast('Error al eliminar la imagen', 'error');
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

                // Update categories and materials if needed
                const categories = Array.from(new Set(items.map(img => img.category))).filter(Boolean).sort();
                setAvailableCategories(categories);

                // Re-extract materials might be complex here without full reload, but let's try
                // For now, reload images to be safe or just keep current list
                // Ideally we should update availableMaterials too
            }

            setEditingImage(null);
            showToast('Imagen actualizada correctamente', 'success');
        } catch (error) {
            console.error('Error updating image:', error);
            showToast('Error al actualizar la imagen', 'error');
        }
    };

    // Selection Logic
    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedItems(newSelection);
    };

    const selectAll = () => {
        const allIds = filteredItems.map(item => item.id);
        setSelectedItems(new Set(allIds));
    };

    const deselectAll = () => {
        setSelectedItems(new Set());
    };

    const handleBulkDelete = async () => {
        if (selectedItems.size === 0) return;
        if (!confirm(`¿Estás seguro de eliminar ${selectedItems.size} imágenes?`)) return;

        try {
            const promises = Array.from(selectedItems).map(id => deleteImage(id));
            await Promise.all(promises);

            setItems(items.filter(item => !selectedItems.has(item.id)));
            setSelectedItems(new Set());
            showToast(`${selectedItems.size} imágenes eliminadas correctamente`, 'success');
        } catch (error) {
            console.error('Error deleting images:', error);
            showToast('Error al eliminar las imágenes', 'error');
        }
    };

    const handleBulkAddToCatalog = async () => {
        if (selectedItems.size === 0) return;

        try {
            const catalogs = await getCatalogs();
            if (catalogs.length === 0) {
                showToast('No hay catálogos disponibles. Crea uno primero.', 'warning');
                return;
            }

            const catalogList = catalogs.map((c, i) => `${i + 1}. ${c.title}`).join('\n');
            const selection = prompt(`Selecciona el catálogo:\n${catalogList}\n\nIngresa el número:`, '1');

            if (!selection) return;

            const catalogIndex = parseInt(selection) - 1;
            if (catalogIndex < 0 || catalogIndex >= catalogs.length) {
                showToast('Selección inválida', 'error');
                return;
            }

            const selectedCatalog = catalogs[catalogIndex];
            const promises = Array.from(selectedItems).map(imageId =>
                addImageToCatalog(selectedCatalog.id!, imageId)
            );

            await Promise.all(promises);

            setSelectedItems(new Set());
            showToast(`${selectedItems.size} imágenes agregadas a "${selectedCatalog.title}"`, 'success');
        } catch (error) {
            console.error('Error adding to catalog:', error);
            showToast('Error al agregar al catálogo', 'error');
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'Todas' || item.category === category;
        const itemMaterial = item.fullRecord?.metadata?.material || item.fullRecord?.material;
        const matchesMaterial = material === 'Todos' || itemMaterial === material;
        return matchesSearch && matchesCategory && matchesMaterial;
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

                {/* Material Filter */}
                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <Filter size={16} className="text-zinc-500" />
                    <select
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        className="bg-transparent text-sm focus:outline-none cursor-pointer"
                    >
                        <option value="Todos">Todos los Materiales</option>
                        {availableMaterials.map(mat => (
                            <option key={mat} value={mat}>{mat}</option>
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

                {/* View Toggle & Selection */}
                <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1 gap-1">
                    <button
                        onClick={() => setView('grid')}
                        className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="Vista Cuadrícula"
                    >
                        <Grid size={16} />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="Vista Lista"
                    >
                        <List size={16} />
                    </button>
                    <div className="w-px h-4 bg-zinc-800 mx-1" />
                    <button
                        onClick={selectedItems.size === filteredItems.length ? deselectAll : selectAll}
                        className={`p-1.5 rounded-lg transition-colors ${selectedItems.size > 0 ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title={selectedItems.size === filteredItems.length ? "Deseleccionar Todo" : "Seleccionar Todo"}
                    >
                        {selectedItems.size === filteredItems.length && filteredItems.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
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
                <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20' : 'space-y-4 pb-20'}>
                    {sortedItems.map(item => (
                        <div
                            key={item.id}
                            className={`
                                group bg-zinc-900/50 border rounded-2xl overflow-hidden transition-all relative
                                ${selectedItems.has(item.id) ? 'border-blue-500/50 ring-1 ring-blue-500/50' : 'border-zinc-800 hover:border-zinc-600'}
                                ${view === 'list' ? 'flex gap-4 p-4' : ''}
                            `}
                            onClick={() => toggleSelection(item.id)}
                        >
                            {/* Selection Checkbox */}
                            <div className="absolute top-3 left-3 z-20">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                                    className={`
                                        w-6 h-6 rounded-lg flex items-center justify-center transition-all
                                        ${selectedItems.has(item.id) ? 'bg-blue-600 text-white' : 'bg-black/40 backdrop-blur-sm text-transparent hover:bg-black/60 border border-white/20'}
                                    `}
                                >
                                    <CheckSquare size={14} />
                                </button>
                            </div>

                            <div className={`relative overflow-hidden ${view === 'list' ? 'w-24 h-24 rounded-xl flex-shrink-0' : 'aspect-square'}`}>
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
                                    <div className="w-full flex gap-2 pointer-events-auto">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                            className="flex-1 py-2 bg-blue-600/80 backdrop-blur-md hover:bg-blue-600 rounded-lg text-xs font-medium text-white transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Edit2 size={12} />
                                            Editar
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.title); }}
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

            {/* Bulk Actions Bar */}
            {selectedItems.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="flex items-center gap-3 border-r border-zinc-700 pr-6">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">{selectedItems.size}</span>
                        <span className="text-sm font-medium text-zinc-200">Seleccionados</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBulkAddToCatalog}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-200 transition-colors"
                        >
                            <FolderPlus size={16} />
                            Agregar a Catálogo
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-red-900/20 rounded-lg text-sm font-medium text-red-400 transition-colors"
                        >
                            <Trash2 size={16} />
                            Eliminar
                        </button>
                    </div>

                    <button
                        onClick={deselectAll}
                        className="ml-2 p-1 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <X size={18} />
                    </button>
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
