import { useEffect, type RefObject } from 'react';

interface UseCanvasDrawProps {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    imageSrc: string;
    background: string;
    aspectRatio: '1:1' | '4:5' | '9:16';
    logo: string | null;
}

export function useCanvasDraw({
    canvasRef,
    imageSrc,
    background,
    aspectRatio,
    logo
}: UseCanvasDrawProps) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;

        console.log('useCanvasDraw: Loading image...', imageSrc);

        img.onload = () => {
            console.log('useCanvasDraw: Image loaded successfully');

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
            console.error('useCanvasDraw: Error loading image', err);
        };
    }, [canvasRef, imageSrc, background, logo, aspectRatio]);
}
