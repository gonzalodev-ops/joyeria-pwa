# 🗺️ Jewelry AI Studio - Roadmap de Desarrollo

**Última actualización:** 28 de Noviembre, 2025

---

## 📊 Estado Actual del Proyecto

### ✅ Completado (90%)
- ✅ Procesamiento de imágenes con IA (PhotoRoom + Gemini)
- ✅ Canvas editor con logo y fondos personalizables
- ✅ Almacenamiento en Cloudinary + Supabase
- ✅ Galería con filtros y búsqueda
- ✅ **NUEVO:** Edición de metadata desde Gallery
- ✅ Gestión básica de catálogos
- ✅ Vista pública de catálogos

### ⚠️ Pendiente (10%)
- ⚠️ React Router para URLs compartibles
- ⚠️ PWA Manifest y Service Worker
- ⚠️ Optimizaciones de rendimiento

---

## 🚨 Problemas Críticos de UX Identificados

### 1. **Flujo de Guardado Fragmentado** 
**Problema:** 7-9 clicks para guardar una imagen  
**Solución:** Modal unificado que combine metadata + ajustes de iluminación

### 2. **Gallery Sin Acciones Rápidas**
**Problema:** No hay preview rápido ni selección múltiple  
**Solución:** ✅ **RESUELTO** - Agregado botón de edición

### 3. **Catálogos No Editables**
**Problema:** No se pueden editar, eliminar o reordenar  
**Solución:** Agregar menú contextual con todas las opciones

### 4. **Feedback Pobre**
**Problema:** Solo `alert()` básicos  
**Solución:** Sistema de toast notifications

### 5. **Canvas Editor Limitado**
**Problema:** Logo fijo en esquina superior derecha  
**Solución:** Controles de posición, tamaño y opacidad

---

## 📋 Roadmap Priorizado

### 🔴 **FASE 1: CRÍTICA** (Semana 1-2)

#### 1️⃣ Flujo de Guardado Simplificado
**Objetivo:** Reducir de 7-9 clicks a 2-3 clicks

**Diagrama de Flujo Actual:**
```
Usuario → Process All → Ve metadata → Click "Save" 
→ MetadataModal (revisar/editar) → Click "Confirmar"
→ EnhancementPreview (ajustar luz) → Click "Guardar"
→ ¿Gallery o Catalog? → Seleccionar catálogo → GUARDADO
```
**Total: 7-9 interacciones** ❌

**Diagrama de Flujo Propuesto:**
```
Usuario → Process All → Ve metadata → Click "Save"
→ SaveModal Unificado (metadata + ajustes + destino en una pantalla)
→ Click "Guardar" → GUARDADO
```
**Total: 3 interacciones** ✅

**Tareas:**
- [ ] Crear `SaveModal.tsx` (combina MetadataModal + EnhancementPreview)
- [ ] Agregar selector de destino (Gallery/Catalog) en el mismo modal
- [ ] Preview en tiempo real de ajustes de iluminación
- [ ] Simplificar `App.tsx` eliminando flujo de modales separados

---

#### 2️⃣ React Router para Catálogos Compartibles
**Objetivo:** Links de catálogos funcionan correctamente

**Estructura de Rutas:**
```
/ → App principal (Studio/Gallery/Catalogs)
/catalog/:id → Vista pública del catálogo
```

**Tareas:**
- [ ] Instalar y configurar `react-router-dom` ✅ (ya instalado)
- [ ] Modificar `main.tsx` para usar `BrowserRouter`
- [ ] Adaptar `App.tsx` a sistema de rutas
- [ ] Actualizar `CatalogView.tsx` para usar `useParams()`
- [ ] Probar compartir links de catálogos

**Código de Ejemplo:**
```tsx
// main.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/catalog/:id" element={<CatalogView />} />
  </Routes>
</BrowserRouter>
```

---

#### 3️⃣ Sistema de Notificaciones Toast
**Objetivo:** Reemplazar todos los `alert()` con toasts profesionales

**Diseño:**
```
┌─────────────────────────────────┐
│ ✓ Imagen guardada exitosamente │  [Auto-dismiss 3s]
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ⚠️ Error al procesar imagen     │  [Requiere click]
└─────────────────────────────────┘
```

