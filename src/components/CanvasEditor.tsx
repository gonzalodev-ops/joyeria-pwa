import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Download, Image as ImageIcon, LayoutTemplate, Palette } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;

        console.log('CanvasEditor: Loading image...', imageSrc);

        img.onload = () => {
            console.log('CanvasEditor: Image loaded successfully');

            // Set canvas size based on aspect ratio
            const baseSize = 1080;
            canvas.width = baseSize;

            if (aspectRatio === '1:1') canvas.height = baseSize;
            else if (aspectRatio === '4:5') canvas.height = baseSize * 1.25;
            else if (aspectRatio === '9:16') canvas.height = baseSize * (16 / 9);

            // Draw background
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw main image - fill 95% of canvas for prominence
            const fillPercentage = 0.95;
            const availWidth = canvas.width * fillPercentage;
            const availHeight = canvas.height * fillPercentage;

            const scale = Math.min(availWidth / img.width, availHeight / img.height);
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;

            // Add subtle shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 10;

            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // Reset shadow
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Draw logo in top right
            if (logo) {
                const logoImg = new Image();
                logoImg.src = logo;
                logoImg.onload = () => {
                    const logoWidthPercent = 0.15;
                    const logoMargin = 40;

                    const logoW = canvas.width * logoWidthPercent;
                    const logoH = (logoImg.height / logoImg.width) * logoW;

                    const logoX = canvas.width - logoW - logoMargin;
                    const logoY = logoMargin;

                    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
                };
            }
        };

        img.onerror = (err) => {
            console.error('CanvasEditor: Error loading image', err);
        };
    }, [imageSrc, background, logo, aspectRatio]);

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
                <div className="relative rounded-xl overflow-hidden border border-zinc-700 shadow-2xl bg-zinc-900">
                    <canvas ref={canvasRef} className="w-full h-auto max-w-full" />
                </div>

                <div className="flex flex-col gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <div className="flex flex-wrap gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                                <Palette size={14} />
                                Fondo Premium
                            </label>
                            <div className="flex items-center gap-2">
                                {settings.brandColors.map((color, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setBackground(color)}
                                        className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 ${background === color ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900' : 'border-zinc-600'}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                                <div className="w-px h-6 bg-zinc-700 mx-1" />
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-600 cursor-pointer hover:scale-110 transition-transform" title="Color Personalizado">
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
                            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                                <LayoutTemplate size={14} />
                                Formato
                            </label>
                            <div className="flex items-center bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                                {(['1:1', '4:5', '9:16'] as const).map((ratio) => (
                                    <button
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${aspectRatio === ratio
                                            ? 'bg-zinc-800 text-white shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                            }`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                        <div className="text-xs text-zinc-500 flex items-center gap-2">
                            {logo ? (
                                <span className="flex items-center gap-1.5 text-green-400">
                                    <ImageIcon size={12} />
                                    Logo aplicado automáticamente
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-zinc-500">
                                    <ImageIcon size={12} />
                                    Sin logo configurado
                                </span>
                            )}
                        </div>

                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Download size={16} />
                            Descargar PNG
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
