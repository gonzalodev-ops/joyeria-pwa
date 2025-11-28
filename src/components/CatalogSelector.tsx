import { useState, useEffect } from 'react';
import { X, Plus, Folder } from 'lucide-react';
import { getCatalogs, createCatalog } from '../services/database';
import type { CatalogWithItems } from '../services/database';

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-semibold">Select Catalog</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {isLoading && catalogs.length === 0 ? (
                        <div className="text-center text-zinc-500 py-8">Loading...</div>
                    ) : catalogs.length === 0 && !isCreating ? (
                        <div className="text-center text-zinc-500 py-8">
                            <p>No catalogs yet</p>
                            <p className="text-sm mt-2">Create your first catalog below</p>
                        </div>
                    ) : (
                        catalogs.map((catalog) => (
                            <button
                                key={catalog.id}
                                onClick={() => onSelect(catalog.id!)}
                                className="w-full flex items-center gap-3 p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Folder size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{catalog.title}</h3>
                                    <p className="text-xs text-zinc-500">
                                        {catalog.itemCount || 0} items • {catalog.status}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}

                    {isCreating && (
                        <div className="p-4 bg-zinc-800/50 rounded-xl space-y-3">
                            <input
                                type="text"
                                value={newCatalogName}
                                onChange={(e) => setNewCatalogName(e.target.value)}
                                placeholder="Catalog name..."
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateCatalog();
                                    if (e.key === 'Escape') setIsCreating(false);
                                }}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateCatalog}
                                    disabled={!newCatalogName.trim() || isLoading}
                                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNewCatalogName('');
                                    }}
                                    className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-zinc-800">
                    <button
                        onClick={() => setIsCreating(true)}
                        disabled={isCreating}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-xl font-medium transition-colors"
                    >
                        <Plus size={18} />
                        New Catalog
                    </button>
                </div>
            </div>
        </div>
    );
}