**Tareas:**
- [ ] Crear `contexts/ToastContext.tsx`
- [ ] Crear `components/Toast.tsx` (componente visual)
- [ ] Integrar en `App.tsx`
- [ ] Reemplazar todos los `alert()` en:
  - [ ] `App.tsx`
  - [ ] `Gallery.tsx`
  - [ ] `CatalogManager.tsx`
  - [ ] `CanvasEditor.tsx`

---

### 🟡 **FASE 2: ALTA** (Semana 2-3)

#### 4️⃣ Gallery con Acciones Rápidas
**Estado:** ✅ **PARCIALMENTE COMPLETADO**
- ✅ Botón de edición agregado
- ⏳ Pendiente: Quick preview modal
- ⏳ Pendiente: Selección múltiple
- ⏳ Pendiente: Acciones por lote

**Tareas Restantes:**
- [ ] Quick Preview Modal (click en imagen → ver metadata completa)
- [ ] Selección múltiple con checkboxes
- [ ] Barra de acciones por lote:
  - [ ] "Agregar X imágenes a catálogo"
  - [ ] "Descargar X imágenes"
  - [ ] "Eliminar X imágenes"

**Mockup de Selección Múltiple:**
```
┌─────────────────────────────────────────────┐
│ ☑️ 3 seleccionadas                          │
│ [Agregar a Catálogo] [Descargar] [Eliminar]│
└─────────────────────────────────────────────┘
```

---

#### 5️⃣ Gestión Completa de Catálogos
**Objetivo:** Catálogos completamente editables

**Funcionalidades:**
- [ ] Editar catálogo (título, descripción, color)
- [ ] Eliminar catálogo (con confirmación)
- [ ] Reordenar productos (drag & drop)
- [ ] Agregar/quitar productos de catálogo existente
- [ ] Cambiar imagen de portada

**Menú Contextual Propuesto:**
```
┌────────────────────┐
│ Catálogo Primavera │ [⋮]
│ 12 productos       │  ↓
└────────────────────┘  • ✏️ Editar
                        • ➕ Agregar Productos
                        • 🔄 Reordenar
                        • 👁️ Ver Preview
                        • 🔗 Compartir Link
                        • 🗑️ Eliminar
```

**Librerías Recomendadas:**
- `@dnd-kit/core` para drag & drop
- `@dnd-kit/sortable` para listas reordenables

---

#### 6️⃣ Indicadores de Progreso Descriptivos
**Objetivo:** Usuario siempre sabe qué está pasando

**Progress Bar para "Process All":**
```
┌─────────────────────────────────────┐
│  🔄 Procesando tu imagen...         │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 50%         │
│  ✓ Fondo removido                   │
│  → Analizando con IA...             │
│  ○ Aplicando mejoras de luz         │
└─────────────────────────────────────┘
```

**Tareas:**
- [ ] Crear `ProgressIndicator.tsx`
- [ ] Integrar con `handleProcessAll()` en `App.tsx`
- [ ] Mostrar pasos: Remove BG → Analyze → Apply Enhancements
- [ ] Skeleton loaders para Gallery mientras carga

---

### 🟢 **FASE 3: MEDIA** (Semana 3-4)

#### 7️⃣ Canvas Editor Mejorado
**Objetivo:** Control total sobre composición

**Controles Nuevos:**
- [ ] **Logo:**
  - [ ] Posición: 4 esquinas + centro (9 posiciones)
  - [ ] Tamaño: S / M / L
  - [ ] Opacidad: 0-100%
- [ ] **Imagen de Joyería:**
  - [ ] Posición vertical: Top / Center / Bottom
  - [ ] Posición horizontal: Left / Center / Right
  - [ ] Zoom: 80% - 120%
- [ ] **Formato:**
  - [ ] Preview visual antes de seleccionar
  - [ ] Botón "Download" directo desde canvas

