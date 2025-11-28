import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { ImageRecord } from '../services/database';

interface ImageEditModalProps {
    image: ImageRecord;
    onSave: (updates: Partial<ImageRecord>) => void;
    onCancel: () => void;
}

export function ImageEditModal({ image, onSave, onCancel }: ImageEditModalProps) {
    const [title, setTitle] = useState(image.title);
    const [category, setCategory] = useState(image.category);
    const [material, setMaterial] = useState(image.material || '');
    const [description, setDescription] = useState(image.description || '');

    const categories = [
        'Anillos',
        'Aretes',
        'Collares',
        'Pulseras',
        'Dijes',
        'Conjuntos',
        'Otro'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const updates: Partial<ImageRecord> = {
            title: title.trim(),
            category,
            material: material.trim(),
            description: description.trim(),
        };

        onSave(updates);
    };

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99998] animate-in fade-in duration-200"
            onClick={onCancel}
        >
            <div
                className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-semibold">Editar Metadata</h2>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Preview */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950">
                        <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Título *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Ej: Anillo de Plata con Cristal"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Categoría *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Material */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Material
                        </label>
                        <input
                            type="text"
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Ej: Plata 925, Cristal Swarovski"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            placeholder="Descripción breve del producto..."
                            maxLength={200}
                        />
                        <div className="text-xs text-zinc-500 mt-1 text-right">
                            {description.length}/200 caracteres
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
