import React, { useCallback, useState } from 'react';
import { MaterialIcon } from './ui';
import { cn } from '../lib/utils';
import { validateImageFile } from '../lib/validation';
import { useToast } from '../contexts/ToastContext';

interface ImageUploaderProps {
    onImageSelect: (file: File) => void;
    className?: string;
}

export function ImageUploader({ onImageSelect, className }: ImageUploaderProps) {
    const { showToast } = useToast();
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFile = async (file: File) => {
        setIsValidating(true);
        try {
            const validation = await validateImageFile(file);

            if (!validation.valid) {
                showToast(validation.error?.userMessage || 'Archivo inválido', 'error');
                return;
            }

            if (validation.warnings && validation.warnings.length > 0) {
                validation.warnings.forEach(w => showToast(w, 'warning'));
            }

            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onImageSelect(file);
        } catch (error) {
            console.error('Validation error:', error);
            showToast('Error al validar la imagen', 'error');
        } finally {
            setIsValidating(false);
        }
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                processFile(file);
            }
        },
        [onImageSelect]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                processFile(file);
            }
        },
        [onImageSelect]
    );

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
    };

    return (
        <div
            className={cn(
                'relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden group',
                isDragging
                    ? 'border-bronze-canvas-accent bg-bronze-canvas-accent/5'
                    : 'border-bronze-canvas-border hover:border-bronze-canvas-accent hover:bg-bronze-canvas-component-bg',
                preview ? 'border-none' : '',
                className
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
        >
            <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileInput}
                disabled={isValidating}
            />

            {isValidating ? (
                <div className="flex flex-col items-center justify-center text-bronze-canvas-accent">
                    <MaterialIcon icon="progress_activity" className="animate-spin mb-2" size={32} />
                    <p className="text-sm font-medium">Validando imagen...</p>
                </div>
            ) : preview ? (
                <div className="relative w-full h-full">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                    />
                    <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                        <MaterialIcon icon="close" size={20} />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-bronze-canvas-secondary-text group-hover:text-bronze-canvas-primary-text transition-colors">
                    <div className="p-4 bg-bronze-canvas-component-bg rounded-full mb-3 group-hover:bg-bronze-canvas-border transition-colors">
                        <MaterialIcon icon="add_photo_alternate" size={24} />
                    </div>
                    <p className="text-sm font-medium">Click o arrastra para subir</p>
                    <p className="text-xs text-bronze-canvas-secondary-text mt-1">JPG, PNG, WEBP (Máx 10MB)</p>
                </div>
            )}
        </div>
    );
}
