# 🎨 Roadmap de Implementación del Nuevo Diseño
## Jewelry AI Studio - Diseño Bronze Canvas

**Fecha de inicio**: 2025-11-28
**Estilo de referencia**: Google Stitch - Bronze Canvas Theme
**Estado**: 🟡 En Progreso

---

## 📋 Resumen del Proyecto

Transformar la aplicación actual de un diseño dark/zinc a un diseño minimalista premium con tonos bronze/beige, siguiendo el estilo de Google Stitch.

### Características del Nuevo Diseño
- ✨ Minimalista y limpio
- 🎨 Paleta Bronze Canvas (beige, bronze, verde esmeralda)
- 📱 Mobile-first con header/footer sticky
- 🔤 Tipografía Manrope
- 🎯 Material Symbols (reemplazar Lucide icons)
- 🌈 4 variantes de tema disponibles

---

## 🎯 Fases de Implementación

### **FASE 1: Configuración del Sistema de Diseño** ⏳
**Objetivo**: Establecer la base del nuevo diseño

#### 1.1 Actualizar Tailwind Config
- [ ] Agregar paleta Bronze Canvas a `tailwind.config.js`
- [ ] Agregar 3 variantes adicionales de color:
  - Dorado/Crema (premium cálido)
  - Gris azulado/Plateado (sofisticado)
  - Malva/Cobre (elegante)
- [ ] Configurar fuente Manrope
- [ ] Ajustar border-radius defaults
- [ ] Configurar spacing personalizado

**Archivo**: `tailwind.config.js`

```javascript
// Colores a agregar:
colors: {
  // Bronze Canvas (Principal)
  'bronze-canvas-background': '#f0ede4',
  'bronze-canvas-primary-text': '#1a362a',
  'bronze-canvas-secondary-text': '#5a6b5a',
  'bronze-canvas-component-bg': '#e6e0d3',
  'bronze-canvas-accent': '#a6886e',
  'bronze-canvas-border': '#c9c2b6',
  
  // Variante 1: Dorado/Crema
  'gold-cream-background': '#faf8f3',
  'gold-cream-primary-text': '#2d2416',
  'gold-cream-secondary-text': '#6b5d4f',
  'gold-cream-component-bg': '#f5f0e8',
  'gold-cream-accent': '#d4a574',
  'gold-cream-border': '#e8dcc8',
  
  // Variante 2: Gris azulado/Plateado
  'silver-blue-background': '#f0f4f8',
  'silver-blue-primary-text': '#1a2332',
  'silver-blue-secondary-text': '#4a5568',
  'silver-blue-component-bg': '#e2e8f0',
  'silver-blue-accent': '#94a3b8',
  'silver-blue-border': '#cbd5e1',
  
  // Variante 3: Malva/Cobre
  'mauve-copper-background': '#f5f0f3',
  'mauve-copper-primary-text': '#2d1a28',
  'mauve-copper-secondary-text': '#6b5563',
  'mauve-copper-component-bg': '#ebe3e8',
  'mauve-copper-accent': '#b8856a',
  'mauve-copper-border': '#d9c9d3',
}
```

#### 1.2 Agregar Fuente Manrope
- [ ] Actualizar `index.html` con Google Fonts link
- [ ] Configurar font-family en Tailwind
- [ ] Actualizar `index.css` con font-display

**Archivo**: `index.html`
```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet"/>
```

#### 1.3 Integrar Material Symbols
- [ ] Agregar Material Symbols a `index.html`
- [ ] Crear componente wrapper `MaterialIcon.tsx`
- [ ] Documentar mapeo de Lucide → Material Symbols

