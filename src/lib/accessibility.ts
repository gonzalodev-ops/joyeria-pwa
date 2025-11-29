import { useEffect, useRef } from 'react';

/**
 * Hook para implementar focus trap en modales y diálogos
 * Cumple con WCAG 2.4.3 Focus Order
 */
export function useFocusTrap(isActive: boolean) {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!isActive) return;

        const container = containerRef.current;
        if (!container) return;

        // Selectores para elementos enfocables
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        const getFocusableElements = () => {
            return Array.from(
                container.querySelectorAll<HTMLElement>(focusableSelectors)
            ).filter(el => {
                // Filtrar elementos que no son visibles
                return el.offsetParent !== null;
            });
        };

        // Enfocar el primer elemento al abrir
        const focusableElements = getFocusableElements();
        const firstElement = focusableElements[0];

        // Guardar el elemento que tenía foco antes
        const previouslyFocusedElement = document.activeElement as HTMLElement;

        // Enfocar el primer elemento
        firstElement?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const currentFocusableElements = getFocusableElements();
            const firstEl = currentFocusableElements[0];
            const lastEl = currentFocusableElements[currentFocusableElements.length - 1];

            // Si solo hay un elemento enfocable, prevenir tab
            if (currentFocusableElements.length === 1) {
                e.preventDefault();
                return;
            }

            // Tab + Shift (hacia atrás)
            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl?.focus();
                }
            }
            // Tab (hacia adelante)
            else {
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl?.focus();
                }
            }
        };

        // Añadir event listener
        container.addEventListener('keydown', handleKeyDown);

        // Cleanup: restaurar foco al elemento anterior
        return () => {
            container.removeEventListener('keydown', handleKeyDown);
            previouslyFocusedElement?.focus();
        };
    }, [isActive]);

    return containerRef;
}

/**
 * Hook para anunciar mensajes a lectores de pantalla
 * Cumple con WCAG 4.1.3 Status Messages
 */
export function useLiveRegion() {
    const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const liveRegion = document.getElementById('live-region');
        if (!liveRegion) {
            // Crear región si no existe
            const region = document.createElement('div');
            region.id = 'live-region';
            region.setAttribute('aria-live', priority);
            region.setAttribute('aria-atomic', 'true');
            region.className = 'sr-only';
            document.body.appendChild(region);

            // Pequeño delay para que el lector de pantalla lo detecte
            setTimeout(() => {
                region.textContent = message;
            }, 100);
        } else {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = message;
        }

        // Limpiar después de 1 segundo
        setTimeout(() => {
            const region = document.getElementById('live-region');
            if (region) {
                region.textContent = '';
            }
        }, 1000);
    };

    return { announce };
}

/**
 * Hook para manejar Escape key en modales
 */
export function useEscapeKey(onEscape: () => void, isActive: boolean) {
    useEffect(() => {
        if (!isActive) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onEscape();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onEscape, isActive]);
}
