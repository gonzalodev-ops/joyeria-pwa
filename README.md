# 💎 Joyería PWA - Bronze Canvas

Una Progressive Web App (PWA) moderna para procesar y gestionar imágenes de joyería con IA, diseñada con un enfoque mobile-first y una estética minimalista inspirada en bronce y canvas.

## ✨ Características

- 🎨 **Procesamiento Inteligente de Imágenes**
  - Eliminación automática de fondo con PhotoRoom
  - Análisis de metadatos con Gemini AI
  - Composición personalizada con fondos y logos

- 📱 **Mobile-First & PWA**
  - Diseño responsive optimizado para móviles
  - Instalable como app nativa
  - Funcionalidad offline (próximamente)

- 🎭 **Sistema de Diseño "Bronze Canvas"**
  - 4 temas visuales (Bronze Canvas, Gold Cream, Silver Blue, Mauve Copper)
  - Componentes UI reutilizables
  - Iconografía con Google Material Symbols

- 📚 **Gestión de Catálogos**
  - Creación y organización de catálogos
  - Ordenamiento drag-and-drop
  - Compartir catálogos (próximamente)

- 🔍 **Galería Avanzada**
  - Filtrado y búsqueda
  - Selección múltiple
  - Edición de metadatos

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta de Supabase
- API Keys de:
  - Google Gemini AI
  - PhotoRoom
  - Cloudinary

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd joyeria-pwa
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   # Supabase
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

   # Cloudinary
   VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
   ```

4. **Configurar Supabase Edge Functions**
   
   Las API keys sensibles (Gemini, PhotoRoom) se gestionan mediante Edge Functions:
   
   ```bash
   cd supabase/functions
   
   # Configurar secrets
   supabase secrets set GEMINI_API_KEY=tu_gemini_key
   supabase secrets set PHOTOROOM_API_KEY=tu_photoroom_key
   
   # Deployar functions
   supabase functions deploy analyze-image
   supabase functions deploy remove-background
   ```

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo con HMR

# Producción
npm run build        # Construye la app para producción
npm run preview      # Preview de la build de producción

# Linting
npm run lint         # Ejecuta ESLint
```

## 🏗️ Arquitectura

```
joyeria-pwa/
├── src/
│   ├── components/       # Componentes React
│   │   ├── ui/          # Componentes UI base (Button, Card, etc.)
│   │   ├── Gallery.tsx
│   │   ├── CanvasEditor.tsx
│   │   └── ...
│   ├── contexts/        # React Contexts (Settings, Theme)
│   ├── services/        # Servicios (database, gemini, cloudinary)
│   ├── lib/            # Utilidades y helpers
│   │   ├── errors.ts   # Sistema de manejo de errores
│   │   ├── validation.ts # Validación de archivos
│   │   └── utils.ts
│   ├── views/          # Vistas principales
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── functions/      # Edge Functions
├── public/            # Assets estáticos
└── ...
```

## 🎨 Sistema de Diseño

El proyecto utiliza el sistema de diseño "Bronze Canvas" con variables CSS personalizadas:

```css
/* Tema Bronze Canvas (default) */
--bronze-canvas-background: #f8f6f3
--bronze-canvas-surface: #ffffff
--bronze-canvas-primary-text: #2c2418
--bronze-canvas-accent: #8b6f47
...
```

### Componentes UI Disponibles

- `<Button>` - Botones con variantes (primary, secondary, ghost, danger)
- `<Card>` - Tarjetas con sombras y bordes
- `<Input>` - Campos de entrada
- `<Select>` - Selectores dropdown
- `<MaterialIcon>` - Iconos de Material Symbols

## 🔐 Seguridad

- ✅ API keys protegidas mediante Supabase Edge Functions
- ✅ Validación robusta de archivos (MIME type, magic numbers, dimensiones)
- ✅ Sanitización de nombres de archivo
- ⏳ Rate limiting (próximamente)
- ⏳ Autenticación de usuarios (próximamente)

## 📊 Base de Datos (Supabase)

### Tablas Principales

- `images` - Imágenes procesadas con metadatos
- `catalogs` - Catálogos de joyería
- `catalog_images` - Relación many-to-many entre catálogos e imágenes

Ver `supabase/migrations/` para el schema completo.

## 🧪 Testing

> ⚠️ **En desarrollo**: La suite de testing está planificada para la Fase 4 del roadmap.

```bash
# Próximamente
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

## 🚧 Roadmap

### ✅ Completado
- [x] Sistema de diseño Bronze Canvas
- [x] Procesamiento de imágenes con IA
- [x] Gestión de catálogos
- [x] Galería con filtros
- [x] Sistema de manejo de errores

### 🔄 En Progreso (Fase 1: Estabilización)
- [ ] ErrorBoundary mejorado
- [ ] Validación robusta de archivos
- [ ] Documentación completa
- [ ] Auditoría de accesibilidad

### 📅 Próximas Fases
- **Fase 2**: Refactorización de código
- **Fase 3**: Optimizaciones de performance
- **Fase 4**: Testing y QA
- **Fase 5**: Mejoras de UX
- **Fase 6**: Resiliencia y monitoreo

Ver `OPTIMIZATION_AND_DEBT_REPORT.md` para el plan completo.

## 🤝 Contribución

> Este es un proyecto personal, pero las sugerencias son bienvenidas.

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y no tiene licencia pública.

## 🙏 Agradecimientos

- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Supabase](https://supabase.com/) - Backend as a Service
- [Cloudinary](https://cloudinary.com/) - Media management
- [Google Gemini](https://ai.google.dev/) - AI analysis
- [PhotoRoom](https://www.photoroom.com/) - Background removal
- [Material Symbols](https://fonts.google.com/icons) - Iconography

## 📧 Contacto

Para preguntas o soporte, contacta al desarrollador.

---

**Hecho con ❤️ y ☕**
