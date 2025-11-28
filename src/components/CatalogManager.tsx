import { useState, useEffect } from 'react';
import { getCatalogs, createCatalog, deleteCatalog, updateCatalog, getImagesInCatalog } from '../services/database';
import type { CatalogWithItems } from '../services/database';
import { useToast } from '../contexts/ToastContext';
import { CatalogSortModal } from './CatalogSortModal';
import { Button, MaterialIcon } from './ui';

export function CatalogManager() {
    const [catalogs, setCatalogs] = useState<CatalogWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showMenu, setShowMenu] = useState<string | null>(null);
    const [sortCatalog, setSortCatalog] = useState<CatalogWithItems | null>(null);
    const { showToast } = useToast();

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

            showToast('¡Catálogo creado exitosamente!', 'success');
            loadCatalogs();
        } catch (error) {
            console.error('Error creating catalog:', error);
            showToast('Error al crear el catálogo. Intenta de nuevo.', 'error');
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
            showToast('Catálogo actualizado correctamente', 'success');
        } catch (error) {
            console.error('Error updating catalog:', error);
            showToast('Error al actualizar el catálogo.', 'error');
        }
    };

    const handleSetCover = async (catalog: CatalogWithItems) => {
        try {
            const images = await getImagesInCatalog(catalog.id!);
            if (images.length === 0) {
                showToast('El catálogo no tiene imágenes para usar como portada.', 'warning');
                return;
            }
            // Use the first image found
            const latestImage = images[0];

            await updateCatalog(catalog.id!, { cover_url: latestImage.url });
            showToast('Portada actualizada con la primera imagen del catálogo.', 'success');
            loadCatalogs();
        } catch (error) {
            console.error('Error setting cover:', error);
            showToast('Error al actualizar la portada.', 'error');
        }
    };

    const handleShare = (catalog: CatalogWithItems) => {
        const shareUrl = `${window.location.origin}/catalog/${catalog.id}`;
        navigator.clipboard.writeText(shareUrl);
        showToast('Link copiado al portapapeles', 'success');
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
            showToast('Catálogo eliminado correctamente', 'success');
        } catch (error) {
            console.error('Error deleting catalog:', error);
            showToast('Error al eliminar el catálogo', 'error');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            <div className="flex justify-between items-center bg-bronze-canvas-component-bg p-6 rounded-2xl border border-bronze-canvas-border">
                <div>
                    <h2 className="text-xl font-bold text-bronze-canvas-primary-text">Mis Catálogos</h2>
                    <p className="text-sm text-bronze-canvas-secondary-text mt-1">Gestiona y comparte tus catálogos digitales</p>
                </div>
                <Button
                    onClick={handleCreateCatalog}
                    loading={creating}
                    icon="add"
                >
                    Nuevo Catálogo
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <MaterialIcon icon="progress_activity" className="animate-spin text-bronze-canvas-accent" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catalogs.map(catalog => (
                        <div key={catalog.id} className="bg-bronze-canvas-component-bg border border-bronze-canvas-border rounded-2xl group hover:border-bronze-canvas-accent transition-all flex flex-col relative overflow-hidden">
                            {/* Image Container */}
                            <div className="relative h-48 overflow-hidden bg-white" style={{ backgroundColor: catalog.background_color || '#ffffff' }}>
                                {catalog.cover_url ? (
                                    <img
                                        src={catalog.cover_url}
                                        alt={catalog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-bronze-canvas-border">
                                        <div className="text-center">
                                            <MaterialIcon icon="image_not_supported" size={48} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm font-medium">Sin portada</p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 px-2 py-1 bg-white/80 backdrop-blur-md rounded-lg text-xs font-bold text-bronze-canvas-primary-text capitalize shadow-sm">
                                    {catalog.status === 'draft' ? 'Borrador' : 'Publicado'}
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4 relative">
                                    <div className="flex-1 pr-8">
                                        <h3 className="font-bold text-bronze-canvas-primary-text text-lg line-clamp-1" title={catalog.title}>{catalog.title}</h3>
                                        <p className="text-sm text-bronze-canvas-secondary-text">{catalog.itemCount || 0} artículos</p>
                                    </div>

                                    {/* Menu Button */}
                                    <div className="absolute right-0 top-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(showMenu === catalog.id ? null : catalog.id!);
                                            }}
                                            className="text-bronze-canvas-secondary-text hover:text-bronze-canvas-primary-text p-2 hover:bg-bronze-canvas-background rounded-full transition-colors"
                                        >
                                            <MaterialIcon icon="more_vert" size={20} />
                                        </button>

                                        {showMenu === catalog.id && (
                                            <div className="absolute right-0 top-full mt-2 bg-white border border-bronze-canvas-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[220px]">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handlePreview(catalog); }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-bronze-canvas-background transition-colors flex items-center gap-3 text-bronze-canvas-primary-text"
                                                >
                                                    <MaterialIcon icon="visibility" size={18} />
                                                    Vista Previa
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSortCatalog(catalog); setShowMenu(null); }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-bronze-canvas-background transition-colors flex items-center gap-3 text-bronze-canvas-primary-text"
                                                >
                                                    <MaterialIcon icon="sort" size={18} />
                                                    Ordenar Items
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(catalog); }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-bronze-canvas-background transition-colors flex items-center gap-3 text-bronze-canvas-primary-text"
                                                >
                                                    <MaterialIcon icon="edit" size={18} />
                                                    Editar Datos
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSetCover(catalog); }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-bronze-canvas-background transition-colors flex items-center gap-3 text-bronze-canvas-primary-text"
                                                >
                                                    <MaterialIcon icon="image" size={18} />
                                                    Usar 1ª imagen como portada
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleShare(catalog); }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-bronze-canvas-background transition-colors flex items-center gap-3 text-bronze-canvas-primary-text"
                                                >
                                                    <MaterialIcon icon="share" size={18} />
                                                    Compartir
                                                </button>
                                                <div className="h-px bg-bronze-canvas-border my-1" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(catalog); }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors flex items-center gap-3"
                                                >
                                                    <MaterialIcon icon="delete" size={18} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-bronze-canvas-border mt-auto">
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        size="sm"
                                        onClick={() => handlePreview(catalog)}
                                        icon="visibility"
                                    >
                                        Ver
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        size="sm"
                                        onClick={() => handleShare(catalog)}
                                        icon="share"
                                    >
                                        Compartir
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleCreateCatalog}
                        disabled={creating}
                        className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-bronze-canvas-border rounded-2xl hover:border-bronze-canvas-accent hover:bg-bronze-canvas-component-bg/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all group cursor-pointer bg-bronze-canvas-background"
                    >
                        <div className="w-16 h-16 rounded-full bg-bronze-canvas-component-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                            {creating ? (
                                <MaterialIcon icon="progress_activity" size={32} className="text-bronze-canvas-accent animate-spin" />
                            ) : (
                                <MaterialIcon icon="add" size={32} className="text-bronze-canvas-secondary-text group-hover:text-bronze-canvas-accent" />
                            )}
                        </div>
                        <span className="font-bold text-bronze-canvas-secondary-text group-hover:text-bronze-canvas-primary-text text-lg transition-colors">Crear Nuevo Catálogo</span>
                    </button>
                </div>
            )}

            {sortCatalog && (
                <CatalogSortModal
                    catalogId={sortCatalog.id!}
                    catalogTitle={sortCatalog.title}
                    onClose={() => setSortCatalog(null)}
                />
            )}
        </div>
    );
}