**Archivo**: `index.html`
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
```

**Archivo nuevo**: `src/components/MaterialIcon.tsx`

#### 1.4 Crear Sistema de Temas
- [ ] Crear `ThemeContext.tsx` para manejar temas
- [ ] Implementar selector de tema (4 variantes)
- [ ] Persistir tema seleccionado en localStorage
- [ ] Crear hook `useTheme()`

**Archivo nuevo**: `src/contexts/ThemeContext.tsx`

---

### **FASE 2: Componentes Base** 🔄
**Objetivo**: Crear/actualizar componentes fundamentales con el nuevo diseño

#### 2.1 Layout Principal
- [ ] Actualizar `App.tsx` con nuevo layout
- [ ] Crear Header sticky con menú/título/settings
- [ ] Crear Footer sticky con acciones principales
- [ ] Implementar backdrop-blur en footer
- [ ] Ajustar padding y spacing

**Archivos**: `src/App.tsx`

#### 2.2 Botones
- [ ] Crear componente `Button.tsx` reutilizable
- [ ] Variantes: primary (bronze), secondary (beige), ghost
- [ ] Integrar Material Icons
- [ ] Estados: default, hover, disabled, loading

**Archivo nuevo**: `src/components/ui/Button.tsx`

#### 2.3 Cards
- [ ] Crear componente `Card.tsx`
- [ ] Bordes sutiles (no sombras)
- [ ] Variantes: default, stats, catalog
- [ ] Hover states suaves

**Archivo nuevo**: `src/components/ui/Card.tsx`

#### 2.4 Inputs y Formularios
- [ ] Crear `Input.tsx`
- [ ] Crear `Select.tsx`
- [ ] Crear `Textarea.tsx`
- [ ] Estilos consistentes con el tema
- [ ] Estados de validación

**Archivos nuevos**: `src/components/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`

---

### **FASE 3: Pantallas Principales** 📱
**Objetivo**: Rediseñar pantallas existentes y crear faltantes

#### 3.1 Pantalla de Carga (Home/Studio)
- [ ] Rediseñar área de upload con borde dashed
- [ ] Actualizar stats cards
- [ ] Mover botones principales al footer sticky
- [ ] Agregar iconos Material Symbols
- [ ] Implementar estados vacío/con imagen

**Archivo**: `src/App.tsx` (sección Studio)

#### 3.2 Galería de Joyería
- [ ] Rediseñar `Gallery.tsx` con grid minimalista
- [ ] Agregar filtros (fecha, categoría, nombre)
- [ ] Implementar ordenación
- [ ] Cards de imagen con hover sutil
- [ ] Estado vacío elegante

**Archivo**: `src/components/Gallery.tsx`

#### 3.3 Detalles de Pieza
- [ ] Crear `ImageDetail.tsx`
- [ ] Vista ampliada de imagen
- [ ] Mostrar metadata
- [ ] Botones de acción:
  - Agregar a Catálogo
  - Eliminar Pieza
  - Modificar Metadata
  - Compartir
  - Ver historial
  - Duplicar

**Archivo nuevo**: `src/components/ImageDetail.tsx`

#### 3.4 Modificar Metadata
- [ ] Crear/actualizar `MetadataModal.tsx`
- [ ] Formulario con campos claros
- [ ] Campos: nombre, descripción, categoría, etiquetas
- [ ] Botones: Guardar Cambios, Cancelar
- [ ] Validación en tiempo real

**Archivo**: `src/components/MetadataModal.tsx`

#### 3.5 Mis Catálogos
- [ ] Rediseñar `CatalogManager.tsx`
- [ ] Cards de catálogo con imagen representativa
- [ ] Mostrar nombre y número de piezas
- [ ] Botón "Crear Nuevo Catálogo" destacado
- [ ] Opciones editar/eliminar

**Archivo**: `src/components/CatalogManager.tsx`

#### 3.6 Agregar a Catálogo
- [ ] Rediseñar `CatalogSelector.tsx`
- [ ] Lista con checkboxes
- [ ] Opción "Crear Nuevo Catálogo"
- [ ] Botón "Agregar" para confirmar
- [ ] Búsqueda de catálogos

**Archivo**: `src/components/CatalogSelector.tsx`

#### 3.7 Crear Nuevo Catálogo
- [ ] Crear modal/pantalla dedicada
- [ ] Campos: nombre, descripción, etiquetas
- [ ] Botones: Crear Catálogo, Cancelar
- [ ] Animaciones sutiles

**Archivo nuevo**: `src/components/CreateCatalogModal.tsx`

#### 3.8 Catálogo Individual
- [ ] Crear `CatalogView.tsx`
- [ ] Header con nombre y descripción
- [ ] Grid de piezas
- [ ] Botones de acción:
  - Agregar Piezas
  - Editar Catálogo
  - Eliminar Catálogo
  - Compartir Catálogo

**Archivo nuevo**: `src/components/CatalogView.tsx`

#### 3.9 Ajustes
- [ ] Rediseñar `SettingsModal.tsx`
- [ ] Secciones organizadas:
  - Información de Cuenta
  - Notificaciones
  - Apariencia (selector de tema)
  - Privacidad y Datos
  - Ayuda y Soporte
  - Acerca de
- [ ] Elementos interactivos con animaciones

**Archivo**: `src/components/SettingsModal.tsx`

---

### **FASE 4: Funcionalidades Avanzadas** 🚀
**Objetivo**: Implementar características adicionales

#### 4.1 Sistema de Autenticación (Opcional)
- [ ] Crear `Login.tsx`
- [ ] Crear `Register.tsx`
- [ ] Integrar con Supabase Auth
- [ ] Opción de login con redes sociales
- [ ] "Olvidé mi contraseña"

**Archivos nuevos**: `src/components/Login.tsx`, `Register.tsx`

#### 4.2 Canvas Editor
- [ ] Rediseñar `CanvasEditor.tsx`
- [ ] Controles minimalistas
- [ ] Selector de color de fondo
- [ ] Upload de logo
- [ ] Preview en tiempo real

**Archivo**: `src/components/CanvasEditor.tsx`

#### 4.3 Animaciones y Transiciones
- [ ] Implementar animaciones sutiles en:
  - Hover states
  - Modal open/close
  - Page transitions
  - Loading states
- [ ] Usar Tailwind animate-in/out
- [ ] Configurar durations consistentes

#### 4.4 Estados de Carga
- [ ] Crear componentes de skeleton
- [ ] Loading spinners consistentes
- [ ] Estados vacíos elegantes
- [ ] Error states informativos

**Archivos nuevos**: `src/components/ui/Skeleton.tsx`, `EmptyState.tsx`

---

### **FASE 5: Optimización y Pulido** ✨
**Objetivo**: Refinar y optimizar la experiencia

#### 5.1 Responsive Design
- [ ] Verificar mobile (320px - 768px)
- [ ] Verificar tablet (768px - 1024px)
- [ ] Verificar desktop (1024px+)
- [ ] Ajustar spacing y tamaños

#### 5.2 Accesibilidad
- [ ] Verificar contraste de colores (WCAG AA)
- [ ] Agregar aria-labels
- [ ] Navegación por teclado
- [ ] Focus states visibles

#### 5.3 Performance
- [ ] Lazy loading de imágenes
- [ ] Code splitting
- [ ] Optimizar bundle size
- [ ] Verificar Lighthouse score

#### 5.4 Testing
- [ ] Probar todas las pantallas
- [ ] Verificar flujos completos
- [ ] Testing en diferentes dispositivos
- [ ] Fix bugs encontrados

---

## 📦 Mapeo de Iconos: Lucide → Material Symbols

| Componente Actual | Icono Lucide | Material Symbol | Nombre Material |
|-------------------|--------------|-----------------|-----------------|
| Upload | Upload | upload_file | upload_file |
| Image | Image | image | image |
| Download | Download | download | download |
| Settings | Settings | settings | settings |
| Menu | Menu | menu | menu |
| Plus | Plus | add | add |
| X | X | close | close |
| Eye | Eye | visibility | visibility |
| Share2 | Share2 | share | share |
| Folder | Folder | folder | folder |
| Layers | Layers | layers | layers |
| Sparkles | Sparkles | auto_awesome | auto_awesome |
| Loader2 | Loader2 | progress_activity | progress_activity |
| Lightbulb | Lightbulb | lightbulb | lightbulb |
| MoreVertical | MoreVertical | more_vert | more_vert |
| Check | Check | check | check |
| AlertCircle | AlertCircle | error | error |
| Info | Info | info | info |
| AlertTriangle | AlertTriangle | warning | warning |

---

## 🎨 Paletas de Colores Completas

### Bronze Canvas (Principal)
```css
background: #f0ede4
primary-text: #1a362a
secondary-text: #5a6b5a
component-bg: #e6e0d3
accent: #a6886e
border: #c9c2b6
```

### Gold Cream (Variante 1)
```css
background: #faf8f3
primary-text: #2d2416
secondary-text: #6b5d4f
component-bg: #f5f0e8
accent: #d4a574
border: #e8dcc8
```

### Silver Blue (Variante 2)
```css
background: #f0f4f8
primary-text: #1a2332
secondary-text: #4a5568
component-bg: #e2e8f0
accent: #94a3b8
border: #cbd5e1
```

### Mauve Copper (Variante 3)
```css
background: #f5f0f3
primary-text: #2d1a28
secondary-text: #6b5563
component-bg: #ebe3e8
accent: #b8856a
border: #d9c9d3
```

---

## 📝 Checklist de Progreso

### Configuración Base
- [ ] Tailwind config actualizado
- [ ] Fuente Manrope integrada
- [ ] Material Symbols integrados
- [ ] Sistema de temas creado

### Componentes UI
- [ ] Button
- [ ] Card
- [ ] Input
- [ ] Select
- [ ] Textarea
- [ ] MaterialIcon wrapper
- [ ] Skeleton
- [ ] EmptyState

### Pantallas
- [ ] Carga/Studio (rediseñada)
- [ ] Galería (rediseñada)
- [ ] Detalles de Pieza (nueva)
- [ ] Modificar Metadata (actualizada)
- [ ] Mis Catálogos (rediseñada)
- [ ] Agregar a Catálogo (rediseñada)
- [ ] Crear Catálogo (nueva)
- [ ] Catálogo Individual (nueva)
- [ ] Ajustes (rediseñada)
- [ ] Canvas Editor (rediseñado)

### Funcionalidades
- [ ] Sistema de temas funcional
- [ ] Animaciones implementadas
- [ ] Estados de carga
- [ ] Responsive design
- [ ] Accesibilidad

---

## 🚀 Orden de Implementación Recomendado

1. **Configuración del Sistema de Diseño** (Fase 1)
2. **Componentes Base** (Fase 2)
3. **Pantalla de Carga** (Fase 3.1)
4. **Galería** (Fase 3.2)
5. **Catálogos** (Fase 3.5, 3.6, 3.7, 3.8)
6. **Detalles y Metadata** (Fase 3.3, 3.4)
7. **Canvas Editor** (Fase 4.2)
8. **Ajustes y Temas** (Fase 3.9, 4.3)
9. **Optimización** (Fase 5)

---

## 💡 Notas Importantes

### Principios de Diseño a Seguir
1. **Minimalismo**: Menos es más, mucho espacio en blanco
2. **Consistencia**: Usar componentes reutilizables
3. **Sutileza**: Animaciones y transiciones suaves
4. **Claridad**: Jerarquía visual clara
5. **Premium**: Atención al detalle en cada elemento

### Decisiones de Diseño
- **Sin sombras fuertes**: Usar bordes sutiles en su lugar
- **Bordes redondeados**: `rounded-xl` como estándar
- **Spacing**: Generoso, usar `gap-4` o `gap-6` como mínimo
- **Tipografía**: Bold para títulos, normal para texto
- **Colores**: Nunca usar colores vibrantes, siempre tonos suaves

### Recursos
- [Material Symbols](https://fonts.google.com/icons)
- [Manrope Font](https://fonts.google.com/specimen/Manrope)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Última actualización**: 2025-11-28
**Próximo paso**: Fase 1 - Configuración del Sistema de Diseño
