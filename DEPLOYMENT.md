# 🚀 Guía de Despliegue - Jewelry AI Studio

## 📋 Paso 1: Subir a GitHub

### 1.1 Inicializar Git
```bash
git init
git add .
git commit -m "Initial commit: Jewelry AI Studio PWA"
```

### 1.2 Crear Repositorio en GitHub
1. Ve a [github.com](https://github.com)
2. Click en el botón **"+"** → **"New repository"**
3. Nombre: `joyeria-pwa` (o el que prefieras)
4. Descripción: `Progressive Web App para procesamiento de imágenes de joyería con IA`
5. **NO** marques "Initialize with README" (ya tienes archivos)
6. Click **"Create repository"**

### 1.3 Conectar y Subir
```bash
# Reemplaza 'TU-USUARIO' con tu usuario de GitHub
git remote add origin https://github.com/TU-USUARIO/joyeria-pwa.git
git branch -M main
git push -u origin main
```

---

## 🌐 Paso 2: Desplegar en Vercel (Recomendado)

### 2.1 Preparar Variables de Entorno
Antes de desplegar, necesitas configurar estas variables en Vercel:

```
VITE_GEMINI_API_KEY=tu-api-key-aqui
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=tu-preset
VITE_SUPABASE_URL=tu-supabase-url
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_PHOTOROOM_API_KEY=tu-photoroom-key (opcional)
```

### 2.2 Desplegar con Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Importa tu repositorio de GitHub
4. Configuración:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Environment Variables:**
   - Click en **"Environment Variables"**
   - Agrega todas las variables de `.env.local`
   - ⚠️ **IMPORTANTE:** No incluyas el archivo `.env.local` en Git

6. Click **"Deploy"**

### 2.3 Configurar Dominio (Opcional)
- Vercel te da un dominio gratis: `tu-proyecto.vercel.app`
- Puedes agregar un dominio personalizado en Settings → Domains

---

## 🔧 Paso 3: Configurar Supabase Edge Functions

Si usas Edge Functions para Gemini, necesitas desplegarlas:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Desplegar functions
cd supabase
supabase functions deploy analyze-image
```

---

## 📱 Paso 4: Configurar PWA (Opcional)

Para que la app sea instalable:

1. Instalar plugin PWA:
```bash
npm install -D vite-plugin-pwa
```

2. Actualizar `vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Jewelry AI Studio',
        short_name: 'Jewelry AI',
        description: 'Procesamiento de imágenes de joyería con IA',
        theme_color: '#3b82f6',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

---

## ✅ Checklist Pre-Despliegue

- [ ] `.gitignore` incluye `.env` y `.env.local`
- [ ] `.env.local.example` tiene todas las variables (sin valores)
- [ ] Código compilado sin errores: `npm run build`
- [ ] Variables de entorno configuradas en Vercel
- [ ] Supabase Edge Functions desplegadas (si aplica)
- [ ] URLs de Cloudinary y Supabase son de producción

---

## 🔒 Seguridad

### ⚠️ NUNCA subas a Git:
- `.env`
- `.env.local`
- API keys en el código
- Credenciales de bases de datos

### ✅ Siempre usa:
- Variables de entorno
- `.env.local.example` (sin valores reales)
- Edge Functions para llamadas a APIs sensibles

---

## 🐛 Troubleshooting

### Error: "VITE_XXX is not defined"
- Verifica que las variables estén en Vercel
- Asegúrate de que empiecen con `VITE_`
- Re-deploya después de agregar variables

### Error: "Failed to fetch"
- Verifica CORS en Supabase
- Verifica que las URLs sean correctas
- Revisa Network tab en DevTools

### Build falla en Vercel
- Ejecuta `npm run build` localmente primero
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Vercel

---

## 📊 Monitoreo Post-Despliegue

1. **Vercel Analytics:** Automático, revisa en el dashboard
2. **Lighthouse:** Corre en Chrome DevTools
3. **Supabase Logs:** Revisa uso de base de datos
4. **Cloudinary Usage:** Monitorea transformaciones

---

## 🔄 Actualizaciones Futuras

Para actualizar tu app desplegada:

```bash
# 1. Hacer cambios en código
# 2. Commit
git add .
git commit -m "Descripción de cambios"

# 3. Push (Vercel auto-deploya)
git push origin main
```

---

**¿Listo para empezar? Ejecuta los comandos del Paso 1.1** 🚀
