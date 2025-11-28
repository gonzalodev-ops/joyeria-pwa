import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Save, GripVertical, Loader2 } from 'lucide-react';
import { getImagesInCatalog, updateCatalogItemPositions } from '../services/database';
import type { ImageRecord } from '../services/database';
import { useToast } from '../contexts/ToastContext';

interface CatalogSortModalProps {
    catalogId: string;
    catalogTitle: string;
    onClose: () => void;
}

interface SortableItemProps {
    id: string;
    url: string;
    title: string;
}

function SortableItem({ id, url, title }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex items-center gap-3 touch-none select-none"
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-zinc-500 hover:text-zinc-300">
                <GripVertical size={20} />
            </div>
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                <img src={url} alt={title} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm text-zinc-300 font-medium line-clamp-1 flex-1">{title}</span>
        </div>
    );
}

export function CatalogSortModal({ catalogId, catalogTitle, onClose }: CatalogSortModalProps) {
    const [items, setItems] = useState<ImageRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadItems();
    }, [catalogId]);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await getImagesInCatalog(catalogId);
            setItems(data);
        } catch (error) {
            console.error('Error loading catalog items:', error);
            showToast('Error al cargar las imágenes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = items.map((item, index) => ({
                imageId: item.id!,
                position: index
            }));

            await updateCatalogItemPositions(catalogId, updates);
            showToast('Orden actualizado correctamente', 'success');
            onClose();
        } catch (error) {
            console.error('Error saving order:', error);
            showToast('Error al guardar el orden', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-zinc-100">Ordenar: {catalogTitle}</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-zinc-500" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-10 text-zinc-500">
                            Este catálogo no tiene imágenes.
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={items.map(i => i.id!)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {items.map((item) => (
                                        <SortableItem
                                            key={item.id}
                                            id={item.id!}
                                            url={item.url}
                                            title={item.title}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                <div className="p-4 border-t border-zinc-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading || items.length === 0}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Guardar Orden
                    </button>
                </div>
            </div>
        </div>
    );
}
