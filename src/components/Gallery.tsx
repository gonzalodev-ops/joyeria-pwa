import { useState, useEffect } from 'react';
import { getImages, deleteImage, updateImage, getCatalogs, addImageToCatalog } from '../services/database';
import type { ImageRecord } from '../services/database';
import { ImageEditModal } from './ImageEditModal';
import { useToast } from '../contexts/ToastContext';
import { Button, Input, Select, MaterialIcon } from './ui';

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

                const categories = Array.from(new Set(items.map(img => img.category))).filter(Boolean).sort();
                setAvailableCategories(categories);
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
        <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            {/* Search Bar */}
            <div className="relative">
                <Input
                    placeholder="Buscar por nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
                <MaterialIcon
                    icon="search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-bronze-canvas-secondary-text pointer-events-none"
                    size={20}
                />
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col md:flex-row gap-3 w-full">
                <div className="grid grid-cols-2 md:flex gap-3 flex-1">
                    <Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        options={[
                            { value: 'Todas', label: 'Todas las Categorías' },
                            ...availableCategories.map(cat => ({ value: cat, label: cat }))
                        ]}
                    />

                    <Select
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        options={[
                            { value: 'Todos', label: 'Todos los Materiales' },
                            ...availableMaterials.map(mat => ({ value: mat, label: mat }))
                        ]}
                    />
                </div>

                <div className="flex gap-3">
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        options={[
                            { value: 'newest', label: 'Más Recientes' },
                            { value: 'oldest', label: 'Más Antiguos' },
                            { value: 'name-asc', label: 'Nombre (A-Z)' },
                            { value: 'name-desc', label: 'Nombre (Z-A)' },
                        ]}
                        className="w-full md:w-40"
                    />

                    <div className="flex bg-bronze-canvas-component-bg border border-bronze-canvas-border rounded-xl p-1 gap-1 shrink-0">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-bronze-canvas-accent text-white' : 'text-bronze-canvas-secondary-text hover:bg-bronze-canvas-background'}`}
                        >
                            <MaterialIcon icon="grid_view" size={20} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-bronze-canvas-accent text-white' : 'text-bronze-canvas-secondary-text hover:bg-bronze-canvas-background'}`}
                        >
                            <MaterialIcon icon="view_list" size={20} />
                        </button>
                        <div className="w-px h-6 bg-bronze-canvas-border mx-1 self-center" />
                        <button
                            onClick={selectedItems.size === filteredItems.length ? deselectAll : selectAll}
                            className={`p-2 rounded-lg transition-colors ${selectedItems.size > 0 ? 'text-bronze-canvas-accent bg-bronze-canvas-accent/10' : 'text-bronze-canvas-secondary-text hover:bg-bronze-canvas-background'}`}
                        >
                            <MaterialIcon icon={selectedItems.size === filteredItems.length && filteredItems.length > 0 ? "check_box" : "check_box_outline_blank"} size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Gallery Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <MaterialIcon icon="progress_activity" className="animate-spin text-bronze-canvas-accent" size={32} />
                </div>
            ) : sortedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-bronze-canvas-secondary-text">
                    <MaterialIcon icon="image_not_supported" size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium">No se encontraron imágenes</p>
                    <p className="text-sm mt-2">Intenta ajustar tu búsqueda o filtros</p>
                </div>
            ) : (
                <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}>
                    {sortedItems.map(item => (
                        <div
                            key={item.id}
                            className={`
                                group bg-bronze-canvas-component-bg border rounded-xl overflow-hidden transition-all relative cursor-pointer
                                ${selectedItems.has(item.id) ? 'border-bronze-canvas-accent ring-1 ring-bronze-canvas-accent' : 'border-bronze-canvas-border hover:border-bronze-canvas-accent'}
                                ${view === 'list' ? 'flex gap-4 p-3' : ''}
                            `}
                            onClick={() => toggleSelection(item.id)}
                        >
                            {/* Selection Checkbox */}
                            <div className="absolute top-2 left-2 z-20">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm
                                        ${selectedItems.has(item.id) ? 'bg-bronze-canvas-accent text-white' : 'bg-white/80 backdrop-blur-sm text-bronze-canvas-secondary-text hover:bg-white'}
                                    `}
                                >
                                    <MaterialIcon icon={selectedItems.has(item.id) ? "check" : "check_box_outline_blank"} size={18} />
                                </button>
                            </div>

                            <div className={`relative overflow-hidden ${view === 'list' ? 'w-20 h-20 rounded-lg flex-shrink-0' : 'aspect-square'}`}>
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                        className="!rounded-full w-10 h-10 !p-0 bg-white/90 hover:bg-white"
                                    >
                                        <MaterialIcon icon="edit" size={18} />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.title); }}
                                        className="!rounded-full w-10 h-10 !p-0 bg-white/90 hover:bg-red-50 text-red-500"
                                    >
                                        <MaterialIcon icon="delete" size={18} />
                                    </Button>
                                </div>
                            </div>

                            <div className={view === 'list' ? 'flex-1 flex flex-col justify-center' : 'p-3'}>
                                <h3 className="font-bold text-bronze-canvas-primary-text line-clamp-1 text-sm">{item.title}</h3>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-bronze-canvas-secondary-text bg-bronze-canvas-background px-2 py-0.5 rounded-full border border-bronze-canvas-border">
                                        {item.category}
                                    </span>
                                    <span className="text-[10px] text-bronze-canvas-secondary-text">{item.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedItems.size > 0 && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-bronze-canvas-primary-text text-white shadow-xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 w-[90%] max-w-md justify-between">
                    <div className="flex items-center gap-3">
                        <span className="bg-white text-bronze-canvas-primary-text text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                            {selectedItems.size}
                        </span>
                        <span className="text-sm font-medium">Seleccionados</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBulkAddToCatalog}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            title="Agregar a Catálogo"
                        >
                            <MaterialIcon icon="playlist_add" size={24} />
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="p-2 hover:bg-red-500/20 text-red-300 hover:text-red-200 rounded-full transition-colors"
                            title="Eliminar"
                        >
                            <MaterialIcon icon="delete" size={24} />
                        </button>
                        <div className="w-px h-6 bg-white/20 mx-1" />
                        <button
                            onClick={deselectAll}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            title="Cancelar"
                        >
                            <MaterialIcon icon="close" size={24} />
                        </button>
                    </div>
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
