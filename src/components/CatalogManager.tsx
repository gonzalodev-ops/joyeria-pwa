import { useState, useEffect } from 'react';
import { Plus, Share2, Eye, MoreVertical, Loader2, Trash2, Edit2, Image as ImageIcon } from 'lucide-react';
import { getCatalogs, createCatalog, deleteCatalog, updateCatalog, getImagesInCatalog } from '../services/database';
import type { CatalogWithItems } from '../services/database';

export function CatalogManager() {
    const [catalogs, setCatalogs] = useState<CatalogWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showMenu, setShowMenu] = useState<string | null>(null);

    useEffect(() => {
        loadCatalogs();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowMenu(null);
        if (showMenu) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showMenu]);

    const loadCatalogs = async () => {
        setLoading(true);
        try {
            const data = await getCatalogs();
            setCatalogs(data);
        } catch (error) {
            console.error('Error loading catalogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCatalog = async () => {
        const title = prompt('Título del catálogo:');
        if (!title) return;

        const description = prompt('Descripción del catálogo (opcional):');
        const backgroundColor = prompt('Color de fondo (hex, ej: #ffffff):', '#ffffff');

        setCreating(true);
        try {
            await createCatalog({
                title,
                description: description || undefined,
                status: 'draft',
                background_color: backgroundColor || '#ffffff',
            });

            alert('¡Catálogo creado exitosamente!');
            loadCatalogs();
        } catch (error) {
            console.error('Error creating catalog:', error);
            alert('Error al crear el catálogo. Intenta de nuevo.');
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = async (catalog: CatalogWithItems) => {
        const title = prompt('Nuevo título:', catalog.title);
        if (title === null) return;

        const description = prompt('Nueva descripción:', catalog.description || '');
        const backgroundColor = prompt('Nuevo color de fondo:', catalog.background_color || '#ffffff');

        try {
            await updateCatalog(catalog.id!, {
                title: title || catalog.title,
                description: description || undefined,
                background_color: backgroundColor || '#ffffff'
            });
            loadCatalogs();
        } catch (error) {
            console.error('Error updating catalog:', error);
            alert('Error al actualizar el catálogo.');
        }
    };

    const handleSetCover = async (catalog: CatalogWithItems) => {
        try {
            const images = await getImagesInCatalog(catalog.id!);
            if (images.length === 0) {
                alert('El catálogo no tiene imágenes para usar como portada.');
                return;
            }
            // Use the first image found
            const latestImage = images[0];

            await updateCatalog(catalog.id!, { cover_url: latestImage.url });
            alert('Portada actualizada con la primera imagen del catálogo.');
            loadCatalogs();
        } catch (error) {
            console.error('Error setting cover:', error);
            alert('Error al actualizar la portada.');
        }
    };

    const handleShare = (catalog: CatalogWithItems) => {
        const shareUrl = `${window.location.origin}/catalog/${catalog.id}`;
        navigator.clipboard.writeText(shareUrl);
        alert(`¡Link copiado al portapapeles!\n${shareUrl}`);
    };

    const handlePreview = (catalog: CatalogWithItems) => {
        const previewUrl = `${window.location.origin}/catalog/${catalog.id}`;
        window.open(previewUrl, '_blank');
    };

    const handleDelete = async (catalog: CatalogWithItems) => {
        if (!confirm(`¿Eliminar el catálogo "${catalog.title}"?`)) {
            return;
        }

        try {
            await deleteCatalog(catalog.id!);
            setCatalogs(catalogs.filter(c => c.id !== catalog.id));
            alert('Catálogo eliminado correctamente');
        } catch (error) {
            console.error('Error deleting catalog:', error);
            alert('Error al eliminar el catálogo');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-200">Mis Catálogos</h2>
                    <p className="text-sm text-zinc-500 mt-1">Gestiona y comparte tus catálogos digitales</p>
                </div>
                <button
                    onClick={handleCreateCatalog}
                    disabled={creating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                    {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    Nuevo Catálogo
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-zinc-500">Cargando catálogos...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catalogs.map(catalog => (
                        <div key={catalog.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl group hover:border-zinc-700 transition-all flex flex-col relative">
                            {/* Image Container - Rounded Top only */}
                            <div className="relative h-48 overflow-hidden rounded-t-2xl" style={{ backgroundColor: catalog.background_color || '#ffffff' }}>
                                {catalog.cover_url ? (
                                    <img
                                        src={catalog.cover_url}
                                        alt={catalog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                        <div className="text-center">
                                            <Plus size={48} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">Sin imagen de portada</p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-medium text-white capitalize">
                                    {catalog.status === 'draft' ? 'Borrador' : 'Publicado'}
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4 relative">
                                    <div className="flex-1 pr-8">
                                        <h3 className="font-semibold text-zinc-200 text-lg line-clamp-1" title={catalog.title}>{catalog.title}</h3>
                                        <p className="text-sm text-zinc-500">{catalog.itemCount || 0} artículos</p>
                                    </div>

                                    {/* Menu Button - Positioned absolutely but outside overflow hidden */}
                                    <div className="absolute right-0 top-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(showMenu === catalog.id ? null : catalog.id!);
                                            }}
                                            className="text-zinc-500 hover:text-zinc-300 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {showMenu === catalog.id && (
                                            <div className="absolute right-0 top-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[200px]">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handlePreview(catalog); }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-3 text-zinc-300 hover:text-white"
                                                >
                                                    <Eye size={16} />
                                                    Vista Previa
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(catalog); }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-3 text-zinc-300 hover:text-white"
                                                >
                                                    <Edit2 size={16} />
                                                    Editar Datos
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSetCover(catalog); }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-3 text-zinc-300 hover:text-white"
                                                >
                                                    <ImageIcon size={16} />
                                                    Usar 1ª imagen como portada
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleShare(catalog); }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-3 text-zinc-300 hover:text-white"
                                                >
                                                    <Share2 size={16} />
                                                    Compartir
                                                </button>
                                                <div className="h-px bg-zinc-800 my-1" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(catalog); }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-red-900/20 text-red-400 hover:text-red-300 transition-colors flex items-center gap-3"
                                                >
                                                    <Trash2 size={16} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800 mt-auto">
                                    <button
                                        onClick={() => handlePreview(catalog)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Eye size={16} />
                                        Vista Previa
                                    </button>
                                    <button
                                        onClick={() => handleShare(catalog)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Share2 size={16} />
                                        Compartir
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleCreateCatalog}
                        disabled={creating}
                        className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-zinc-800 rounded-2xl hover:border-zinc-700 hover:bg-zinc-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all group cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                            {creating ? (
                                <Loader2 size={32} className="text-zinc-500 animate-spin" />
                            ) : (
                                <Plus size={32} className="text-zinc-500 group-hover:text-zinc-300" />
                            )}
                        </div>
                        <span className="font-medium text-zinc-400 group-hover:text-zinc-200 text-lg">Crear Nuevo Catálogo</span>
                    </button>
                </div>
            )}
        </div>
    );
}
