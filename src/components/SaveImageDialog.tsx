import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-semibold">Save to Gallery</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Silver Crystal Ring"
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Category *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select category...</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Material
                        </label>
                        <select
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select material...</option>
                            {MATERIALS.map((mat) => (
                                <option key={mat} value={mat}>
                                    {mat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description..."
                            rows={3}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-800 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-xl font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim() || !category || isSaving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
