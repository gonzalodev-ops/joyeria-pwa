import { useState } from 'react';
import { Button, Input, Select, Textarea, MaterialIcon } from './ui';

interface SaveImageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (metadata: { title: string; category: string; material?: string; description?: string }) => Promise<void>;
}

const CATEGORIES = ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Pendants', 'Other'];
const MATERIALS = ['Silver', 'Gold', 'Rose Gold', 'Platinum', 'Mixed'];

export function SaveImageDialog({ isOpen, onClose, onSave }: SaveImageDialogProps) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [material, setMaterial] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !category) return;

        setIsSaving(true);
        try {
            await onSave({
                title: title.trim(),
                category,
                material: material || undefined,
                description: description.trim() || undefined,
            });
            // Reset form
            setTitle('');
            setCategory('');
            setMaterial('');
            setDescription('');
            onClose();
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-bronze-canvas-background border border-bronze-canvas-border rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-bronze-canvas-border bg-bronze-canvas-background rounded-t-2xl">
                    <h2 className="text-xl font-bold text-bronze-canvas-primary-text">Guardar en Galería</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-bronze-canvas-component-bg rounded-lg transition-colors text-bronze-canvas-secondary-text"
                    >
                        <MaterialIcon icon="close" size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4 bg-bronze-canvas-background">
                    <Input
                        label="Título"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: Anillo de Plata y Cristal"
                        required
                    />

                    <Select
                        label="Categoría"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        options={[
                            { value: '', label: 'Seleccionar categoría...' },
                            ...CATEGORIES.map(cat => ({ value: cat, label: cat }))
                        ]}
                    />

                    <Select
                        label="Material"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        options={[
                            { value: '', label: 'Seleccionar material...' },
                            ...MATERIALS.map(mat => ({ value: mat, label: mat }))
                        ]}
                    />

                    <Textarea
                        label="Descripción"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descripción opcional..."
                        rows={3}
                    />
                </div>

                <div className="p-6 border-t border-bronze-canvas-border flex gap-3 bg-bronze-canvas-background rounded-b-2xl">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSaving}
                        fullWidth
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!title.trim() || !category || isSaving}
                        loading={isSaving}
                        fullWidth
                        icon="save"
                    >
                        Guardar
                    </Button>
                </div>
            </div>
        </div>
    );
}
