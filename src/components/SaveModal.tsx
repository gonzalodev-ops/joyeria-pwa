import { useState, useEffect } from 'react';
import { Check, X, Sparkles, Tag, Type, FileText, Layers, Sliders, RefreshCw, Save, FolderOpen } from 'lucide-react';
import type { JewelryMetadata } from '../services/gemini';
import type { CloudinaryEnhancement } from '../services/cloudinary';
import { applyTransformationsToUrl } from '../services/cloudinary';
import { getCatalogs } from '../services/database';
import type { CatalogWithItems } from '../services/database';

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
            className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4 overflow-y-auto"
            style={{ zIndex: 99998, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300 my-4">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 flex-shrink-0">
                    <div>
                        <h3 className="text-lg md:text-xl font-semibold text-zinc-100 flex items-center gap-2">
                            <Save size={20} className="text-blue-400" />
                            Guardar Imagen
                        </h3>
                        <p className="text-xs md:text-sm text-zinc-500 mt-1">Revisa metadata, ajusta mejoras y elige destino</p>
                    </div>
                    <button onClick={onCancel} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: Preview & Enhancements */}
                        <div className="space-y-6">
                            {/* Preview */}
                            <div className="relative aspect-square rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950">
                                <img
                                    src={enhancedPreviewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-medium text-white">
                                    Vista Previa
                                </div>
                            </div>

                            {/* Enhancement Controls */}
                            <div className="bg-zinc-950/50 p-4 md:p-6 rounded-xl border border-zinc-800 space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sliders size={18} className="text-blue-400" />
                                    <h4 className="font-semibold text-zinc-200">Ajustes de Iluminación</h4>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-zinc-300">Mejora Automática</label>
                                    <button
                                        onClick={() => setEnhancements(prev => ({ ...prev, auto_enhance: !prev.auto_enhance }))}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${enhancements.auto_enhance ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${enhancements.auto_enhance ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-medium text-zinc-300">Brillo</label>
                                            <span className="text-xs text-zinc-500">{enhancements.brightness}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-100"
                                            max="100"
                                            value={enhancements.brightness}
                                            onChange={(e) => setEnhancements(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-medium text-zinc-300">Contraste</label>
                                            <span className="text-xs text-zinc-500">{enhancements.contrast}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-100"
                                            max="100"
                                            value={enhancements.contrast}
                                            onChange={(e) => setEnhancements(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-medium text-zinc-300">Saturación</label>
                                            <span className="text-xs text-zinc-500">{enhancements.saturation}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-100"
                                            max="100"
                                            value={enhancements.saturation}
                                            onChange={(e) => setEnhancements(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleReset}
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                >
                                    <RefreshCw size={12} />
                                    Restaurar valores recomendados
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Metadata & Destination */}
                        <div className="space-y-6">
                            {/* Metadata Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={18} className="text-purple-400" />
                                    <h4 className="font-semibold text-zinc-200">Metadata</h4>
                                </div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        <Type size={14} className="text-blue-400" />
                                        Título
                                    </label>
                                    <input
                                        type="text"
                                        value={editedMetadata.title}
                                        onChange={(e) => setEditedMetadata(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                {/* Category & Material */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                            <Layers size={14} className="text-purple-400" />
                                            Categoría
                                        </label>
                                        <input
                                            list="categories"
                                            type="text"
                                            value={editedMetadata.category}
                                            onChange={(e) => setEditedMetadata(prev => ({ ...prev, category: e.target.value as any }))}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors text-sm"
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                            <Sparkles size={14} className="text-yellow-400" />
                                            Material
                                        </label>
                                        <input
                                            type="text"
                                            value={editedMetadata.material}
                                            onChange={(e) => setEditedMetadata(prev => ({ ...prev, material: e.target.value }))}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        <FileText size={14} className="text-green-400" />
                                        Descripción
                                    </label>
                                    <textarea
                                        value={editedMetadata.description}
                                        onChange={(e) => setEditedMetadata(prev => ({ ...prev, description: e.target.value }))}
                                        rows={2}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
                                    />
                                </div>

                                {/* Keywords */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        <Tag size={14} className="text-pink-400" />
                                        Keywords
                                    </label>
                                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex flex-wrap gap-2 min-h-[50px]">
                                        {(editedMetadata.keywords || []).map((keyword, index) => (
                                            <span key={index} className="px-2.5 py-1 bg-zinc-800 rounded-lg text-xs font-medium text-zinc-300 flex items-center gap-1.5 group">
                                                {keyword}
                                                <button
                                                    onClick={() => removeKeyword(index)}
                                                    className="text-zinc-500 group-hover:text-red-400 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={newKeyword}
                                            onChange={(e) => setNewKeyword(e.target.value)}
                                            onKeyDown={handleAddKeyword}
                                            placeholder="Agregar..."
                                            className="bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none min-w-[80px] flex-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Destination Section */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <FolderOpen size={18} className="text-blue-400" />
                                    <h4 className="font-semibold text-blue-200">Destino</h4>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDestination('gallery')}
                                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${destination === 'gallery'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                            }`}
                                    >
                                        Galería
                                    </button>
                                    <button
                                        onClick={() => setDestination('catalog')}
                                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${destination === 'catalog'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                            }`}
                                    >
                                        Catálogo
                                    </button>
                                </div>

                                {destination === 'catalog' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <label className="text-sm font-medium text-blue-200">Seleccionar Catálogo</label>
                                        {loadingCatalogs ? (
                                            <div className="text-xs text-zinc-400">Cargando catálogos...</div>
                                        ) : catalogs.length === 0 ? (
                                            <div className="text-xs text-yellow-400">
                                                No hay catálogos. Crea uno primero en la pestaña Catalogs.
                                            </div>
                                        ) : (
                                            <select
                                                value={selectedCatalogId}
                                                onChange={(e) => setSelectedCatalogId(e.target.value)}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                            >
                                                {catalogs.map(catalog => (
                                                    <option key={catalog.id} value={catalog.id}>
                                                        {catalog.title} ({catalog.itemCount || 0} productos)
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={destination === 'catalog' && (!selectedCatalogId || catalogs.length === 0)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Check size={16} />
                        Guardar en {destination === 'gallery' ? 'Galería' : 'Catálogo'}
                    </button>
                </div>
            </div>
        </div>
    );
}
