import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImageUploaderProps {
    onImageSelect: (file: File) => void;
    className?: string;
}

export function ImageUploader({ onImageSelect, className }: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleFile(file);
            }
        },
        [onImageSelect]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFile(file);
            }
        },
        [onImageSelect]
    );

    const handleFile = (file: File) => {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        onImageSelect(file);
    };

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        // Reset file input value if needed, but for now just clearing preview
    };

    return (
        <div
            className={cn(
                'relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors cursor-pointer overflow-hidden group',
                isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50',
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
            />

            {preview ? (
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
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    <div className="p-4 bg-zinc-800 rounded-full mb-3 group-hover:bg-zinc-700 transition-colors">
                        <Upload size={24} />
                    </div>
                    <p className="text-sm font-medium">Click or drag image to upload</p>
                    <p className="text-xs text-zinc-500 mt-1">Supports JPG, PNG, WEBP</p>
                </div>
            )}
        </div>
    );
}
