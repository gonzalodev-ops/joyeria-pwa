import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Button, MaterialIcon } from './ui';
import { useCanvasDraw } from '../hooks/useCanvasDraw';

interface CanvasEditorProps {
    imageSrc: string;
    className?: string;
    title?: string;
}

export interface CanvasEditorRef {
    getCanvasDataURL: () => string | null;
    getCanvasBlob: () => Promise<Blob | null>;
}

export const CanvasEditor = forwardRef<CanvasEditorRef, CanvasEditorProps>(({ imageSrc, className, title }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { settings } = useSettings();

    const [background, setBackground] = useState<string>(settings.brandColors[0]);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '9:16'>(settings.defaultAspectRatio);
    const [logo, setLogo] = useState<string | null>(settings.logoUrl);

    useEffect(() => {
        if (settings.logoUrl) setLogo(settings.logoUrl);
    }, [settings.logoUrl]);

    // Use custom hook for drawing logic
    useCanvasDraw({
        canvasRef,
        imageSrc,
        background,
        aspectRatio,
        logo
    });

    useImperativeHandle(ref, () => ({
        getCanvasDataURL: () => {
            const canvas = canvasRef.current;
            if (!canvas) return null;
            return canvas.toDataURL('image/png');
        },
        getCanvasBlob: () => {
            return new Promise((resolve) => {
                const canvas = canvasRef.current;
                if (!canvas) {
                    resolve(null);
                    return;
                }
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png');
            });
        }
    }));

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('CanvasEditor: No canvas ref available');
            return;
        }

        try {
            // Create a clean filename from the title or use default
            const safeTitle = title
                ? title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
                : 'joya-procesada';
            const filename = `${safeTitle}.png`;

            console.log('Attempting download with filename:', filename);

            // Use toBlob for better handling of large images
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('CanvasEditor: Failed to create blob');
                    alert('Error al generar la imagen para descarga');
                    return;
                }

                // Create a File object to enforce the filename property
                const file = new File([blob], filename, { type: 'image/png' });
                const url = URL.createObjectURL(file);

                const link = document.createElement('a');
                link.style.display = 'none';
                link.href = url;
                link.download = filename;

                document.body.appendChild(link);
                link.click();

                // Cleanup with longer timeout to ensure download starts
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 2000);

                console.log('CanvasEditor: Download initiated for', filename);
            }, 'image/png', 1.0); // 1.0 quality
        } catch (error) {
            console.error('CanvasEditor: Download failed', error);
            alert('Error al descargar la imagen');
        }
    };

    return (
        <div className={className}>
            <div className="flex flex-col gap-4">
                <div className="relative rounded-xl overflow-hidden border border-bronze-canvas-border shadow-lg bg-white">
                    <canvas ref={canvasRef} className="w-full h-auto max-w-full" />
                </div>

                <div className="flex flex-col gap-4 p-4 bg-bronze-canvas-component-bg rounded-xl border border-bronze-canvas-border">
                    <div className="flex flex-wrap gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-bronze-canvas-secondary-text flex items-center gap-1.5 uppercase tracking-wider">
                                <MaterialIcon icon="palette" size={16} />
                                Fondo Premium
                            </label>
                            <div className="flex items-center gap-2">
                                {settings.brandColors.map((color, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setBackground(color)}
                                        className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 ${background === color ? 'ring-2 ring-bronze-canvas-accent ring-offset-2 ring-offset-bronze-canvas-component-bg' : 'border-bronze-canvas-border'}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                                <div className="w-px h-6 bg-bronze-canvas-border mx-1" />
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-bronze-canvas-border cursor-pointer hover:scale-110 transition-transform" title="Color Personalizado">
                                    <input
                                        type="color"
                                        value={background}
                                        onChange={(e) => setBackground(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="w-full h-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-bronze-canvas-secondary-text flex items-center gap-1.5 uppercase tracking-wider">
                                <MaterialIcon icon="aspect_ratio" size={16} />
                                Formato
                            </label>
                            <div className="flex items-center bg-bronze-canvas-background rounded-lg p-1 border border-bronze-canvas-border">
                                {(['1:1', '4:5', '9:16'] as const).map((ratio) => (
                                    <button
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${aspectRatio === ratio
                                            ? 'bg-bronze-canvas-accent text-white shadow-sm'
                                            : 'text-bronze-canvas-secondary-text hover:text-bronze-canvas-primary-text'
                                            }`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-bronze-canvas-border">
                        <div className="text-xs text-bronze-canvas-secondary-text flex items-center gap-2">
                            {logo ? (
                                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                                    <MaterialIcon icon="check_circle" size={14} />
                                    Logo aplicado
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-bronze-canvas-secondary-text">
                                    <MaterialIcon icon="info" size={14} />
                                    Sin logo
                                </span>
                            )}
                        </div>

                        <Button
                            onClick={handleDownload}
                            variant="secondary"
                            size="sm"
                            icon="download"
                        >
                            Descargar PNG
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
});
