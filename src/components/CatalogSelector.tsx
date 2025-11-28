import { useState, useEffect } from 'react';
import { getCatalogs, createCatalog } from '../services/database';
import type { CatalogWithItems } from '../services/database';
import { Button, Input, MaterialIcon } from './ui';

interface CatalogSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (catalogId: string) => void;
}

export function CatalogSelector({ isOpen, onClose, onSelect }: CatalogSelectorProps) {
    const [catalogs, setCatalogs] = useState<CatalogWithItems[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newCatalogName, setNewCatalogName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadCatalogs();
        }
    }, [isOpen]);

    const loadCatalogs = async () => {
        setIsLoading(true);
        try {
            const data = await getCatalogs();
            setCatalogs(data);
        } catch (error) {
            console.error('Error loading catalogs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCatalog = async () => {
        if (!newCatalogName.trim()) return;

        setIsLoading(true);
        try {
            const newCatalog = await createCatalog({
                title: newCatalogName,
                status: 'draft',
            });

            if (newCatalog?.id) {
                onSelect(newCatalog.id);
                setNewCatalogName('');
                setIsCreating(false);
            }
        } catch (error) {
            console.error('Error creating catalog:', error);
            alert('Failed to create catalog');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-bronze-canvas-background border border-bronze-canvas-border rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-bronze-canvas-border bg-bronze-canvas-background rounded-t-2xl">
                    <h2 className="text-xl font-bold text-bronze-canvas-primary-text">Seleccionar Catálogo</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-bronze-canvas-component-bg rounded-lg transition-colors text-bronze-canvas-secondary-text"
                    >
                        <MaterialIcon icon="close" size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-bronze-canvas-background">
                    {isLoading && catalogs.length === 0 ? (
                        <div className="text-center text-bronze-canvas-secondary-text py-8">Cargando...</div>
                    ) : catalogs.length === 0 && !isCreating ? (
                        <div className="text-center text-bronze-canvas-secondary-text py-8">
                            <p>No hay catálogos aún</p>
                            <p className="text-sm mt-2">Crea tu primer catálogo abajo</p>
                        </div>
                    ) : (
                        catalogs.map((catalog) => (
                            <button
                                key={catalog.id}
                                onClick={() => onSelect(catalog.id!)}
                                className="w-full flex items-center gap-3 p-4 bg-bronze-canvas-component-bg hover:bg-white border border-transparent hover:border-bronze-canvas-accent rounded-xl transition-all text-left group shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-lg bg-bronze-canvas-accent/10 flex items-center justify-center text-bronze-canvas-accent group-hover:bg-bronze-canvas-accent group-hover:text-white transition-colors">
                                    <MaterialIcon icon="folder" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-bronze-canvas-primary-text">{catalog.title}</h3>
                                    <p className="text-xs text-bronze-canvas-secondary-text">
                                        {catalog.itemCount || 0} items • {catalog.status === 'draft' ? 'Borrador' : 'Publicado'}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}

                    {isCreating && (
                        <div className="p-4 bg-bronze-canvas-component-bg rounded-xl space-y-3 border border-bronze-canvas-accent animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <Input
                                value={newCatalogName}
                                onChange={(e) => setNewCatalogName(e.target.value)}
                                placeholder="Nombre del catálogo..."
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateCatalog();
                                    if (e.key === 'Escape') setIsCreating(false);
                                }}
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCreateCatalog}
                                    disabled={!newCatalogName.trim() || isLoading}
                                    loading={isLoading}
                                    fullWidth
                                    size="sm"
                                >
                                    Crear
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNewCatalogName('');
                                    }}
                                    variant="secondary"
                                    fullWidth
                                    size="sm"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-bronze-canvas-border bg-bronze-canvas-background rounded-b-2xl">
                    <Button
                        onClick={() => setIsCreating(true)}
                        disabled={isCreating}
                        fullWidth
                        variant="secondary"
                        icon="add"
                    >
                        Nuevo Catálogo
                    </Button>
                </div>
            </div>
        </div>
    );
}
