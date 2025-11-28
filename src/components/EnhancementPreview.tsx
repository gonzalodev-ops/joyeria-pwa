import { useState, useEffect } from 'react';
import { Sliders, Check, X, RefreshCw } from 'lucide-react';
import { applyTransformationsToUrl } from '../services/cloudinary';
import type { CloudinaryEnhancement } from '../services/cloudinary';

interface EnhancementPreviewProps {
    originalUrl: string;
    initialEnhancements: CloudinaryEnhancement;
    onSave: (enhancements: CloudinaryEnhancement) => void;
    onCancel: () => void;
}

export function EnhancementPreview({ originalUrl, initialEnhancements, onSave, onCancel }: EnhancementPreviewProps) {
    const [enhancements, setEnhancements] = useState<CloudinaryEnhancement>(initialEnhancements);
    const [previewUrl, setPreviewUrl] = useState<string>(originalUrl);

    useEffect(() => {
        const url = applyTransformationsToUrl(originalUrl, enhancements);
        setPreviewUrl(url);
    }, [originalUrl, enhancements]);

    const handleReset = () => {
        setEnhancements(initialEnhancements);
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            style={{ zIndex: 99998, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                        <Sliders size={20} className="text-blue-400" />
                        Ajustar Mejoras de Iluminación
                    </h3>
                    <button onClick={onCancel} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                        {/* Preview Area */}
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-medium text-white">
                                    Vista Previa
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <p className="text-xs text-zinc-500">
                                    Transformaciones aplicadas vía Cloudinary
                                </p>
                            </div>
                        </div>

                        {/* Controls Area */}
                        <div className="space-y-8">
                            <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800 space-y-6">
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

                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                <p className="text-xs text-yellow-200/80 leading-relaxed">
                                    <strong>Nota:</strong> Estas mejoras se aplicarán usando la tecnología de Cloudinary.
                                    Cada ajuste cuenta como una transformación en tu plan gratuito.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(enhancements)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Check size={16} />
                        Confirmar y Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
