import { useState, useEffect } from 'react';
import { Check, X, Sparkles, Tag, Type, FileText, Layers, ChevronDown } from 'lucide-react';
import type { JewelryMetadata } from '../services/gemini';

interface MetadataModalProps {
    metadata: JewelryMetadata;
    onSave: (metadata: JewelryMetadata) => void;
    onCancel: () => void;
}

export function MetadataModal({ metadata, onSave, onCancel }: MetadataModalProps) {
    const [editedMetadata, setEditedMetadata] = useState<JewelryMetadata>(metadata);
    const [newKeyword, setNewKeyword] = useState('');

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

    useEffect(() => {
        console.log('MetadataModal MOUNTED/RENDERED');
    }, []);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4 overflow-y-auto"
            style={{
                zIndex: 99998,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300 my-4"
            >
                {/* Header - Fixed */}
                <div className="p-4 md:p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 flex-shrink-0">
                    <div>
                        <h3 className="text-lg md:text-xl font-semibold text-zinc-100 flex items-center gap-2">
                            <Sparkles size={20} className="text-purple-400" />
                            Metadata Extraída con IA
                        </h3>
                        <p className="text-xs md:text-sm text-zinc-500 mt-1">Revisa y edita la información antes de guardar</p>
                    </div>
                    <button onClick={onCancel} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Type size={16} className="text-blue-400" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <Layers size={16} className="text-purple-400" />
                                Categoría
                            </label>
                            <input
                                list="categories"
                                type="text"
                                value={editedMetadata.category}
                                onChange={(e) => setEditedMetadata(prev => ({ ...prev, category: e.target.value as any }))}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Selecciona o escribe..."
                            />
                            <datalist id="categories">
                                <option value="Anillos" />
                                <option value="Collares" />
                                <option value="Aretes" />
                                <option value="Dijes" />
                                <option value="Relojes" />
                                <option value="Pulseras" />
                                <option value="Broches" />
                                <option value="Juegos" />
                                <option value="Otro" />
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <Sparkles size={16} className="text-yellow-400" />
                                Material
                            </label>
                            <input
                                type="text"
                                value={editedMetadata.material}
                                onChange={(e) => setEditedMetadata(prev => ({ ...prev, material: e.target.value }))}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <FileText size={16} className="text-green-400" />
                            Descripción
                        </label>
                        <textarea
                            value={editedMetadata.description}
                            onChange={(e) => setEditedMetadata(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        />
                    </div>

                    {/* Keywords */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Tag size={16} className="text-pink-400" />
                            Keywords (SEO)
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
                                placeholder="Agregar keyword..."
                                className="bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none min-w-[120px] flex-1"
                            />
                        </div>
                        <p className="text-xs text-zinc-500">Presiona Enter para agregar keywords</p>
                    </div>

                    {/* Lighting Analysis */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">Análisis de Iluminación</h4>
                        <p className="text-sm text-blue-200/80 leading-relaxed">
                            {editedMetadata.lighting_analysis}
                        </p>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="flex justify-center py-2 text-zinc-600">
                        <ChevronDown size={20} className="animate-bounce" />
                    </div>
                </div>

                {/* Footer - Fixed */}
                <div className="p-4 md:p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(editedMetadata)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Check size={16} />
                        Confirmar Metadata
                    </button>
                </div>
            </div>
        </div>
    );
}