**Mockup de Controles:**
```
┌─────────────────────────────────┐
│ Logo                            │
│ Posición: [TL][TC][TR]          │
│           [ML][MC][MR]          │
│           [BL][BC][BR]          │
│ Tamaño:   ○ S  ● M  ○ L        │
│ Opacidad: ▓▓▓▓▓▓▓░░░ 70%      │
└─────────────────────────────────┘
```

---

#### 8️⃣ PWA Manifest y Service Worker
**Objetivo:** App instalable y funciona offline

**Tareas:**
- [ ] Crear `public/manifest.json`
- [ ] Generar iconos PWA (192x192, 512x512)
- [ ] Configurar `vite-plugin-pwa`
- [ ] Implementar estrategia de caché:
  - [ ] Imágenes de Cloudinary
  - [ ] Assets estáticos
  - [ ] API calls (con fallback)
- [ ] Probar instalación en móvil

**manifest.json:**
```json
{
  "name": "Jewelry AI Studio",
  "short_name": "Jewelry AI",
  "description": "Procesamiento de imágenes de joyería con IA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#3b82f6",
  "icons": [...]
}
```

---

#### 9️⃣ Optimizaciones de Rendimiento
**Objetivo:** App rápida incluso con 100+ imágenes

**Tareas:**
- [ ] **Gallery:**
  - [ ] Virtualización con `react-window` o `@tanstack/react-virtual`
  - [ ] Lazy loading de imágenes
  - [ ] Debounce en búsqueda (300ms)
- [ ] **Cloudinary:**
  - [ ] URLs optimizadas (WebP, responsive)
  - [ ] Caché de transformaciones
- [ ] **Bundle:**
  - [ ] Code splitting por ruta
  - [ ] Lazy load de componentes pesados
  - [ ] Análisis con `vite-bundle-visualizer`

**Métricas Objetivo:**
- Lighthouse Score: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Bundle Size: <500KB inicial

---

### 🔵 **FASE 4: BAJA** (Backlog)

#### 🔟 Funcionalidades Adicionales

**Favoritos:**
- [ ] Marcar imágenes como favoritas (estrella)
- [ ] Filtro "Solo favoritos" en Gallery

**Etiquetas Personalizadas:**
- [ ] Agregar tags además de categorías
- [ ] Filtro por tags

**Exportación Masiva:**
- [ ] Descargar catálogo completo como ZIP
- [ ] Incluir metadata en archivo JSON

**Estadísticas:**
- [ ] Dashboard con gráficas
- [ ] Imágenes procesadas por mes
- [ ] Categorías más usadas
- [ ] Catálogos más vistos

**Temas:**
- [ ] Toggle Dark/Light mode
- [ ] Persistir preferencia

**Colaboración:**
- [ ] Compartir catálogos con permisos
- [ ] Comentarios en productos
- [ ] Historial de cambios

---

## 🎯 Próximos Pasos Inmediatos

### Esta Semana:
1. ✅ **COMPLETADO:** Edición de metadata en Gallery
2. ⏳ **EN PROGRESO:** Decidir prioridad entre:
   - Flujo de guardado simplificado
   - React Router para catálogos
   - Sistema de toasts

### Preguntas para Ti:
1. **¿Cuál de las 3 tareas críticas quieres que implemente primero?**
   - A) Flujo de guardado simplificado (SaveModal unificado)
   - B) React Router (catálogos compartibles)
   - C) Sistema de toasts (mejor feedback)

2. **¿Hay alguna funcionalidad del backlog que quieras priorizar?**

3. **¿Prefieres que termine toda la Fase 1 antes de pasar a Fase 2?**

---

## 📈 Métricas de Éxito

### UX Metrics
- ✅ Tiempo para editar metadata: <10 segundos
- ⏳ Tiempo para guardar imagen: Target <30s (actualmente ~2min)
- ⏳ Clicks para guardar: Target 2-3 (actualmente 7-9)
- ⏳ Tasa de error: Target <5%

### Technical Metrics
- ⏳ Lighthouse Score: Target >90
- ⏳ Bundle Size: Target <500KB
- ⏳ Gallery con 100+ imágenes: Sin lag

---

**¿Listo para continuar? Dime qué tarea de la Fase 1 quieres que implemente ahora.** 🚀
