import { useState, useEffect } from 'react';
import type { ImageRecord } from '../services/database';
import { Button, Input, Select, Textarea, MaterialIcon } from './ui';

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
                className="bg-bronze-canvas-background border border-bronze-canvas-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-bronze-canvas-background border-b border-bronze-canvas-border px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-bronze-canvas-primary-text">Editar Metadata</h2>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 rounded-lg bg-bronze-canvas-component-bg hover:bg-bronze-canvas-border flex items-center justify-center transition-colors text-bronze-canvas-primary-text"
                    >
                        <MaterialIcon icon="close" size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Preview */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-white border border-bronze-canvas-border">
                        <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <Input
                        label="Título"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Ej: Anillo de Plata con Cristal"
                    />

                    <Select
                        label="Categoría"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        options={categories.map(cat => ({ value: cat, label: cat }))}
                    />

                    <Input
                        label="Material"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="Ej: Plata 925, Cristal Swarovski"
                    />

                    <Textarea
                        label="Descripción"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Descripción breve del producto..."
                        maxLength={200}
                        helperText={`${description.length}/200 caracteres`}
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            icon="save"
                        >
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
