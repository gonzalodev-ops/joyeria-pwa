# Reporte de Optimización y Deuda Técnica
**Fecha:** 28 de Noviembre, 2024
**Proyecto:** Joyería PWA - Bronze Canvas Redesign

Este documento resume el estado actual del proyecto tras la migración completa al sistema de diseño "Bronze Canvas", identificando logros, deuda técnica acumulada y oportunidades de mejora para la experiencia de usuario y el rendimiento.

## 1. Resumen de Logros
Se ha completado una transformación visual y arquitectónica mayor de la aplicación:
- **Sistema de Diseño Unificado:** Implementación de 4 temas (Bronze Canvas, Gold Cream, Silver Blue, Mauve Copper) con variables CSS y Tailwind.
- **UI Kit Reutilizable:** Creación de componentes base robustos (`Button`, `Card`, `Input`, `Select`, `MaterialIcon`) que estandarizan la interfaz.
- **Migración de Iconos:** Reemplazo total de Lucide React por Google Material Symbols para una estética más refinada.
- **Mobile-First:** Rediseño de `App.tsx` y navegación para priorizar la experiencia en dispositivos móviles (Sticky headers/footers).
- **Cobertura Total:** Actualización del 100% de las pantallas y modales (`Gallery`, `CatalogManager`, `CanvasEditor`, etc.).

---

## 2. Deuda Técnica Identificada

A pesar del éxito visual, existen áreas del código que requieren atención para garantizar la escalabilidad y mantenibilidad:

### A. Complejidad en `App.tsx`
- **Problema:** `App.tsx` actúa como un "God Component", manejando estado de navegación, carga de imágenes, procesamiento, modales y lógica de negocio.
- **Solución:** Refactorizar extrayendo la lógica de vistas a componentes página dedicados (ej: `views/StudioView.tsx`, `views/GalleryView.tsx`) y usar un router propiamente dicho o un gestor de estado más robusto si crece más.

### B. Lógica del Canvas en el Componente
- **Problema:** `CanvasEditor.tsx` contiene lógica de dibujo imperativa mezclada con la UI de React.
- **Solución:** Extraer la lógica de dibujo (renderizado de imagen, fondo, logo) a un hook personalizado `useCanvasDraw` o una clase utilitaria para separar la presentación de la lógica de gráficos.

### C. Gestión de Estado Global
- **Problema:** Se usa mucho "prop drilling" (pasar props a través de múltiples niveles) para configuraciones y estados compartidos.
- **Solución:** Evaluar el uso de un estado global más estructurado (Zustand o Contexts más granulares) para evitar pasar tantos props, especialmente en los modales.

### D. Tipado TypeScript
- **Problema:** Aunque se usa TypeScript, existen áreas donde se podría ser más estricto (ej: evitar `any` en eventos de drag-and-drop o respuestas de API no tipadas estrictamente).
- **Solución:** Auditar y reforzar los tipos, especialmente para las respuestas de Supabase y Cloudinary.

---

## 3. Oportunidades de Optimización (Performance)

### A. Code Splitting (División de Código)
- **Oportunidad:** Componentes pesados como `Gallery` (que carga muchas imágenes) y `CanvasEditor` se cargan en el bundle principal.
- **Acción:** Implementar `React.lazy` y `Suspense` para cargar estas vistas solo cuando el usuario las solicita.

### B. Renderizado de Listas
- **Oportunidad:** La Galería renderiza todos los items a la vez. Si el usuario tiene cientos de fotos, esto será lento.
- **Acción:** Implementar "Virtual Scrolling" (virtualización) para renderizar solo los elementos visibles en pantalla.

### C. Optimización de Imágenes
- **Oportunidad:** Se cargan imágenes completas en la galería.
- **Acción:** Asegurar que se soliciten versiones redimensionadas (thumbnails) a Cloudinary/Supabase para la vista de galería, y solo cargar la full-res al editar.

### D. Memoización
- **Oportunidad:** Muchos componentes se re-renderizan innecesariamente al cambiar estados padres.
- **Acción:** Usar `React.memo`, `useMemo` y `useCallback` en componentes críticos como las tarjetas de la galería y los controles del editor.

---

## 4. Mejoras de Experiencia de Usuario (UX)

### A. Feedback de Carga (Skeletons)
- **Mejora:** Actualmente usamos spinners (`Loader2` o `MaterialIcon`).
- **Propuesta:** Implementar "Skeleton Screens" (esqueletos de carga) que imiten la estructura del contenido (tarjetas grises pulsantes) para reducir la percepción de tiempo de espera.

### B. Gestos en Móvil
- **Mejora:** La interacción es principalmente basada en clicks/taps.
- **Propuesta:** Añadir gestos de "Swipe" (deslizar) en la galería para acciones rápidas (ej: deslizar a la izquierda para borrar, derecha para editar).

### C. Transiciones de Página
- **Mejora:** El cambio entre pestañas es instantáneo y brusco.
- **Propuesta:** Añadir transiciones suaves (fade/slide) al cambiar entre Estudio, Galería y Catálogos usando `framer-motion` o CSS transitions simples.

### D. Modo Offline
- **Mejora:** La app depende de conexión para casi todo.
- **Propuesta:** Mejorar las capacidades PWA para permitir ver la galería y catálogos (cacheados) sin conexión a internet.

---

## 5. Plan de Acción Recomendado

1.  **Inmediato (Sprint de Limpieza):**
    *   Refactorizar `App.tsx` en vistas separadas.
    *   Auditoría de accesibilidad (aria-labels, contrastes).

2.  **Corto Plazo (Performance):**
    *   Implementar Lazy Loading de rutas.
    *   Optimizar carga de imágenes (thumbnails).

3.  **Mediano Plazo (Features):**
    *   Implementar Skeletons.
    *   Añadir gestos móviles.

Este reporte sirve como hoja de ruta para elevar la calidad del código al nivel del nuevo diseño visual.
