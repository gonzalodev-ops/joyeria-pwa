import { useState, useEffect } from 'react';
import type { JewelryMetadata } from '../services/gemini';
import type { CloudinaryEnhancement } from '../services/cloudinary';
import { applyTransformationsToUrl } from '../services/cloudinary';
import { getCatalogs } from '../services/database';
import type { CatalogWithItems } from '../services/database';
import { Button, Input, Select, Textarea, MaterialIcon } from './ui';

interface SaveModalProps {
    metadata: JewelryMetadata;
    previewUrl: string;
    onSave: (metadata: JewelryMetadata, enhancements: CloudinaryEnhancement, destination: 'gallery' | 'catalog', catalogId?: string) => void;
    onCancel: () => void;
}

export function SaveModal({ metadata, previewUrl, onSave, onCancel }: SaveModalProps) {
    // Metadata state
    const [editedMetadata, setEditedMetadata] = useState<JewelryMetadata>(metadata);
    const [newKeyword, setNewKeyword] = useState('');

    // Enhancement state
    const [enhancements, setEnhancements] = useState<CloudinaryEnhancement>(
        metadata.cloudinary_enhancements || { brightness: 0, contrast: 0, saturation: 0, auto_enhance: false }
    );
    const [enhancedPreviewUrl, setEnhancedPreviewUrl] = useState<string>(previewUrl);

    // Destination state
    const [destination, setDestination] = useState<'gallery' | 'catalog'>('gallery');
    const [catalogs, setCatalogs] = useState<CatalogWithItems[]>([]);
    const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');
    const [loadingCatalogs, setLoadingCatalogs] = useState(false);

    // Load catalogs when destination is catalog
    useEffect(() => {
        if (destination === 'catalog') {
            loadCatalogs();
        }
    }, [destination]);

    // Update preview when enhancements change
    useEffect(() => {
        const url = applyTransformationsToUrl(previewUrl, enhancements);
        setEnhancedPreviewUrl(url);
    }, [previewUrl, enhancements]);

    const loadCatalogs = async () => {
        setLoadingCatalogs(true);
        try {
            const catalogList = await getCatalogs();
            setCatalogs(catalogList);
            if (catalogList.length > 0 && !selectedCatalogId) {
                setSelectedCatalogId(catalogList[0].id || '');
            }
        } catch (error) {
            console.error('Error loading catalogs:', error);
        } finally {
            setLoadingCatalogs(false);
        }
    };

    const handleAddKeyword = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newKeyword.trim()) {
            setEditedMetadata(prev => ({
                ...prev,
                keywords: [...prev.keywords, newKeyword.trim()]
            }));
            setNewKeyword('');
        }
    };

    const removeKeyword = (index: number) => {
        setEditedMetadata(prev => ({
            ...prev,
            keywords: prev.keywords.filter((_, i) => i !== index)
        }));
    };

    const handleReset = () => {
        setEnhancements(metadata.cloudinary_enhancements || { brightness: 0, contrast: 0, saturation: 0, auto_enhance: false });
    };

    const handleSave = () => {
        onSave(editedMetadata, enhancements, destination, destination === 'catalog' ? selectedCatalogId : undefined);
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4 overflow-y-auto z-[99998]"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div className="bg-bronze-canvas-background border border-bronze-canvas-border rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300 my-4">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-bronze-canvas-border flex justify-between items-center bg-bronze-canvas-background flex-shrink-0">
                    <div>
                        <h3 className="text-lg md:text-xl font-bold text-bronze-canvas-primary-text flex items-center gap-2">
                            <MaterialIcon icon="save" className="text-bronze-canvas-accent" size={24} />
                            Guardar Imagen
                        </h3>
                        <p className="text-xs md:text-sm text-bronze-canvas-secondary-text mt-1">Revisa metadata, ajusta mejoras y elige destino</p>
                    </div>
                    <button onClick={onCancel} className="text-bronze-canvas-secondary-text hover:text-bronze-canvas-primary-text transition-colors">
                        <MaterialIcon icon="close" size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-bronze-canvas-background">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: Preview & Enhancements */}
                        <div className="space-y-6">
                            {/* Preview */}
                            <div className="relative aspect-square rounded-xl overflow-hidden border border-bronze-canvas-border bg-white">
                                <img
                                    src={enhancedPreviewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-white/80 backdrop-blur-md rounded-lg text-xs font-bold text-bronze-canvas-primary-text shadow-sm">
                                    Vista Previa
                                </div>
                            </div>

                            {/* Enhancement Controls */}
                            <div className="bg-bronze-canvas-component-bg p-4 md:p-6 rounded-xl border border-bronze-canvas-border space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <MaterialIcon icon="tune" className="text-bronze-canvas-accent" size={20} />
                                    <h4 className="font-bold text-bronze-canvas-primary-text">Ajustes de Iluminación</h4>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-bronze-canvas-primary-text">Mejora Automática</label>
                                    <button
                                        onClick={() => setEnhancements(prev => ({ ...prev, auto_enhance: !prev.auto_enhance }))}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${enhancements.auto_enhance ? 'bg-bronze-canvas-accent' : 'bg-bronze-canvas-border'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${enhancements.auto_enhance ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-medium text-bronze-canvas-secondary-text">Brillo</label>
                                            <span className="text-xs text-bronze-canvas-secondary-text">{enhancements.brightness}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-100"
                                            max="100"
                                            value={enhancements.brightness}
                                            onChange={(e) => setEnhancements(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                                            className="w-full h-2 bg-bronze-canvas-border rounded-lg appearance-none cursor-pointer accent-bronze-canvas-accent"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-medium text-bronze-canvas-secondary-text">Contraste</label>
                                            <span className="text-xs text-bronze-canvas-secondary-text">{enhancements.contrast}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-100"
                                            max="100"
                                            value={enhancements.contrast}
                                            onChange={(e) => setEnhancements(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                                            className="w-full h-2 bg-bronze-canvas-border rounded-lg appearance-none cursor-pointer accent-bronze-canvas-accent"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-medium text-bronze-canvas-secondary-text">Saturación</label>
                                            <span className="text-xs text-bronze-canvas-secondary-text">{enhancements.saturation}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-100"
                                            max="100"
                                            value={enhancements.saturation}
                                            onChange={(e) => setEnhancements(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                                            className="w-full h-2 bg-bronze-canvas-border rounded-lg appearance-none cursor-pointer accent-bronze-canvas-accent"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleReset}
                                    className="text-xs text-bronze-canvas-accent hover:text-bronze-canvas-primary-text flex items-center gap-1 transition-colors font-medium"
                                >
                                    <MaterialIcon icon="restart_alt" size={14} />
                                    Restaurar valores recomendados
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Metadata & Destination */}
                        <div className="space-y-6">
                            {/* Metadata Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MaterialIcon icon="auto_awesome" className="text-bronze-canvas-accent" size={20} />
                                    <h4 className="font-bold text-bronze-canvas-primary-text">Metadata</h4>
                                </div>

                                <Input
                                    label="Título"
                                    value={editedMetadata.title}
                                    onChange={(e) => setEditedMetadata(prev => ({ ...prev, title: e.target.value }))}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-bronze-canvas-secondary-text flex items-center gap-2">
                                            Categoría
                                        </label>
                                        <input
                                            list="categories"
                                            type="text"
                                            value={editedMetadata.category}
                                            onChange={(e) => setEditedMetadata(prev => ({ ...prev, category: e.target.value as any }))}
                                            className="w-full bg-white border border-bronze-canvas-border rounded-xl px-4 py-2.5 text-bronze-canvas-primary-text focus:outline-none focus:border-bronze-canvas-accent transition-colors text-sm"
                                        />
                                        <datalist id="categories">
                                            <option value="Anillos" />
                                            <option value="Collares" />
                                            <option value="Aretes" />
                                            <option value="Pulseras" />
                                            <option value="Dijes" />
                                            <option value="Otro" />
                                        </datalist>
                                    </div>

                                    <Input
                                        label="Material"
                                        value={editedMetadata.material || ''}
                                        onChange={(e) => setEditedMetadata(prev => ({ ...prev, material: e.target.value }))}
                                    />
                                </div>

                                <Textarea
                                    label="Descripción"
                                    value={editedMetadata.description || ''}
                                    onChange={(e) => setEditedMetadata(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                />

                                {/* Keywords */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-bronze-canvas-secondary-text flex items-center gap-2">
                                        Keywords
                                    </label>
                                    <div className="bg-white border border-bronze-canvas-border rounded-xl p-3 flex flex-wrap gap-2 min-h-[50px]">
                                        {(editedMetadata.keywords || []).map((keyword, index) => (
                                            <span key={index} className="px-2.5 py-1 bg-bronze-canvas-component-bg rounded-lg text-xs font-bold text-bronze-canvas-primary-text flex items-center gap-1.5 group border border-bronze-canvas-border">
                                                {keyword}
                                                <button
                                                    onClick={() => removeKeyword(index)}
                                                    className="text-bronze-canvas-secondary-text group-hover:text-red-500 transition-colors"
                                                >
                                                    <MaterialIcon icon="close" size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={newKeyword}
                                            onChange={(e) => setNewKeyword(e.target.value)}
                                            onKeyDown={handleAddKeyword}
                                            placeholder="Agregar..."
                                            className="bg-transparent text-sm text-bronze-canvas-primary-text placeholder:text-bronze-canvas-secondary-text focus:outline-none min-w-[80px] flex-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Destination Section */}
                            <div className="bg-bronze-canvas-accent/5 border border-bronze-canvas-accent/20 rounded-xl p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <MaterialIcon icon="folder_open" className="text-bronze-canvas-accent" size={20} />
                                    <h4 className="font-bold text-bronze-canvas-primary-text">Destino</h4>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDestination('gallery')}
                                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${destination === 'gallery'
                                            ? 'bg-bronze-canvas-accent text-white shadow-md'
                                            : 'bg-white border border-bronze-canvas-border text-bronze-canvas-secondary-text hover:border-bronze-canvas-accent'
                                            }`}
                                    >
                                        Galería
                                    </button>
                                    <button
                                        onClick={() => setDestination('catalog')}
                                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${destination === 'catalog'
                                            ? 'bg-bronze-canvas-accent text-white shadow-md'
                                            : 'bg-white border border-bronze-canvas-border text-bronze-canvas-secondary-text hover:border-bronze-canvas-accent'
                                            }`}
                                    >
                                        Catálogo
                                    </button>
                                </div>

                                {destination === 'catalog' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <label className="text-sm font-bold text-bronze-canvas-secondary-text">Seleccionar Catálogo</label>
                                        {loadingCatalogs ? (
                                            <div className="text-xs text-bronze-canvas-secondary-text">Cargando catálogos...</div>
                                        ) : catalogs.length === 0 ? (
                                            <div className="text-xs text-yellow-600 font-medium">
                                                No hay catálogos. Crea uno primero en la pestaña Catálogos.
                                            </div>
                                        ) : (
                                            <Select
                                                value={selectedCatalogId}
                                                onChange={(e) => setSelectedCatalogId(e.target.value)}
                                                options={catalogs.map(catalog => ({
                                                    value: catalog.id!,
                                                    label: `${catalog.title} (${catalog.itemCount || 0} productos)`
                                                }))}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-bronze-canvas-border bg-bronze-canvas-background flex justify-end gap-3 flex-shrink-0">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={destination === 'catalog' && (!selectedCatalogId || catalogs.length === 0)}
                        icon="check"
                    >
                        Guardar en {destination === 'gallery' ? 'Galería' : 'Catálogo'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
